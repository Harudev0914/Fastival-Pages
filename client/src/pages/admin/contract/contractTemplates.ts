import type { ContractTemplate } from '../../../api/contractApi';

export interface FieldDef { key: string; label: string; type?: 'text' | 'date' | 'number' | 'textarea'; placeholder?: string; }
export interface FieldGroup { title: string; fields: FieldDef[]; }
export interface Clause { title: string; text: string; } // title = 조 제목(번호 제외) — 문서에서 제N조 자동 부여
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
const won = (d: Record<string, string>, k: string) => (d[k]?.toString().trim() ? `일금 ${Number(d[k]).toLocaleString()}원정(₩${Number(d[k]).toLocaleString()})` : '________');
const court = (d: Record<string, string>) => g(d, 'court', '「민사소송법」에 따른 관할 법원');

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
const baseGroup: FieldGroup = { title: '계약 기본', fields: [
  { key: 'contract_date', label: '계약 체결일', type: 'date' },
  { key: 'amount', label: '계약(대금) 금액(원)', type: 'number' },
  { key: 'court', label: '관할 법원', placeholder: '예: 서울중앙지방법원' },
] };
const KLIPSE = 'Klipse(클립스)';

// 여러 계약에 공통 적용되는 후단 표준 조항
const tail = (d: Record<string, string>, opts?: { ip?: boolean }): Clause[] => {
  const arr: Clause[] = [];
  arr.push({ title: '비밀유지 및 개인정보의 보호', text: '① 갑과 을은 본 계약의 이행 과정에서 알게 된 상대방의 영업비밀 및 개인정보를 상대방의 사전 서면동의 없이 제3자에게 누설하거나 본 계약의 목적 외로 사용하지 아니한다.\n② 개인정보의 수집·이용·제공 및 파기 등 처리에 관하여는 「개인정보 보호법」 등 관계 법령을 준수한다.\n③ 본 조의 의무는 본 계약이 종료 또는 해지된 이후에도 유효하다.' });
  if (opts?.ip) arr.push({ title: '지식재산권', text: '① 을이 본 계약에 따라 작성·제작한 산출물의 저작권 등 일체의 지식재산권은 갑이 약정된 대금을 전액 지급한 때에 갑에게 양도된다.\n② 을은 제1항의 산출물에 대한 갑의 이용에 대하여 저작인격권을 행사하지 아니한다.\n③ 을은 산출물이 제3자의 지식재산권을 침해하지 아니함을 보증하며, 이로 인한 분쟁 발생 시 을의 책임과 비용으로 이를 해결한다.' });
  arr.push({ title: '손해배상', text: '① 갑 또는 을이 본 계약상의 의무를 위반하여 상대방에게 손해를 입힌 경우 그 손해를 배상할 책임을 진다(「민법」 제390조).\n② 당사자 일방이 부담하는 배상책임은 고의 또는 중대한 과실이 있는 경우를 제외하고 본 계약 총액을 한도로 한다.' });
  arr.push({ title: '불가항력', text: '천재지변, 전쟁, 화재, 감염병의 확산, 정부의 행정명령 등 당사자가 통제할 수 없는 사유(이하 “불가항력”)로 인하여 계약의 전부 또는 일부를 이행할 수 없게 된 경우, 그 범위 안에서 당사자는 채무불이행의 책임을 지지 아니하며, 이행기의 연기 또는 계약의 해지 등에 관하여 상호 협의한다.' });
  arr.push({ title: '계약의 해제 및 해지', text: '① 당사자 일방이 본 계약을 위반한 경우 상대방은 상당한 기간(14일 이상)을 정하여 그 시정을 서면으로 최고하고, 그 기간 내에 시정되지 아니하는 때에는 본 계약을 해제 또는 해지할 수 있다(「민법」 제544조).\n② 제1항에 따른 계약의 해제·해지는 상대방에 대한 손해배상의 청구에 영향을 미치지 아니한다.' });
  arr.push({ title: '권리·의무의 양도 금지', text: '당사자는 상대방의 사전 서면동의 없이 본 계약상의 권리 또는 의무의 전부나 일부를 제3자에게 양도·이전하거나 담보로 제공할 수 없다.' });
  arr.push({ title: '분쟁의 해결 및 관할', text: `① 본 계약과 관련하여 분쟁이 발생한 경우 갑과 을은 상호 신의성실의 원칙에 따라 원만히 해결하도록 노력한다.\n② 제1항에 따라 해결되지 아니한 분쟁에 관한 소송의 제1심 관할 법원은 ${court(d)}으로 한다.` });
  arr.push({ title: '계약의 효력 및 해석', text: '① 본 계약에서 정하지 아니한 사항이나 해석상 이견이 있는 사항은 관계 법령 및 일반 상관례에 따르며, 필요한 경우 갑과 을이 서면으로 합의하여 정한다.\n② 본 계약의 일부 조항이 무효로 되더라도 나머지 조항의 효력에는 영향을 미치지 아니한다.' });
  return arr;
};

