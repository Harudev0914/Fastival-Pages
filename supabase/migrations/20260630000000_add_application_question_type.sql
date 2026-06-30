-- inquiry_questions.type 에 'application'(신청 폼) 타입 추가
-- 기존 CHECK 제약은 ('radio','checkbox','select','text','file') 만 허용하여
-- 무료 컨설팅 신청(성함/연락처/이메일/도면) 폼 타입을 저장할 수 없었음.

ALTER TABLE public.inquiry_questions
  DROP CONSTRAINT IF EXISTS inquiry_questions_type_check;

ALTER TABLE public.inquiry_questions
  ADD CONSTRAINT inquiry_questions_type_check
  CHECK (type IN ('radio', 'checkbox', 'select', 'text', 'file', 'application'));

-- 마지막 무료 음향 컨설팅 신청 질문을 신청 폼(application) 타입으로 전환
UPDATE public.inquiry_questions
SET type = 'application'
WHERE title LIKE '%무료 음향 컨설팅 신청%';
