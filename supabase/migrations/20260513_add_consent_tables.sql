-- 동의 이력 테이블 생성
-- Supabase 대시보드 SQL 에디터에서 실행하세요

-- 1. consent_logs 테이블 생성 (동의 이력 저장)
CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  terms_agreed BOOLEAN NOT NULL DEFAULT FALSE,
  privacy_agreed BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_agreed BOOLEAN NOT NULL DEFAULT FALSE,
  terms_version TEXT NOT NULL DEFAULT '2026-05-13',
  privacy_version TEXT NOT NULL DEFAULT '2026-05-13',
  agreed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent TEXT
);

-- RLS 활성화
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- 본인 동의 이력만 삽입 가능
CREATE POLICY "Users can insert their own consent logs"
  ON consent_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 본인 동의 이력만 조회 가능
CREATE POLICY "Users can view their own consent logs"
  ON consent_logs FOR SELECT
  USING (auth.uid() = user_id);

-- 2. profiles 테이블에 현재 동의 상태 컬럼 추가
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS terms_agreed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS privacy_agreed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS marketing_agreed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS terms_version TEXT,
  ADD COLUMN IF NOT EXISTS privacy_version TEXT;
