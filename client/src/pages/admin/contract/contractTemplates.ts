import type { ContractTemplate } from '../../../api/contractApi';

export interface FieldDef { key: string; label: string; type?: 'text' | 'date' | 'number' | 'textarea'; placeholder?: string; }
export interface FieldGroup { title: string; fields: FieldDef[]; }
export interface Clause { title: string; text: string; }
export interface TemplateDef {
  key: ContractTemplate;
  label: string;
  desc: string;
  partyA: string;   // 갑
  partyB: string;   // 을
  groups: FieldGroup[];
  clauses: (d: Record<string, string>) => Clause[];
  defaults?: Record<string, string>;
}

const g = (d: Record<string, string>, k: string, fb = '________') => (d[k]?.toString().trim() ? d[k] : fb);
const won = (d: Record<string, string>, k: string) => (d[k]?.toString().trim() ? `₩${Number(d[k]).toLocaleString()}` : '________');

const party = (p: 'a' | 'b', title: string): FieldGroup => ({
  title,
  fields: [
    { key: `${p}_name`, label: '상호 / 성명' },
    { key: `${p}_rep`, label: '대표자' },
    { key: `${p}_reg`, label: '사업자/주민등록번호' },
    { key: `${p}_contact`, label: '연락처' },
    { key: `${p}_addr`, label: '주소' },
  ],
});
const baseGroup: FieldGroup = { title: '계약 기본', fields: [{ key: 'contract_date', label: '계약일', type: 'date' }, { key: 'amount', label: '계약(대금) 금액(원)', type: 'number' }] };
const KLIPSE = 'Klipse(클립스)';

