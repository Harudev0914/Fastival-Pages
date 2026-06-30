import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../supabaseClient';
import { chatbotApi, inquiryApi } from '../api/constructionApi';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: number;
  title: string;
  type: 'radio' | 'checkbox' | 'select' | 'text' | 'file' | 'application';
  options: string[];
  display_order: number;
  use_categories?: boolean;
  is_active?: boolean;
}

const ConstructionInquiry: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [messages, setMessages] = useState<{ id: number; type: 'bot' | 'user'; content: React.ReactNode; step: number }[]>([]);
  const [answers, setAnswers] = useState<Record<number, string | any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [userInfo, setUserInfo] = useState({ name: '', phone: '', email: '' });
  const [fileName, setFileName] = useState('');
  const [privacyAgree, setPrivacyAgree] = useState(false);
  const [marketingAgree, setMarketingAgree] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string; email?: string }>({});

  // 신청 폼 유효성 검사 (이름 / 휴대폰 / 이메일 형식 검증)
  const validateApplication = (): boolean => {
    const errs: { name?: string; phone?: string; email?: string } = {};

    // 이름: 2자 이상, 한글/영문(공백 허용) — 숫자·특수문자 불가
    const name = userInfo.name.trim();
    if (!name) errs.name = '이름을 입력해주세요.';
    else if (!/^[가-힣a-zA-Z][가-힣a-zA-Z\s]{1,}$/.test(name)) errs.name = '이름을 정확히 입력해주세요. (2자 이상, 한글 또는 영문)';

    // 휴대폰: 숫자만 추출 후 010/011 등 유효 형식
    const phoneDigits = userInfo.phone.replace(/[^0-9]/g, '');
    if (!phoneDigits) errs.phone = '연락처를 입력해주세요.';
    else if (!/^01[016789]\d{3,4}\d{4}$/.test(phoneDigits)) errs.phone = '올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)';

    // 이메일: 표준 형식 + TLD 2자 이상
    const email = userInfo.email.trim();
    if (!email) errs.email = '이메일을 입력해주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) errs.email = '올바른 이메일 형식이 아닙니다. (예: name@example.com)';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleApplySubmit = (step: number) => {
    if (!validateApplication()) return;
    if (!privacyAgree) return;
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

  const handleNext = (step: number, answer: string | any) => {
    const newAnswers = { ...answers, [step]: answer };
    setAnswers(newAnswers);
    setMessages(prev => [...prev.slice(0, step * 2 + 1), { id: step + 1, type: 'user', content: typeof answer === 'string' ? answer : '답변 완료', step }]);
    
    const nextStep = step + 1;
    if (nextStep < questions.length) {
      setCurrentStep(nextStep);
      setMessages(prev => [...prev, { id: nextStep + 1, type: 'bot', content: <div style={{ fontWeight: 700, color: '#121212' }}>{questions[nextStep].title}</div>, step: nextStep }]);
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
    if (session) {
      // 회원: 시공 문의 등록 완료 뷰
      setMessages(prev => [...prev, { id: 99, type: 'bot', content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontWeight: 700, color: '#121212' }}>시공 문의가 정상적으로 접수되었습니다 🎉</div>
          <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>담당자가 확인 후 빠르게 연락드리겠습니다. 감사합니다!</p>
        </div>
      ), step: -1 }]);
    } else {
      // 비회원: 회원가입 유도 (카카오 / 이메일)
      setMessages(prev => [...prev, { id: 99, type: 'bot', content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontWeight: 700, color: '#121212' }}>문의가 접수되었어요!</div>
          <p style={{ color: '#475569', fontSize: '0.86rem', margin: '0 0 4px' }}>진행 상황을 받아보시려면 가입해 주세요.</p>
          <button onClick={() => navigate('/signup?provider=kakao')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#FEE500', color: '#191600', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.92rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#191600"><path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.77 1.86 5.2 4.65 6.57-.2.72-.74 2.66-.85 3.08-.13.52.19.51.4.37.17-.11 2.66-1.8 3.74-2.54.67.1 1.36.15 2.06.15 5.52 0 10-3.48 10-7.8S17.52 3 12 3z" /></svg>
            카카오톡 가입하기
          </button>
          <button onClick={() => navigate('/signup?provider=email')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.92rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
            이메일로 가입하기
          </button>
        </div>
      ), step: -1 }]);
    }
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

              {msg.type === 'bot' && msg.step !== -1 && msg.step === currentStep && (questions[msg.step].type === 'application' || questions[msg.step].type === 'file') && (
                <div className="form-container">
                  <div className="form-field">
                    <label className="form-label">이름</label>
                    <input className={`form-input ${formErrors.name ? 'has-error' : ''}`} placeholder="이름을 입력해주세요" value={userInfo.name}
                      onChange={(e) => { setUserInfo({ ...userInfo, name: e.target.value }); if (formErrors.name) setFormErrors({ ...formErrors, name: undefined }); }} />
                    {formErrors.name && <span className="form-error">{formErrors.name}</span>}
                  </div>
                  <div className="form-field">
                    <label className="form-label">연락처</label>
                    <input className={`form-input ${formErrors.phone ? 'has-error' : ''}`} placeholder="010-0000-0000" inputMode="tel" value={userInfo.phone}
                      onChange={(e) => { setUserInfo({ ...userInfo, phone: e.target.value }); if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined }); }} />
                    {formErrors.phone && <span className="form-error">{formErrors.phone}</span>}
                  </div>
                  <div className="form-field">
                    <label className="form-label">이메일</label>
                    <input className={`form-input ${formErrors.email ? 'has-error' : ''}`} type="email" placeholder="example@email.com" value={userInfo.email}
                      onChange={(e) => { setUserInfo({ ...userInfo, email: e.target.value }); if (formErrors.email) setFormErrors({ ...formErrors, email: undefined }); }} />
                    {formErrors.email && <span className="form-error">{formErrors.email}</span>}
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
                  <button
                    className="form-submit"
                    disabled={!privacyAgree}
                    onClick={() => handleApplySubmit(msg.step)}
                  >
                    신청하기
                  </button>
                </div>
              )}

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

        .chat-bubble { padding: 14px; max-width: 85%; box-shadow: rgba(0,0,0,0.05) 0 2px 5px; background-color: #ffffff; font-size: 0.9rem; word-break: keep-all; overflow-wrap: break-word; white-space: normal; }
        .chat-bubble.bot { color: #121212; border-radius: 16px 16px 16px 0; }
        .chat-bubble.user { background-color: #465162; color: #ffffff; font-weight: bold; border-radius: 16px 16px 0 16px; }
        
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
        .form-input { padding: 11px 14px; border: 1px solid #e2e8f0; border-radius: 10px; width: 100%; font-size: 0.9rem; font-family: inherit; outline: none; box-sizing: border-box; transition: border-color 0.15s; }
        .form-input:focus { border-color: #2563eb; }
        .form-input.has-error { border-color: #dc2626; }
        .form-error { display: block; margin-top: 5px; font-size: 0.78rem; color: #dc2626; }
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
