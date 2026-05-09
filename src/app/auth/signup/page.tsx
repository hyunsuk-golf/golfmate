"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsDuplicateEmail(false);
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
      await supabase.from("profiles").upsert({ id: data.user.id, name });
    }
    setLoading(false);
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-5">
        <header className="bg-[#1B4332] rounded-2xl px-6 py-5 text-white text-center">
          <h1 className="text-2xl font-bold tracking-tight">⛳ GolfMate</h1>
          <p className="text-sm text-white/80 mt-1">회원가입</p>
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
          <button
            type="submit"
            disabled={loading}
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