export const TEMPLATES: Record<ContractTemplate, TemplateDef> = {
  freelancer: {
    key: 'freelancer', label: '프리랜서 용역 계약서', desc: 'DJ·외주 등 프리랜서 용역(도급) 계약',
    partyA: '의뢰인(갑)', partyB: '수행자(을)',
    defaults: { a_name: KLIPSE },
    groups: [
      baseGroup,
      { title: '용역 내용', fields: [
        { key: 'service', label: '용역 내용', type: 'textarea', placeholder: '예: OO행사 DJ 공연 2시간 등' },
        { key: 'period_start', label: '용역 시작일', type: 'date' },
        { key: 'period_end', label: '용역 종료일', type: 'date' },
        { key: 'pay_method', label: '보수 지급 방법·시기', placeholder: '예: 용역 완료 및 검수 후 7일 이내 계좌이체' },
        { key: 'special', label: '특약사항', type: 'textarea' },
      ] },
      party('a', '갑 (의뢰인)'), party('b', '을 (수행자)'),
    ],
    clauses: (d) => [
      { title: '목적', text: '본 계약은 갑이 을에게 위탁하는 용역의 수행 및 그에 대한 보수의 지급에 관하여 갑과 을의 권리·의무 사항을 정함을 목적으로 한다.' },
      { title: '용역의 내용 및 범위', text: `을이 수행할 용역의 내용은 다음과 같다.\n${g(d, 'service')}` },
      { title: '계약기간', text: `용역 수행 기간은 ${g(d, 'period_start')}부터 ${g(d, 'period_end')}까지로 한다. 다만, 갑과 을의 서면 합의로 그 기간을 연장할 수 있다.` },
      { title: '보수 및 지급방법', text: `① 갑은 을에게 용역의 대가로 금 ${won(d, 'amount')}(부가가치세 별도)을 지급한다.\n② 보수의 지급 방법 및 시기는 ${g(d, 'pay_method')}(으)로 한다.` },
      { title: '지연손해금', text: '갑이 정당한 사유 없이 보수의 지급을 지체한 경우, 지체일수에 대하여 미지급액에 연 12퍼센트(「상법」상 상사 법정이율)를 곱한 지연손해금을 가산하여 지급한다.' },
      { title: '을의 성실이행 의무', text: '을은 선량한 관리자의 주의로써 용역을 성실히 수행하고, 용역의 진행 상황에 관한 갑의 정당한 요청 및 업무 협의에 성실히 협조한다.' },
      { title: '재위탁의 제한', text: '을은 갑의 사전 서면동의 없이 용역의 전부 또는 중요한 일부를 제3자에게 재위탁하지 아니한다.' },
      ...tail(d, { ip: true }),
      { title: '특약사항', text: g(d, 'special', '없음') },
    ],
  },

  construction_order: {
    key: 'construction_order', label: '시공 도급 계약서', desc: '고객으로부터 시공을 수주하는 공사도급 계약',
    partyA: '도급인(갑)', partyB: '수급인(을)',
    defaults: { b_name: KLIPSE, delay_rate: '1,000분의 1' },
    groups: [
      baseGroup,
      { title: '공사 내용', fields: [
        { key: 'project_name', label: '공사명' },
        { key: 'site', label: '공사 장소' },
        { key: 'period_start', label: '착공일', type: 'date' },
        { key: 'period_end', label: '준공(완공)일', type: 'date' },
        { key: 'pay_terms', label: '대금 지급 조건', placeholder: '예: 계약금 30% / 중도금 40% / 잔금 30%' },
        { key: 'warranty', label: '하자담보책임 기간', placeholder: '예: 준공일로부터 1년' },
        { key: 'delay_rate', label: '지체상금율', placeholder: '예: 1,000분의 1' },
        { key: 'special', label: '특약사항', type: 'textarea' },
      ] },
      party('a', '갑 (도급인)'), party('b', '을 (수급인)'),
    ],
    clauses: (d) => [
      { title: '목적', text: '본 계약은 갑이 을에게 도급하는 공사의 시공에 관하여 갑과 을의 권리·의무 사항을 정함을 목적으로 하며, 「민법」 제664조 이하의 도급에 관한 규정을 따른다.' },
      { title: '공사의 개요', text: `공사명: ${g(d, 'project_name')}\n공사 장소: ${g(d, 'site')}` },
      { title: '공사기간', text: `착공일은 ${g(d, 'period_start')}, 준공일은 ${g(d, 'period_end')}(으)로 한다. 다만, 천재지변 등 을의 책임 없는 사유가 있는 경우 갑과 을이 협의하여 공사기간을 연장할 수 있다.` },
      { title: '도급금액', text: `총 도급금액은 금 ${won(d, 'amount')}(부가가치세 포함)으로 한다.` },
      { title: '대금의 지급', text: `대금의 지급 조건은 ${g(d, 'pay_terms')}(으)로 하며, 갑은 각 지급 시기 도래 시 을의 청구에 따라 대금을 지급한다.` },
      { title: '지체상금', text: `을이 자신의 책임 있는 사유로 준공기일 내에 공사를 완성하지 못한 경우, 을은 지체일수 1일당 도급금액에 ${g(d, 'delay_rate', '1,000분의 1')}을 곱한 금액을 지체상금으로 갑에게 지급한다.` },
      { title: '하자담보책임', text: `① 을은 ${g(d, 'warranty', '준공일로부터 1년')} 동안 시공상의 하자에 대하여 「민법」 제667조에 따라 자신의 비용으로 이를 보수한다.\n② 갑은 하자의 보수에 갈음하거나 보수와 함께 손해배상을 청구할 수 있다.` },
      { title: '안전 및 관리책임', text: '을은 공사의 수행에 있어 「산업안전보건법」 등 관계 법령을 준수하고, 공사 현장의 안전관리 및 제3자에 대한 손해의 방지에 필요한 조치를 하며, 을의 귀책으로 발생한 안전사고에 대하여 책임을 진다.' },
      { title: '설계변경 및 계약금액의 조정', text: '공사의 내용 변경, 물량의 증감 등으로 도급금액의 조정이 필요한 경우 갑과 을은 그 사유와 금액을 서면으로 합의하여 계약금액을 조정한다.' },
      ...tail(d),
      { title: '특약사항', text: g(d, 'special', '없음') },
    ],
  },

  event_order: {
    key: 'event_order', label: '행사 대행 계약서', desc: '행사(공연·이벤트) 대행을 수주하는 계약',
    partyA: '위탁자(갑)', partyB: '대행사(을)',
    defaults: { b_name: KLIPSE },
    groups: [
      baseGroup,
      { title: '행사 내용', fields: [
        { key: 'event_name', label: '행사명' },
        { key: 'event_datetime', label: '행사 일시', placeholder: '예: 2026-08-01 19:00' },
        { key: 'venue', label: '행사 장소' },
        { key: 'scope', label: '대행 범위', type: 'textarea', placeholder: '예: 무대·음향·조명·DJ·진행 등' },
        { key: 'cancel_terms', label: '취소·환불(위약) 규정', type: 'textarea', placeholder: '예: 행사 30일 전 취소 시 계약금 환급, 7일 전 이후 취소 시 대금 50% 등' },
        { key: 'special', label: '특약사항', type: 'textarea' },
      ] },
      party('a', '갑 (위탁자)'), party('b', '을 (대행사)'),
    ],
    clauses: (d) => [
      { title: '목적', text: '본 계약은 갑이 을에게 위탁하는 행사 대행 업무의 수행 및 그 대가의 지급에 관하여 갑과 을의 권리·의무 사항을 정함을 목적으로 한다.' },
      { title: '행사의 개요', text: `행사명: ${g(d, 'event_name')}\n행사 일시: ${g(d, 'event_datetime')}\n행사 장소: ${g(d, 'venue')}` },
      { title: '대행 업무의 범위', text: g(d, 'scope') },
      { title: '대행 대금 및 지급', text: `행사 대행 대금은 금 ${won(d, 'amount')}(부가가치세 별도)으로 하며, 지급 시기 및 방법은 갑과 을이 협의하여 정한다.` },
      { title: '취소 및 환불', text: g(d, 'cancel_terms', '갑의 사정으로 행사가 취소되는 경우 취소 시점에 따라 상호 합의한 위약금을 적용하고, 을이 이미 지출한 비용은 정산한다. 다만, 불가항력으로 인한 취소·연기의 경우 제세비용을 정산한 후 잔액을 환급한다.') },
      { title: '안전관리 및 보험', text: '을은 행사의 원활하고 안전한 진행을 위하여 필요한 안전관리 조치를 하고, 필요한 경우 행사배상책임보험 등에 가입한다.' },
      { title: '을의 이행책임', text: '을은 행사가 예정대로 진행되도록 성실히 이행하며, 을의 귀책사유로 행사가 진행되지 못하거나 갑에게 손해가 발생한 경우 이를 배상한다.' },
      ...tail(d),
      { title: '특약사항', text: g(d, 'special', '없음') },
    ],
  },

  rental_handover: {
    key: 'rental_handover', label: '렌탈 물품 인수확인 계약서', desc: '렌탈 장비의 인수(수령) 확인 및 관리책임 계약',
    partyA: '공급자(갑)', partyB: '인수자(을)',
    defaults: { a_name: KLIPSE },
    groups: [
      baseGroup,
      { title: '인수 내용', fields: [
        { key: 'items', label: '인수 물품 목록', type: 'textarea', placeholder: '예: 스피커 2대, 믹서 1대, 케이블 일체 ...' },
        { key: 'handover_date', label: '인수일', type: 'date' },
        { key: 'place', label: '인수 장소' },
        { key: 'condition', label: '인수 시 상태', type: 'textarea', placeholder: '예: 외관 이상 없음, 정상 작동 확인' },
        { key: 'return_date', label: '반납 예정일', type: 'date' },
        { key: 'special', label: '특약사항', type: 'textarea' },
      ] },
      party('a', '갑 (공급자)'), party('b', '을 (인수자)'),
    ],
    clauses: (d) => [
      { title: '목적', text: '본 계약은 갑이 을에게 인도하는 렌탈 물품의 인수 확인과 그 보관·관리 및 반납에 관한 갑과 을의 권리·의무 사항을 정함을 목적으로 한다.' },
      { title: '인수 물품', text: `을이 인수하는 물품은 다음과 같다(세부 내역은 별지 목록에 따른다).\n${g(d, 'items')}` },
      { title: '인수일 및 장소', text: `물품의 인수일은 ${g(d, 'handover_date')}, 인수 장소는 ${g(d, 'place')}(으)로 한다.` },
      { title: '물품 상태의 확인', text: `을은 인수 시 물품의 수량 및 상태를 확인하였으며, 그 결과는 다음과 같다.\n${g(d, 'condition')}` },
      { title: '선량한 관리자의 주의의무', text: '을은 물품을 인수한 때부터 반납할 때까지 선량한 관리자의 주의로써 물품을 보관·관리한다(「민법」 제374조).' },
      { title: '반납', text: `을은 ${g(d, 'return_date')}까지 물품을 인수 당시의 상태로 갑에게 반납한다. 통상의 사용에 따른 자연적 마모는 그러하지 아니하다.` },
      { title: '파손·분실 시 책임', text: '을의 고의 또는 과실로 물품이 훼손·멸실·분실된 경우, 을은 이를 원상으로 복구하거나 수리비 또는 물품의 시가 상당액을 갑에게 배상한다.' },
      { title: '위험부담', text: '인수 이후 반납 시까지 물품의 멸실·훼손에 대한 위험은 을이 부담한다. 다만, 갑의 귀책 또는 불가항력에 의한 경우에는 그러하지 아니하다.' },
      ...tail(d),
      { title: '특약사항', text: g(d, 'special', '없음') },
    ],
  },

  rental: {
    key: 'rental', label: '물품 렌탈(임대차) 계약서', desc: '물품 렌탈(임대차) 계약',
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
      { title: '목적', text: '본 계약은 갑이 소유한 물품을 을에게 유상으로 임대하고 을이 이를 사용·수익함에 관하여 갑과 을의 권리·의무 사항을 정함을 목적으로 하며, 「민법」의 임대차에 관한 규정을 따른다.' },
      { title: '렌탈 품목', text: g(d, 'items') },
      { title: '렌탈 기간', text: `렌탈 기간은 ${g(d, 'period_start')}부터 ${g(d, 'period_end')}까지로 한다.` },
      { title: '렌탈료 및 지급', text: `렌탈료는 금 ${won(d, 'amount')}(부가가치세 별도)으로 하며, 을은 갑이 정한 시기에 이를 지급한다.` },
      { title: '보증금', text: `① 을은 갑에게 보증금 ${won(d, 'deposit')}을 예치한다.\n② 갑은 물품의 반납 및 정산이 완료된 후 보증금을 을에게 반환하며, 을이 부담할 손해액 또는 연체 렌탈료가 있는 경우 이를 공제할 수 있다.` },
      { title: '사용상의 주의의무', text: '을은 선량한 관리자의 주의로써 물품을 그 용도에 따라 사용하며, 갑의 사전 서면동의 없이 물품을 제3자에게 전대하거나 사용권을 양도할 수 없다.' },
      { title: '반납 및 원상복구', text: '을은 렌탈 기간이 종료되면 물품을 인수 당시의 상태로 반납하며, 통상의 사용에 따른 자연적 마모를 제외한 훼손에 대하여는 원상으로 복구한다.' },
      { title: '파손·분실 책임', text: g(d, 'damage', '을의 고의 또는 과실로 물품이 파손·분실된 경우 을은 수리비 또는 물품의 시가 상당액을 갑에게 배상한다.') },
      { title: '지연 반납', text: '을이 렌탈 기간 종료 후에도 물품을 반납하지 아니한 경우, 을은 반납이 완료될 때까지의 기간에 대하여 렌탈료 상당액 및 이로 인한 갑의 손해를 배상한다.' },
      { title: '위험부담', text: '렌탈 기간 중 을의 점유 하에 있는 물품의 멸실·훼손에 대한 위험은 을이 부담한다. 다만, 갑의 귀책 또는 불가항력에 의한 경우에는 그러하지 아니하다.' },
      ...tail(d),
      { title: '특약사항', text: g(d, 'special', '없음') },
    ],
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);

// 계약서 용도(시공/렌탈/DJ) 분류 — 계약서 관리 탭 구성용
export type ContractCategory = 'construction' | 'rental' | 'dj';
export const CATEGORY_LABEL: Record<ContractCategory, string> = { construction: '시공', rental: '렌탈', dj: 'DJ' };
export const CATEGORY_TEMPLATES: Record<ContractCategory, ContractTemplate[]> = {
  construction: ['construction_order'],
  rental: ['rental_handover', 'rental'],
  dj: ['freelancer', 'event_order'],
};
