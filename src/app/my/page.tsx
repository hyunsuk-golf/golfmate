"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient, SESSION_ONLY_KEY } from "@/lib/supabase";

interface Stats {
  total: number;
  thisMonth: number;
  nextRounding: { golf_course: string; date: string } | null;
}

function getLocalDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export default function MyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [stats, setStats] = useState<Stats>({ total: 0, thisMonth: 0, nextRounding: null });

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

      // 로컬 시간 기준으로 날짜 계산 (한국 시간 정확도)
      const now = new Date();
      const today = getLocalDateString(now);
      const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const lastOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      const [{ count: total }, { count: thisMonth }, { data: nextData }] = await Promise.all([
        supabase.from("roundings").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase
          .from("roundings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("date", firstOfMonth)
          .lte("date", lastOfMonth),
        supabase
          .from("roundings")
          .select("golf_course, date")
          .eq("user_id", user.id)
          .gte("date", today)
          .order("date", { ascending: true })
          .limit(1),
      ]);

      setStats({
        total: total ?? 0,
        thisMonth: thisMonth ?? 0,
        nextRounding: nextData?.[0] ?? null,
      });

      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setSaveError("");
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, name, account_number: accountNumber });
    setSaving(false);
    if (error) {
      setSaveError("저장에 실패했습니다. 다시 시도해주세요.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    sessionStorage.removeItem(SESSION_ONLY_KEY);
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

        {/* 라운딩 통계 */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm font-semibold text-[#1F2937] mb-3">📊 나의 라운딩 통계</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-[#F0F9F4] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-[#1B4332]">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-0.5">총 라운딩</p>
            </div>
            <div className="bg-[#FFF8EC] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-[#B7791F]">{stats.thisMonth}</p>
              <p className="text-xs text-gray-500 mt-0.5">이번 달</p>
            </div>
          </div>
          {stats.nextRounding ? (
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">다음 라운딩</p>
                <p className="text-sm font-bold text-[#1F2937] mt-0.5">{stats.nextRounding.golf_course}</p>
              </div>
              <span className="text-xs text-[#2D6A4F] font-medium">{formatDate(stats.nextRounding.date)}</span>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-gray-400">예정된 라운딩이 없습니다</p>
            </div>
          )}
        </section>

        {/* 멤버 관리 */}
        <Link
          href="/members"
          className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F0F9F4] rounded-xl flex items-center justify-center text-lg">
              👥
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1F2937]">멤버 관리</p>
              <p className="text-xs text-gray-400 mt-0.5">자주 치는 멤버 저장/관리</p>
            </div>
          </div>
          <span className="text-gray-400 text-sm">›</span>
        </Link>

        {/* 프로필 정보 */}
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
            <p className="text-xs text-gray-400">저장하면 정산 화면에서 자동으로 입력돼요.</p>
          </div>
          {saveError && (
            <p className="text-xs text-red-500">{saveError}</p>
          )}
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
