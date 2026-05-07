"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface Rounding {
  id: string;
  golf_course: string;
  date: string;
  player_count: number;
  created_at: string;
}

export default function MyRoundingsPage() {
  const router = useRouter();
  const [roundings, setRoundings] = useState<Rounding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      const { data } = await supabase
        .from("roundings")
        .select("id, golf_course, date, player_count, created_at")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      setRoundings(data ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-5">
        <header className="bg-[#1B4332] rounded-2xl px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">내 라운딩</h1>
              <p className="text-xs text-white/70 mt-0.5">등록한 라운딩 목록</p>
            </div>
            <Link
              href="/rounding/new"
              className="bg-[#B7791F] hover:bg-[#9a6519] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              + 새 라운딩
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="text-center text-gray-400 py-12 text-sm">불러오는 중...</div>
        ) : roundings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center flex flex-col gap-3">
            <p className="text-gray-400 text-sm">등록된 라운딩이 없습니다.</p>
            <Link
              href="/rounding/new"
              className="inline-block bg-[#1B4332] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors hover:bg-[#2D6A4F]"
            >
              첫 라운딩 만들기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {roundings.map((r) => (
              <button
                key={r.id}
                onClick={() => router.push(`/rounding/${r.id}`)}
                className="bg-white rounded-2xl shadow-sm p-5 text-left w-full hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-[#1F2937]">{r.golf_course}</h2>
                  <span className="text-xs text-gray-400">{r.player_count}명</span>
                </div>
                <p className="text-sm text-[#2D6A4F] font-medium">{formatDate(r.date)}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
