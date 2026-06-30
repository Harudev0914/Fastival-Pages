-- 1. 새로운 필드 추가 및 타입 변경
ALTER TABLE public.admins
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS department TEXT CHECK (department IN ('영업팀', '운영팀')),
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. 기존 데이터 마이그레이션 (필요시 username을 email로 복사하거나 초기값 설정)
-- 기존 username이 있다면 email로 활용할 수 있도록 업데이트
UPDATE public.admins SET email = username WHERE email IS NULL;

-- 3. updated_at 자동 갱신을 위한 함수 및 트리거 추가
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON public.admins
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