export const TEMPLATES: Record<ContractTemplate, TemplateDef> = {
  freelancer: {
    key: 'freelancer', label: '프리랜서 계약서', desc: 'DJ·외주 등 프리랜서 용역 계약',
    partyA: '의뢰인(갑)', partyB: '프리랜서(을)',
    defaults: { a_name: KLIPSE },
    groups: [
      baseGroup,
      { title: '용역 내용', fields: [
        { key: 'service', label: '용역 내용', type: 'textarea', placeholder: '예: OO행사 DJ 공연 등' },
        { key: 'period_start', label: '계약 시작일', type: 'date' },
        { key: 'period_end', label: '계약 종료일', type: 'date' },
        { key: 'pay_method', label: '보수 지급 방법', placeholder: '예: 행사 종료 후 7일 이내 계좌이체' },
        { key: 'special', label: '특약사항', type: 'textarea' },
      ] },
      party('a', '갑 (의뢰인)'), party('b', '을 (프리랜서)'),
    ],
    clauses: (d) => [
      { title: '제1조 (목적)', text: '본 계약은 갑이 을에게 위탁하는 용역의 수행 및 보수 지급에 관한 사항을 정함을 목적으로 한다.' },
      { title: '제2조 (용역 내용)', text: `을이 수행할 용역은 다음과 같다.\n${g(d, 'service')}` },
      { title: '제3조 (계약기간)', text: `${g(d, 'period_start')} 부터 ${g(d, 'period_end')} 까지로 한다.` },
      { title: '제4조 (보수 및 지급)', text: `갑은 을에게 보수 ${won(d, 'amount')}을 지급하며, 지급방법은 ${g(d, 'pay_method')}(으)로 한다.` },
      { title: '제5조 (성실의무)', text: '을은 선량한 관리자의 주의로써 용역을 성실히 수행한다.' },
      { title: '제6조 (비밀유지)', text: '양 당사자는 본 계약의 이행 과정에서 알게 된 상대방의 영업·개인정보 등 비밀을 제3자에게 누설하지 아니한다.' },
      { title: '제7조 (계약해지)', text: '일방이 본 계약을 위반한 경우 상대방은 서면통지로써 본 계약을 해지할 수 있다.' },
      { title: '제8조 (특약사항)', text: g(d, 'special', '없음') },
    ],
  },

  construction_order: {
    key: 'construction_order', label: '시공 수주 계약서', desc: '고객으로부터 시공을 수주하는 도급 계약',
    partyA: '발주자(갑)', partyB: '수급인(을)',
    defaults: { b_name: KLIPSE },
    groups: [
      baseGroup,
      { title: '공사 내용', fields: [
        { key: 'project_name', label: '공사명' },
        { key: 'site', label: '공사 장소' },
        { key: 'period_start', label: '착공일', type: 'date' },
        { key: 'period_end', label: '준공일', type: 'date' },
        { key: 'warranty', label: '하자보수 기간', placeholder: '예: 준공 후 1년' },
        { key: 'pay_terms', label: '대금 지급 조건', placeholder: '예: 계약금 30% / 중도금 40% / 잔금 30%' },
        { key: 'special', label: '특약사항', type: 'textarea' },
      ] },
      party('a', '갑 (발주자)'), party('b', '을 (수급인)'),
    ],
    clauses: (d) => [
      { title: '제1조 (목적)', text: '본 계약은 갑이 을에게 도급하는 공사의 시공에 관한 권리·의무를 정함을 목적으로 한다.' },
      { title: '제2조 (공사 개요)', text: `공사명: ${g(d, 'project_name')}\n공사 장소: ${g(d, 'site')}` },
      { title: '제3조 (공사기간)', text: `착공 ${g(d, 'period_start')}, 준공 ${g(d, 'period_end')}(으)로 한다.` },
      { title: '제4조 (도급금액)', text: `총 도급금액은 ${won(d, 'amount')}(부가세 포함)으로 한다.` },
      { title: '제5조 (대금지급)', text: `대금 지급 조건은 ${g(d, 'pay_terms')}(으)로 한다.` },
      { title: '제6조 (하자보수)', text: `을은 ${g(d, 'warranty')} 동안 시공 하자에 대하여 무상으로 보수한다.` },
      { title: '제7조 (안전·관리)', text: '을은 공사 수행 시 산업안전보건 등 관련 법규를 준수하며, 안전사고에 대한 책임을 진다.' },
      { title: '제8조 (특약사항)', text: g(d, 'special', '없음') },
    ],
  },

  event_order: {
    key: 'event_order', label: '행사 수주 계약서', desc: '행사 대행을 수주하는 계약',
    partyA: '발주자(갑)', partyB: '대행사(을)',
    defaults: { b_name: KLIPSE },
    groups: [
      baseGroup,
      { title: '행사 내용', fields: [
        { key: 'event_name', label: '행사명' },
        { key: 'event_datetime', label: '행사 일시', placeholder: '예: 2026-08-01 19:00' },
        { key: 'venue', label: '행사 장소' },
        { key: 'scope', label: '대행 범위', type: 'textarea', placeholder: '예: 무대·음향·DJ·진행 등' },
        { key: 'cancel_terms', label: '취소·환불 규정', type: 'textarea' },
        { key: 'special', label: '특약사항', type: 'textarea' },
      ] },
      party('a', '갑 (발주자)'), party('b', '을 (대행사)'),
    ],
    clauses: (d) => [
      { title: '제1조 (목적)', text: '본 계약은 갑이 을에게 위탁하는 행사 대행 업무에 관한 사항을 정함을 목적으로 한다.' },
      { title: '제2조 (행사 개요)', text: `행사명: ${g(d, 'event_name')}\n일시: ${g(d, 'event_datetime')}\n장소: ${g(d, 'venue')}` },
      { title: '제3조 (대행 범위)', text: g(d, 'scope') },
      { title: '제4조 (대행 대금)', text: `대행 대금은 ${won(d, 'amount')}(으)로 한다.` },
      { title: '제5조 (취소 및 환불)', text: g(d, 'cancel_terms', '천재지변 등 불가항력을 제외하고, 취소 시점에 따라 상호 협의한 위약 규정을 따른다.') },
      { title: '제6조 (책임)', text: '을은 행사가 정상적으로 진행되도록 성실히 이행하며, 을의 귀책으로 인한 손해는 을이 배상한다.' },
      { title: '제7조 (특약사항)', text: g(d, 'special', '없음') },
    ],
  },

  rental_handover: {
    key: 'rental_handover', label: '렌탈 인수 계약서', desc: '렌탈 장비 인수(수령) 확인 계약',
    partyA: '공급자(갑)', partyB: '인수자(을)',
    defaults: { a_name: KLIPSE },
    groups: [
      baseGroup,
      { title: '인수 내용', fields: [
        { key: 'items', label: '인수 물품 목록', type: 'textarea', placeholder: '예: 스피커 2대, 믹서 1대 ...' },
        { key: 'handover_date', label: '인수일', type: 'date' },
        { key: 'condition', label: '인수 시 상태', type: 'textarea', placeholder: '예: 외관 이상 없음, 정상 작동 확인' },
        { key: 'return_date', label: '반납 예정일', type: 'date' },
        { key: 'special', label: '특약사항', type: 'textarea' },
      ] },
      party('a', '갑 (공급자)'), party('b', '을 (인수자)'),
    ],
    clauses: (d) => [
      { title: '제1조 (목적)', text: '본 계약은 갑이 을에게 인도하는 렌탈 물품의 인수 확인 및 관리 책임에 관한 사항을 정한다.' },
      { title: '제2조 (인수 물품)', text: g(d, 'items') },
      { title: '제3조 (인수일)', text: `물품 인수일은 ${g(d, 'handover_date')}(으)로 한다.` },
      { title: '제4조 (상태 확인)', text: `을은 인수 시 물품 상태를 확인하였다.\n${g(d, 'condition')}` },
      { title: '제5조 (반납)', text: `을은 ${g(d, 'return_date')}까지 인수 당시 상태로 반납한다.` },
      { title: '제6조 (손해배상)', text: '을의 고의·과실로 물품이 훼손·분실된 경우 을은 이를 원상복구하거나 손해를 배상한다.' },
      { title: '제7조 (특약사항)', text: g(d, 'special', '없음') },
    ],
  },

  rental: {
    key: 'rental', label: '렌탈 계약서', desc: '렌탈(임대) 계약',
    partyA: '임대인(갑)', partyB: '임차인(을)',
    defaults: { a_name: KLIPSE },
    groups: [
      baseGroup,
      { title: '렌탈 내용', fields: [
        { key: 'items', label: '렌탈 품목', type: 'textarea' },
        { key: 'period_start', label: '렌탈 시작일', type: 'date' },
        { key: 'period_end', label: '렌탈 종료일', type: 'date' },
        { key: 'deposit', label: '보증금(원)', type: 'number' },
        { key: 'damage', label: '파손·분실 책임', type: 'textarea' },
        { key: 'special', label: '특약사항', type: 'textarea' },
      ] },
      party('a', '갑 (임대인)'), party('b', '을 (임차인)'),
    ],
    clauses: (d) => [
      { title: '제1조 (목적)', text: '본 계약은 갑이 소유한 물품을 을에게 유상으로 임대함에 관한 사항을 정함을 목적으로 한다.' },
      { title: '제2조 (렌탈 품목)', text: g(d, 'items') },
      { title: '제3조 (렌탈 기간)', text: `${g(d, 'period_start')} 부터 ${g(d, 'period_end')} 까지로 한다.` },
      { title: '제4조 (렌탈료)', text: `렌탈료는 ${won(d, 'amount')}(으)로 한다.` },
      { title: '제5조 (보증금)', text: `보증금은 ${won(d, 'deposit')}(으)로 하며, 반납 및 정산 후 환급한다.` },
      { title: '제6조 (반납 및 원상복구)', text: '을은 렌탈 기간 종료 시 물품을 인수 당시 상태로 반납하며, 통상적 마모를 제외한 훼손은 원상복구한다.' },
      { title: '제7조 (파손·분실)', text: g(d, 'damage', '을의 귀책으로 인한 파손·분실 시 을은 수리비 또는 물품 가액을 배상한다.') },
      { title: '제8조 (특약사항)', text: g(d, 'special', '없음') },
    ],
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);
