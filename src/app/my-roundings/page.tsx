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
  region: string | null;
  settlements: { id: string }[];
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
        .select("id, golf_course, date, player_count, region, settlements(id)")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      setRoundings((data as Rounding[]) ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
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
            {roundings.map((r) => {
              const hasSettlement = r.settlements?.length > 0;
              return (
                <button
                  key={r.id}
                  onClick={() => router.push(`/rounding/${r.id}`)}
                  className="bg-white rounded-2xl shadow-sm p-5 text-left w-full hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <h2 className="text-base font-bold text-[#1F2937] leading-snug">{r.golf_course}</h2>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-2 shrink-0 ${
                        hasSettlement
                          ? "bg-[#D1FAE5] text-[#065F46]"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {hasSettlement ? "정산 완료" : "정산 전"}
                    </span>
                  </div>
                  <p className="text-sm text-[#2D6A4F] font-medium">{formatDate(r.date)}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    <span>{r.player_count}명</span>
                    {r.region && (
                      <>
                        <span>·</span>
                        <span>{r.region}</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
