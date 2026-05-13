-- RLS 활성화 및 보안 정책 추가
-- Supabase 대시보드 SQL 에디터에서 실행하세요

-- ============================================================
-- 1. RLS 활성화
-- ============================================================
ALTER TABLE profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE roundings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE members   ENABLE ROW LEVEL SECURITY;
-- consent_logs는 이전 마이그레이션에서 이미 활성화됨

-- ============================================================
-- 2. profiles 정책 (계좌번호 포함 — 본인만 접근)
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- ============================================================
-- 3. roundings 정책 (본인 라운딩만 접근)
--    공유 링크 조회는 서버사이드 service role key 사용
-- ============================================================
DROP POLICY IF EXISTS "roundings_select_own" ON roundings;
DROP POLICY IF EXISTS "roundings_insert_own" ON roundings;
DROP POLICY IF EXISTS "roundings_update_own" ON roundings;
DROP POLICY IF EXISTS "roundings_delete_own" ON roundings;

CREATE POLICY "roundings_select_own" ON roundings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "roundings_insert_own" ON roundings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "roundings_update_own" ON roundings
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "roundings_delete_own" ON roundings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 4. settlements 정책 (본인 라운딩의 정산만 접근)
--    계좌번호 포함 — 본인 라운딩 소유자만 읽기/쓰기 가능
--    공유 링크 조회는 서버사이드 service role key 사용
-- ============================================================
DROP POLICY IF EXISTS "settlements_select_own" ON settlements;
DROP POLICY IF EXISTS "settlements_insert_own" ON settlements;
DROP POLICY IF EXISTS "settlements_update_own" ON settlements;
DROP POLICY IF EXISTS "settlements_delete_own" ON settlements;

CREATE POLICY "settlements_select_own" ON settlements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM roundings
      WHERE roundings.id = settlements.rounding_id
        AND roundings.user_id = auth.uid()
    )
  );

CREATE POLICY "settlements_insert_own" ON settlements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM roundings
      WHERE roundings.id = settlements.rounding_id
        AND roundings.user_id = auth.uid()
    )
  );

CREATE POLICY "settlements_update_own" ON settlements
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM roundings
      WHERE roundings.id = settlements.rounding_id
        AND roundings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roundings
      WHERE roundings.id = settlements.rounding_id
        AND roundings.user_id = auth.uid()
    )
  );

CREATE POLICY "settlements_delete_own" ON settlements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM roundings
      WHERE roundings.id = settlements.rounding_id
        AND roundings.user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. members 정책 (연락처 포함 — 본인만 접근)
-- ============================================================
DROP POLICY IF EXISTS "members_select_own" ON members;
DROP POLICY IF EXISTS "members_insert_own" ON members;
DROP POLICY IF EXISTS "members_update_own" ON members;
DROP POLICY IF EXISTS "members_delete_own" ON members;

CREATE POLICY "members_select_own" ON members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "members_insert_own" ON members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "members_update_own" ON members
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "members_delete_own" ON members
  FOR DELETE USING (auth.uid() = user_id);
