-- ============================================================
-- GolfMate 보안 강화 마이그레이션
-- Supabase 대시보드 SQL 에디터에서 실행하세요
-- ============================================================

-- ============================================================
-- [MIGRATION] 1. roundings 테이블에 공유 제어 컬럼 추가
-- ============================================================
ALTER TABLE roundings
  ADD COLUMN IF NOT EXISTS share_enabled         BOOLEAN     NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS share_expires_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS include_account_in_share BOOLEAN  NOT NULL DEFAULT false;

-- ============================================================
-- [MIGRATION] 2. anon 역할 권한 최소화 (RLS 이중 보안)
-- ============================================================

-- 민감 테이블: anon 완전 차단
REVOKE ALL ON profiles     FROM anon;
REVOKE ALL ON members      FROM anon;
REVOKE ALL ON consent_logs FROM anon;

-- roundings / settlements: 공유 페이지는 service_role 사용 → anon 불필요
REVOKE ALL ON roundings    FROM anon;
REVOKE ALL ON settlements  FROM anon;

-- authenticated 역할 권한은 유지 (RLS 정책이 행 단위로 제어)

-- ============================================================
-- [TEST] anon / authenticated 권한 조회
-- ============================================================
-- SELECT grantee, table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE table_schema = 'public'
--   AND grantee IN ('anon', 'authenticated')
-- ORDER BY grantee, table_name, privilege_type;

-- ============================================================
-- [TEST] 새 컬럼 확인
-- ============================================================
-- SELECT id, share_enabled, share_expires_at, include_account_in_share
-- FROM roundings
-- LIMIT 5;

-- ============================================================
-- [TEST] anon으로 profiles 조회 시 0건 확인
-- (SQL Editor 에서 anon 키로 실행해야 의미 있음)
-- ============================================================
-- SET ROLE anon;
-- SELECT count(*) FROM profiles;        -- 예상: 0
-- SELECT count(*) FROM members;         -- 예상: 0
-- SELECT count(*) FROM consent_logs;    -- 예상: 0
-- SELECT count(*) FROM roundings;       -- 예상: 0
-- SELECT count(*) FROM settlements;     -- 예상: 0
-- RESET ROLE;

-- ============================================================
-- [TEST] 만료된 share_token 공유 페이지 차단 확인
-- (애플리케이션 레이어에서 처리 — 아래는 데이터 확인용)
-- ============================================================
-- SELECT share_token, share_enabled, share_expires_at
-- FROM roundings
-- WHERE share_enabled = false
--    OR (share_expires_at IS NOT NULL AND share_expires_at < now());
