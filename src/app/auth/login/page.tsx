"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient, SESSION_ONLY_KEY } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!rememberMe) {
      sessionStorage.setItem(SESSION_ONLY_KEY, "1");
    } else {
      sessionStorage.removeItem(SESSION_ONLY_KEY);
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      sessionStorage.removeItem(SESSION_ONLY_KEY);
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setResetMsg("");
    setResetSuccess(false);
    setResetLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setResetLoading(false);
    if (error) {
      setResetMsg("오류가 발생했습니다. 이메일을 다시 확인해주세요.");
      setResetSuccess(false);
    } else {
      setResetMsg("재설정 링크를 이메일로 보냈습니다.");
      setResetSuccess(true);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-5">
        <header className="bg-[#1B4332] rounded-2xl px-6 py-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/" className="text-white/70 hover:text-white text-sm">← 뒤로</Link>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">⛳ GolfMate</h1>
            <p className="text-sm text-white/80 mt-1">{showForgotPw ? "비밀번호 찾기" : "로그인"}</p>
          </div>
        </header>

        {!showForgotPw ? (
          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}
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
                placeholder="비밀번호 입력"
                required
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              />
              <button
                type="button"
                onClick={() => setShowForgotPw(true)}
                className="text-xs text-[#2D6A4F] text-right hover:underline mt-0.5"
              >
                비밀번호 찾기
              </button>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-[#1B4332]"
              />
              <span className="text-sm text-[#1F2937]">로그인 상태 유지</span>
              <span className="text-xs text-gray-400">(브라우저 닫아도 유지)</span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
            <button
              type="button"
              onClick={() => { setShowForgotPw(false); setResetMsg(""); setResetEmail(""); setResetSuccess(false); }}
              className="text-sm text-gray-400 hover:text-gray-600 text-left"
            >
              ← 로그인으로 돌아가기
            </button>

            {resetSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-4 flex flex-col gap-1.5">
                <p className="text-sm font-bold text-green-700">✅ 이메일이 전송되었습니다!</p>
                <p className="text-sm text-green-700">{resetMsg}</p>
                <p className="text-xs text-green-600 mt-0.5">받은편지함을 확인해주세요. (스팸함도 확인해보세요)</p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
                <p className="text-xs text-gray-500">
                  가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                </p>
                {resetMsg && (
                  <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">
                    {resetMsg}
                  </div>
                )}
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="golf@example.com"
                  required
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                >
                  {resetLoading ? "전송 중..." : "재설정 링크 보내기"}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5 text-center">
          <p className="text-sm text-gray-500">
            계정이 없으신가요?{" "}
            <Link href="/auth/signup" className="text-[#1B4332] font-semibold underline">
              회원가입
            </Link>
          </p>
          <p className="text-xs text-gray-400">
            이메일이 기억나지 않으시면 새로 가입해주세요.
          </p>
        </div>
      </div>
    </main>
  );
}
