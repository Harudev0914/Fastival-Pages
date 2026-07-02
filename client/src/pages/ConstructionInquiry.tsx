import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../supabaseClient';
import { chatbotApi, inquiryApi } from '../api/constructionApi';
import { useNavigate } from 'react-router-dom';
import SocialAuthButtons from '../components/SocialAuthButtons';

interface Question {
  id: number;
  title: string;
  type: 'radio' | 'checkbox' | 'select' | 'text' | 'file' | 'application';
  options: string[];
  display_order: number;
  use_categories?: boolean;
  is_active?: boolean;
}

// 신청 폼 필드 유효성 (이름 / 휴대폰 / 이메일)
const isNameValid = (v: string) => /^[가-힣a-zA-Z][가-힣a-zA-Z\s]{1,}$/.test(v.trim());
const isPhoneValid = (v: string) => /^01[016789]\d{3,4}\d{4}$/.test(v.replace(/[^0-9]/g, ''));
const isEmailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v.trim());

const ConstructionInquiry: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [messages, setMessages] = useState<{ id: number; type: 'bot' | 'user'; content: React.ReactNode; step: number }[]>([]);
  const [answers, setAnswers] = useState<Record<number, string | any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [userInfo, setUserInfo] = useState({ name: '', phone: '', email: '' });
  const [fileName, setFileName] = useState('');
  const [privacyAgree, setPrivacyAgree] = useState(false);
  const [marketingAgree, setMarketingAgree] = useState(false);
  const [typing, setTyping] = useState(false);   // 봇 입력중(…) 표시

  const handleApplySubmit = (step: number) => {
    // 버튼은 유효할 때만 노출되지만, 안전을 위해 한 번 더 검증
    if (!isNameValid(userInfo.name) || !isPhoneValid(userInfo.phone) || !isEmailValid(userInfo.email) || !privacyAgree) return;
    handleNext(step, '신청완료');
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastBotRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById('inquiry-header-portal'));

    // 질문 목록은 인증 조회와 독립적으로 즉시 가져와 화면을 빠르게 렌더링한다.
    const loadQuestions = async () => {
      // 활성 질문 + 카테고리 연동 옵션 치환을 API에서 처리
      const { data, error } = await chatbotApi.loadPublic();
      if (error) console.error('챗봇 로드 오류:', error);
      const prepared = (data || []) as unknown as Question[];
      setQuestions(prepared);
      if (prepared.length > 0) {
        setMessages([{
          id: 0,
          type: 'bot',
          content: <div style={{ fontWeight: 700, color: '#121212' }}>{prepared[0].title}</div>,
          step: 0,
        }]);
      }
    };

    // 사용자 정보는 마지막 신청 단계에서만 필요하므로 질문 로딩을 막지 않고 병렬로 조회한다.
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserInfo({ name: user.user_metadata.name || '', phone: user.user_metadata.phone || '', email: user.email || '' });
      }
    };

    loadQuestions();
    loadUser();
  }, []);

  // 새 메시지가 추가될 때, 봇 질의가 화면 밖(아래)으로 생성되면 해당 버블로 부드럽게 스크롤한다.
  // 단, 처음 랜딩이 어색하지 않도록 질의 3번(step >= 2)부터, 그리고 완료 단계(step === -1)에서만 따라간다.
  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];

    const shouldFollow = last.step === -1 || last.step >= 2;
    if (!shouldFollow) return;

    const target = last.type === 'bot' ? lastBotRef.current : bottomRef.current;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const isOffscreen = rect.bottom > window.innerHeight || rect.top < 0;
    if (isOffscreen) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: last.type === 'bot' ? 'center' : 'end' });
      });
    }
  }, [messages]);

  // 입력중(…) 애니메이션 동안에는 자동 스크롤하지 않는다 (생성될 메시지로 이동 방지)
  // 실제 메시지가 등장한 뒤에만 위 messages 효과에서 필요 시 스크롤한다.

  const handleNext = (step: number, answer: string | any) => {
    const newAnswers = { ...answers, [step]: answer };
    setAnswers(newAnswers);
    setMessages(prev => [...prev.slice(0, step * 2 + 1), { id: step + 1, type: 'user', content: typeof answer === 'string' ? answer : '답변 완료', step }]);
    
    const nextStep = step + 1;
    if (nextStep < questions.length) {
      setCurrentStep(nextStep);
      // 봇이 "입력중…" 표시 후 잠시 뒤 자연스럽게 질의 등장
      setTyping(true);
      window.setTimeout(() => {
        setTyping(false);
        setMessages(prev => [...prev, { id: nextStep + 1, type: 'bot', content: <div style={{ fontWeight: 700, color: '#121212' }}>{questions[nextStep].title}</div>, step: nextStep }]);
      }, 700);
    } else {
      finalize(newAnswers);
    }
  };

  // 최종 단계: 질의/응답 + 신청자 정보를 시공 문의 내역으로 저장 후 완료 안내
  const finalize = async (allAnswers: Record<number, string | any>) => {
    const pairs = questions
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => q.type !== 'application' && q.type !== 'file')
      .map(({ q, i }) => {
        const v = allAnswers[i];
        return { question: q.title, answer: v == null || v === 'skipped' ? '건너뜀' : String(v) };
      });

    const { error } = await inquiryApi.submit({
      name: userInfo.name,
      phone: userInfo.phone,
      email: userInfo.email,
      file_name: fileName,
      answers: pairs,
      privacy_agree: privacyAgree,
      marketing_agree: marketingAgree,
    });
    if (error) console.error('문의 저장 오류:', error);

    await checkAuthAndComplete();
  };

  const checkAuthAndComplete = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const content = session ? (
      // 회원: 시공 문의 등록 완료 뷰
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontWeight: 700, color: '#121212' }}>시공 문의가 정상적으로 접수되었습니다 🎉</div>
        <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>담당자가 확인 후 빠르게 연락드리겠습니다. 감사합니다!</p>
      </div>
    ) : (
      // 비회원: 회원가입 유도 — 홈페이지가 지원하는 로그인 방식(소셜) + 이메일
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontWeight: 700, color: '#121212' }}>문의가 접수되었어요!</div>
        <p style={{ color: '#475569', fontSize: '0.86rem', margin: '0 0 4px' }}>진행 상황을 받아보시려면 가입해 주세요.</p>
        <SocialAuthButtons verb="시작하기" />
        <button onClick={() => navigate('/signup')} style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#fff', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
          이메일로 시작하기
        </button>
      </div>
    );
    // 완료/가입 안내도 "입력중…" 후 자연스럽게 등장
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { id: 99, type: 'bot', content, step: -1 }]);
    }, 800);
  };

  return (
    <div className="chat-container" ref={scrollRef}>
      {portalTarget && createPortal(
        <div style={{ marginTop: '0px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '15px', width: '100%' }}>
            <div className="inquiry-top-header" style={{ margin: '0 auto', width: '100%', maxWidth: '600px', paddingTop: '0px' }}>
            <div className="inquiry-title" style={{ fontWeight: 800, color: 'rgb(18, 18, 18)', margin: '0px' }}>음향 컨설팅 신청</div>
            <p className="inquiry-desc" style={{ color: 'rgb(100, 116, 139)', marginTop: '4px' }}>전문가가 고객님의 공간에 딱 맞는 사운드를 찾아드립니다.</p>
            
            {/* Progress Bar */}
            {questions.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgb(100, 116, 139)' }}>진행률</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgb(79, 70, 229)' }}>
                    {Math.round(((currentStep) / questions.length) * 100)}%
                    </span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'rgb(226, 232, 240)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                    height: '100%', 
                    backgroundColor: 'rgb(79, 70, 229)', 
                    width: `${((currentStep) / questions.length) * 100}%`,
                    transition: 'width 0.3s ease-in-out'
                    }}></div>
                </div>
                </div>
            )}
            </div>
        </div>,
        portalTarget
      )}

      <div className="chat-content">
        {questions.length > 0 && messages.map((msg, index) => (
          <div
            key={index}
            ref={msg.type === 'bot' && index === messages.length - 1 ? lastBotRef : undefined}
            className={`message-wrapper ${msg.type}`}
          >
            <div className={`chat-bubble ${msg.type}`}>
              <div className="chat-inner-content">{msg.content}</div>
              
              {msg.type === 'bot' && msg.step !== -1 && msg.step === currentStep && questions[msg.step].type === 'text' && (
                <div className="options-container">
                  <div className="text-answer">
                    <textarea
                      className="text-answer__input"
                      maxLength={300}
                      placeholder="내용을 자유롭게 입력해주세요"
                      value={typeof answers[msg.step] === 'string' && answers[msg.step] !== 'skipped' ? answers[msg.step] : ''}
                      onChange={(e) => setAnswers({ ...answers, [msg.step]: e.target.value })}
                    />
                    <span className="text-answer__counter">
                      {(typeof answers[msg.step] === 'string' && answers[msg.step] !== 'skipped' ? answers[msg.step].length : 0)}/300자
                    </span>
                  </div>
                  <div className="control-buttons">
                    <button className="control-btn skip" onClick={() => handleNext(msg.step, 'skipped')}>건너뛰기</button>
                    <button className="control-btn next" onClick={() => handleNext(msg.step, answers[msg.step] || '')}>다음</button>
                  </div>
                </div>
              )}

              {msg.type === 'bot' && msg.step !== -1 && msg.step === currentStep && (questions[msg.step].type === 'application' || questions[msg.step].type === 'file') && (() => {
                // 실시간 유효성: 값이 있는데 형식이 틀리면 에러 표기
                const nameErr = userInfo.name.trim() !== '' && !isNameValid(userInfo.name) ? '이름을 정확히 입력해주세요. (2자 이상, 한글 또는 영문)' : '';
                const phoneErr = userInfo.phone.trim() !== '' && !isPhoneValid(userInfo.phone) ? '올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)' : '';
                const emailErr = userInfo.email.trim() !== '' && !isEmailValid(userInfo.email) ? '올바른 이메일 형식이 아닙니다. (예: name@example.com)' : '';
                const canSubmit = isNameValid(userInfo.name) && isPhoneValid(userInfo.phone) && isEmailValid(userInfo.email) && privacyAgree;
                return (
                <div className="form-container">
                  <div className="form-field">
                    <label className="form-label">이름 <span className="form-req">필수</span></label>
                    <input className={`form-input ${nameErr ? 'has-error' : ''}`} placeholder="이름을 입력해주세요" value={userInfo.name}
                      onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} />
                    {nameErr && <span className="form-error">{nameErr}</span>}
                  </div>
                  <div className="form-field">
                    <label className="form-label">연락처 <span className="form-req">필수</span></label>
                    <input className={`form-input ${phoneErr ? 'has-error' : ''}`} placeholder="010-0000-0000" inputMode="tel" value={userInfo.phone}
                      onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })} />
                    {phoneErr && <span className="form-error">{phoneErr}</span>}
                  </div>
                  <div className="form-field">
                    <label className="form-label">이메일 <span className="form-req">필수</span></label>
                    <input className={`form-input ${emailErr ? 'has-error' : ''}`} type="email" placeholder="example@email.com" value={userInfo.email}
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })} />
                    {emailErr && <span className="form-error">{emailErr}</span>}
                  </div>
                  <div className="form-field">
                    <label className="form-label">도면 <span className="form-optional">(선택)</span></label>
                    <label className="file-upload">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span className={fileName ? 'file-upload__name has-file' : 'file-upload__name'}>
                        {fileName || '도면 파일을 업로드해주세요'}
                      </span>
                      <input type="file" hidden onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} />
                    </label>
                  </div>
                  <div className="agree-box">
                    <label className="agree-row">
                      <input type="checkbox" checked={privacyAgree} onChange={(e) => setPrivacyAgree(e.target.checked)} />
                      <span><b className="agree-req">[필수]</b> 개인정보 활용 동의</span>
                    </label>
                    <label className="agree-row">
                      <input type="checkbox" checked={marketingAgree} onChange={(e) => setMarketingAgree(e.target.checked)} />
                      <span><b className="agree-opt">[선택]</b> 마케팅 활용 동의</span>
                    </label>
                  </div>
                  <button className="form-submit" disabled={!canSubmit} onClick={() => handleApplySubmit(msg.step)}>신청하기</button>
                </div>
                );
              })()}

              {msg.type === 'bot' && msg.step !== -1 && msg.step === currentStep && questions[msg.step].type !== 'application' && questions[msg.step].type !== 'file' && questions[msg.step].type !== 'text' && (
                <div className="options-container">
                  <div className={`options-list ${questions[msg.step].options.length > 5 ? 'scrollable' : ''}`}>
                    {questions[msg.step].options.map(opt => (
                      <button key={opt} onClick={() => handleNext(msg.step, opt)} className={`option-button ${answers[msg.step] === opt ? 'active' : ''}`}>
                        <span className="radio-indicator"></span>
                        {opt}
                      </button>
                    ))}
                  </div>
                  <div className="control-buttons">
                      <button className="control-btn skip" onClick={() => handleNext(msg.step, 'skipped')}>건너뛰기</button>
                      <button className="control-btn next" onClick={() => handleNext(msg.step, answers[msg.step] || '')}>다음</button>
                  </div>
                </div>
              )}
            </div>
            
            {msg.type === 'user' && (
              <button onClick={() => setCurrentStep(msg.step)} className="edit-button">수정</button>
            )}
          </div>
        ))}
        {typing && (
          <div className="message-wrapper bot">
            <div className="chat-bubble bot typing">
              <span className="typing-dots"><i /><i /><i /></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <style>{`
        .chat-container { background-color: rgb(239, 241, 245); min-height: 100vh; display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 100%; overflow-x: hidden; box-sizing: border-box; }
        
        .inquiry-title { font-size: 1.4rem; word-break: keep-all; overflow-wrap: break-word; white-space: normal; }
        .inquiry-desc { font-size: 0.8rem; word-break: keep-all; overflow-wrap: break-word; white-space: normal; }
        
        @media (max-width: 768px) {
            .inquiry-title { font-size: 1.2rem; }
            .inquiry-desc { font-size: 0.75rem; }
            .inquiry-top-header { padding: 16px !important; }
        }
        
        .inquiry-top-header { width: 100%; max-width: 600px; padding: 20px 0; text-align: center; margin: 0 auto; box-sizing: border-box; min-width: 0; }
        .chat-content { width: 100%; max-width: 600px; display: flex; flex-direction: column; gap: 16px; margin-top: 24px; padding: 0 20px 40px; box-sizing: border-box; min-width: 0; flex: 1; }

        /* flex:1 을 제거해 대화가 적을 때 버블이 늘어나며 생기던 큰 공백을 없앤다 */
        .message-wrapper { display: flex; flex-direction: column; width: 100%; min-width: 0; flex: 0 0 auto; }
        .message-wrapper.user { align-items: flex-end; }
        .message-wrapper.bot { align-items: flex-start; }

        .chat-bubble { padding: 14px; max-width: 85%; box-shadow: rgba(0,0,0,0.05) 0 2px 5px; background-color: #ffffff; font-size: 0.9rem; word-break: keep-all; overflow-wrap: break-word; white-space: normal; animation: msgIn 0.32s cubic-bezier(0.22,1,0.36,1) both; }
        .chat-bubble.bot { color: #121212; border-radius: 16px 16px 16px 0; }
        .chat-bubble.user { background-color: #465162; color: #ffffff; font-weight: bold; border-radius: 16px 16px 0 16px; }
        @keyframes msgIn { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: none; } }

        /* 봇 입력중(…) 인디케이터 */
        .chat-bubble.typing { display: inline-flex; align-items: center; padding: 15px 16px; }
        .typing-dots { display: inline-flex; align-items: center; gap: 5px; }
        .typing-dots i { width: 7px; height: 7px; border-radius: 50%; background: #c3ccd8; display: inline-block; animation: typingBounce 1.2s infinite ease-in-out; }
        .typing-dots i:nth-child(2) { animation-delay: 0.15s; }
        .typing-dots i:nth-child(3) { animation-delay: 0.3s; }
        @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.45; } 30% { transform: translateY(-5px); opacity: 1; } }
        
        .chat-inner-content { font-size: 0.9rem; }
        .chat-bubble.bot .chat-inner-content { font-weight: bold; color: #121212; }

        .options-container { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; width: 100%; min-width: 0; }
        .options-list { display: flex; flex-direction: column; gap: 8px; width: 100%; min-width: 0; }
        .options-list.scrollable { max-height: 250px; overflow-y: auto; scrollbar-width: none; }
        
        .option-button { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 9999px; background: #fff; cursor: pointer; text-align: left; width: 100%; font-size: 0.9rem; color: #121212; transition: all 0.2s; word-break: keep-all; }
        .option-button:hover { border-color: #94a3b8; }
        .option-button.active { border-color: #2563eb; background-color: #eff6ff; }
        .radio-indicator { width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 50%; flex-shrink: 0; position: relative; display: flex; align-items: center; justify-content: center; }
        .option-button.active .radio-indicator { border-color: #2563eb; }
        .option-button.active .radio-indicator::after { content: ''; width: 10px; height: 10px; background-color: #2563eb; border-radius: 50%; }
        
        .control-buttons { display: flex; gap: 10px; margin-top: 10px; width: 100%; }
        .control-btn { padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer; font-size: 0.85rem; font-weight: 600; flex: 1; }
        .control-btn.skip { background-color: #e2e8f0; color: #64748b; }
        .control-btn.next { background-color: #2563eb; color: #fff; }

        /* 텍스트 입력형 답변 */
        .text-answer { position: relative; width: 100%; }
        .text-answer__input { width: 100%; min-height: 96px; resize: vertical; padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 0.9rem; font-family: inherit; color: #121212; outline: none; box-sizing: border-box; transition: border-color 0.15s; }
        .text-answer__input:focus { border-color: #2563eb; }
        .text-answer__counter { position: absolute; right: 12px; bottom: 10px; font-size: 0.72rem; color: #94a3b8; pointer-events: none; }

        /* 신청 폼 (라벨 + 입력창) */
        .form-container { display: flex; flex-direction: column; gap: 14px; margin-top: 14px; width: 100%; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 0.82rem; font-weight: 600; color: #334155; }
        .form-optional { font-weight: 400; color: #94a3b8; }
        .form-req { margin-left: 4px; font-size: 0.7rem; font-weight: 700; color: #dc2626; background: #fef2f2; padding: 1px 6px; border-radius: 999px; vertical-align: middle; }
        .form-input { padding: 11px 14px; border: 1px solid #e2e8f0; border-radius: 10px; width: 100%; font-size: 0.9rem; font-family: inherit; outline: none; box-sizing: border-box; transition: border-color 0.15s; }
        .form-input:focus { border-color: #2563eb; }
        .form-input.has-error { border-color: #dc2626; }
        .form-error { display: block; margin-top: 5px; font-size: 0.78rem; color: #dc2626; }
        .form-hint { margin: 4px 0 0; padding: 11px 12px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; font-size: 0.8rem; color: #64748b; text-align: center; line-height: 1.5; }
        .form-hint b { color: #dc2626; }
        .file-upload { display: flex; align-items: center; gap: 8px; padding: 11px 14px; border: 1px dashed #cbd5e1; border-radius: 10px; cursor: pointer; transition: border-color 0.15s, background 0.15s; }
        .file-upload:hover { border-color: #2563eb; background: #f8fafc; }
        .file-upload__name { font-size: 0.86rem; color: #94a3b8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .file-upload__name.has-file { color: #2563eb; font-weight: 600; }
        .agree-box { display: flex; flex-direction: column; gap: 8px; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; }
        .agree-row { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #334155; cursor: pointer; }
        .agree-row input { width: 16px; height: 16px; accent-color: #2563eb; cursor: pointer; }
        .agree-req { color: #dc2626; font-weight: 700; }
        .agree-opt { color: #64748b; font-weight: 700; }
        .form-submit { margin-top: 4px; padding: 13px; background-color: #2563eb; color: #fff; border: none; border-radius: 10px; cursor: pointer; font-size: 0.95rem; font-weight: 700; transition: background-color 0.15s; }
        .form-submit:hover:not(:disabled) { background-color: #1d4ed8; }
        .form-submit:disabled { background-color: #cbd5e1; cursor: not-allowed; }
        
        .edit-button { font-size: 0.75rem; color: #2563eb; background: none; border: none; cursor: pointer; font-weight: 600; margin-top: 5px; }
      `}</style>
    </div>
  );
};

export default ConstructionInquiry;
