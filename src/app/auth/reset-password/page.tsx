"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type Status = "loading" | "ready" | "invalid" | "success";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // onAuthStateChange fires PASSWORD_RECOVERY when the browser client
    // processes the #access_token=...&type=recovery hash from the email link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStatus("ready");
      }
    });

    // Fallback: if the event already fired before subscription was set up,
    // check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus((prev) => prev === "loading" ? "ready" : prev);
      }
    });

    // After 6 seconds with no session, treat as invalid/expired link
    const timer = setTimeout(() => {
      setStatus((prev) => prev === "loading" ? "invalid" : prev);
    }, 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("비밀번호는 영문과 숫자를 모두 포함해야 합니다.");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("비밀번호 변경 중 오류가 발생했습니다. 링크가 만료되었을 수 있습니다.");
    } else {
      setStatus("success");
      setTimeout(() => router.push("/auth/login"), 2500);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-5">
        <header className="bg-[#1B4332] rounded-2xl px-6 py-5 text-white text-center">
          <h1 className="text-2xl font-bold tracking-tight">⛳ GolfMate</h1>
          <p className="text-sm text-white/80 mt-1">비밀번호 재설정</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          {status === "loading" && (
            <div className="text-center py-8 flex flex-col gap-2">
              <p className="text-sm text-gray-500">인증 링크를 확인하는 중...</p>
              <p className="text-xs text-gray-400">잠시만 기다려주세요.</p>
            </div>
          )}

          {status === "invalid" && (
            <div className="text-center py-6 flex flex-col gap-4">
              <div className="text-4xl">⚠️</div>
              <div>
                <p className="text-base font-bold text-[#1F2937]">링크가 유효하지 않습니다</p>
                <p className="text-sm text-gray-500 mt-1">
                  링크가 만료되었거나 이미 사용된 링크입니다.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="inline-block bg-[#1B4332] text-white text-sm font-semibold px-5 py-3 rounded-xl"
              >
                로그인 페이지로 이동
              </Link>
            </div>
          )}

          {status === "success" && (
            <div className="text-center py-6 flex flex-col gap-3">
              <div className="text-4xl">✅</div>
              <p className="text-base font-bold text-[#1F2937]">비밀번호가 변경되었습니다!</p>
              <p className="text-sm text-gray-500">잠시 후 로그인 페이지로 이동합니다...</p>
            </div>
          )}

          {status === "ready" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#1F2937]">새 비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8자 이상 영문+숫자 조합"
                  required
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#1F2937]">새 비밀번호 확인</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="비밀번호 다시 입력"
                  required
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                {loading ? "변경 중..." : "변경하기"}
              </button>
            </form>
          )}
        </div>

        {(status === "ready" || status === "invalid") && (
          <p className="text-center text-sm text-gray-500">
            <Link href="/auth/login" className="text-[#1B4332] underline">
              로그인 페이지로 돌아가기
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
