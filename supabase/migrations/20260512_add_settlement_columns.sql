-- settlements 테이블에 일부만 정산 지원 컬럼 추가
-- Supabase 대시보드 SQL 에디터에서 실행하세요

ALTER TABLE settlements
ADD COLUMN IF NOT EXISTS per_person_amounts JSONB,
ADD COLUMN IF NOT EXISTS allocations_data JSONB;
