const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function seed() {
  const data = [
    { title: '1. 현재 운영 상태를 알려주세요.', type: 'radio', options: ['신규 창업 예정입니다.', '현재 영업 중입니다.', '리뉴얼(인테리어) 예정입니다.', '기존 음향을 교체하고 싶습니다.'] },
    { title: '2. 지역을 선택해주세요.', type: 'select', options: ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'] },
    { title: '3. 어떤 공간인가요?', type: 'radio', options: ['카페', '와인바', '바(BAR)', '라운지', '클럽', '음식점', '고깃집', '한식', '일식', '레스토랑', '의류매장', '헬스장', '미용실', '호텔', '행사장', '사무실', '학원', '기타'] },
    { title: '4. 공간 규모는 어느 정도인가요?', type: 'radio', options: ['20평 미만', '20~40평', '40~60평', '60~100평', '100~200평', '200평 이상'] },
    { title: '5. 천장 높이는 어느 정도인가요?', type: 'radio', options: ['2.5m 이하', '2.5~3m', '3~5m', '5m 이상', '잘 모르겠습니다.'] },
    { title: '6. 음악은 어떤 목적으로 사용하시나요?', type: 'checkbox', options: ['고객에게 편안한 BGM', '매장 분위기를 살리는 감성 음악', '라이브 공연', 'DJ 공연', '클럽 운영', '행사 및 이벤트', '마이크 방송', '발표 및 세미나', '영상 상영', '노래방'] },
    { title: '7. 어떤 사운드를 원하시나요?', type: 'radio', options: ['자연스럽고 편안한 음색', '선명한 보컬 전달력', '풍부한 저음', '공간 전체가 균일하게 들리는 사운드', '클럽 수준의 강력한 출력', '전문가와 상담 후 결정'] },
    { title: '8. 설치를 원하는 장비는 무엇인가요?', type: 'checkbox', options: ['스피커', '우퍼', '앰프', 'DSP', '믹서', 'DJ 장비', '무선마이크', '유선마이크', 'TV 연결', '프로젝터 연결', 'HDMI 음향연동', '조명 시스템', '기타'] },
    { title: '9. 현재 음향장비가 있으신가요?', type: 'radio', options: ['전혀 없습니다.', '일부 있습니다.', '대부분 있습니다.', '기존 장비를 활용하고 싶습니다.'] },
    { title: '10. 인테리어 공사는 어느 단계인가요?', type: 'radio', options: ['공사 시작 전', '공사 진행 중', '거의 완료', '이미 운영 중'] },
    { title: '11. 시공 희망 일정', type: 'radio', options: ['최대한 빠르게', '1개월 이내', '2~3개월', '일정 미정'] },
    { title: '12. 예상 예산을 알려주세요.', type: 'radio', options: ['100만원 이하', '100~300만원', '300~500만원', '500~1,000만원', '1,000~3,000만원', '3,000만원 이상', '전문가 상담 후 결정'] },
    { title: '13. 추가로 원하시는 사항이 있으신가요?', type: 'text', options: [] },
    { title: '14. 무료 음향 컨설팅 신청 (성함, 연락처, 이메일, 도면 등)', type: 'file', options: [] }
  ];
  
  const { error } = await supabase.from('inquiry_questions').insert(data);
  if (error) {
    console.error('데이터 삽입 오류:', error);
  } else {
    console.log('데이터 삽입 완료');
  }
}

seed();
