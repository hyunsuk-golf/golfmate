"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function MyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);
      setEmail(user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, account_number")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) {
        setName(profile.name ?? "");
        setAccountNumber(profile.account_number ?? "");
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").upsert({ id: userId, name, account_number: accountNumber });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <div className="max-w-md mx-auto px-4 py-6 text-center text-gray-400 text-sm pt-20">
          불러오는 중...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-5">

        <header className="bg-[#1B4332] rounded-2xl px-6 py-5 text-white">
          <h1 className="text-xl font-bold tracking-tight">👤 마이페이지</h1>
          <p className="text-sm text-white/70 mt-1">{email}</p>
        </header>

        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-[#1F2937]">프로필 정보</p>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">계좌번호 (정산 시 자동 입력)</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="예: KB 123-456-7890"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {saved ? "✅ 저장 완료!" : saving ? "저장 중..." : "저장하기"}
          </button>
        </form>

        <button
          onClick={handleLogout}
          className="w-full bg-white border border-red-200 text-red-500 hover:bg-red-50 font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          로그아웃
        </button>

      </div>
    </main>
  );
}
