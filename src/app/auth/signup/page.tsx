"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

const TERMS_VERSION = "2026-05-13";
const PRIVACY_VERSION = "2026-05-13";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  const [error, setError] = useState("");
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const requiredAgreed = termsAgreed && privacyAgreed;

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsDuplicateEmail(false);
    if (!requiredAgreed) {
      setError("필수 약관에 동의해야 회원가입이 가능합니다.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("비밀번호는 영문과 숫자를 모두 포함해야 합니다.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("email")) {
        setIsDuplicateEmail(true);
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }
    // Supabase sometimes returns a user with identities=[] when email is already registered
    // (when email confirmation is enabled, it silently "succeeds" but doesn't create a real user)
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setIsDuplicateEmail(true);
      setLoading(false);
      return;
    }
    if (data.user) {
      const userId = data.user.id;
      const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : null;

      await supabase.from("profiles").upsert({
        id: userId,
        name,
        terms_agreed: termsAgreed,
        privacy_agreed: privacyAgreed,
        marketing_agreed: marketingAgreed,
        terms_version: TERMS_VERSION,
        privacy_version: PRIVACY_VERSION,
      });

      await supabase.from("consent_logs").insert({
        user_id: userId,
        terms_agreed: termsAgreed,
        privacy_agreed: privacyAgreed,
        marketing_agreed: marketingAgreed,
        terms_version: TERMS_VERSION,
        privacy_version: PRIVACY_VERSION,
        user_agent: userAgent,
      });
    }
    setLoading(false);
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-5">
        <header className="bg-[#1B4332] rounded-2xl px-6 py-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/auth/login" className="text-white/70 hover:text-white text-sm">← 뒤로</Link>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">⛳ GolfMate</h1>
            <p className="text-sm text-white/80 mt-1">회원가입</p>
          </div>
        </header>

        <form onSubmit={handleSignup} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
          {isDuplicateEmail && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex flex-col gap-1">
              <p className="text-sm font-semibold text-orange-700">이미 사용 중인 이메일입니다.</p>
              <p className="text-sm text-orange-600">
                <Link href="/auth/login" className="font-bold underline">
                  로그인 페이지로 이동
                </Link>
                해주세요.
              </p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#1F2937]">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              required
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#1F2937]">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="golf@example.com"
              required
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#1F2937]">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상 영문+숫자 조합"
              required
              minLength={8}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
          </div>

          {/* 약관 동의 */}
          <div className="flex flex-col gap-3 pt-1 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">약관 동의</p>

            <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => {
                  setTermsAgreed(e.target.checked);
                  if (error) setError("");
                }}
                className="mt-0.5 w-5 h-5 min-w-[20px] accent-[#1B4332] cursor-pointer"
              />
              <span className="text-sm text-[#1F2937] leading-relaxed">
                <span className="text-[#1B4332] font-semibold">[필수]</span>{" "}
                서비스 이용약관에 동의합니다.{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1B4332] underline font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  보기
                </a>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={(e) => {
                  setPrivacyAgreed(e.target.checked);
                  if (error) setError("");
                }}
                className="mt-0.5 w-5 h-5 min-w-[20px] accent-[#1B4332] cursor-pointer"
              />
              <span className="text-sm text-[#1F2937] leading-relaxed">
                <span className="text-[#1B4332] font-semibold">[필수]</span>{" "}
                개인정보 수집 및 이용에 동의합니다.{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1B4332] underline font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  보기
                </a>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={marketingAgreed}
                onChange={(e) => setMarketingAgreed(e.target.checked)}
                className="mt-0.5 w-5 h-5 min-w-[20px] accent-[#1B4332] cursor-pointer"
              />
              <span className="text-sm text-[#1F2937] leading-relaxed">
                <span className="text-gray-500 font-semibold">[선택]</span>{" "}
                마케팅 정보 수신에 동의합니다.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !requiredAgreed}
            className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="text-[#1B4332] font-semibold underline">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
