"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface Rounding {
  id: string;
  golf_course: string;
  date: string;
  tee_time: string | null;
  region: string | null;
  player_count: number;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [upcomingRoundings, setUpcomingRoundings] = useState<Rounding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.name ?? user.email ?? null);
        const today = new Date().toISOString().split("T")[0];
        const { data } = await supabase
          .from("roundings")
          .select("id, golf_course, date, tee_time, region, player_count")
          .eq("user_id", user.id)
          .gte("date", today)
          .order("date", { ascending: true })
          .limit(3);
        setUpcomingRoundings(data ?? []);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-5">

        <header className="bg-[#1B4332] rounded-2xl px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">⛳ GolfMate</h1>
              <p className="text-sm text-white/80 mt-0.5">골프 모임 정산, 카톡보다 깔끔하게.</p>
            </div>
            {userName ? (
              <span className="text-xs text-white/70 bg-white/10 px-3 py-1.5 rounded-full">
                {userName}
              </span>
            ) : (
              <Link
                href="/auth/login"
                className="text-xs text-white/80 hover:text-white border border-white/30 px-3 py-1.5 rounded-full transition-colors"
              >
                로그인
              </Link>
            )}
          </div>
        </header>

        {userName ? (
          <>
            <section className="flex gap-3">
              <Link
                href="/rounding/new"
                className="flex-1 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-sm font-semibold py-3 rounded-xl text-center transition-colors"
              >
                + 새 라운딩 만들기
              </Link>
              <Link
                href="/settlement"
                className="flex-1 bg-[#B7791F] hover:bg-[#9a6519] text-white text-sm font-semibold py-3 rounded-xl text-center transition-colors"
              >
                💰 빠른 정산
              </Link>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-[#1F2937]">다가오는 라운딩</p>
                <Link href="/my-roundings" className="text-xs text-[#2D6A4F]">전체 보기</Link>
              </div>
              {loading ? (
                <div className="text-center text-gray-400 text-sm py-6">불러오는 중...</div>
              ) : upcomingRoundings.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                  <p className="text-gray-400 text-sm mb-3">예정된 라운딩이 없습니다.</p>
                  <Link
                    href="/rounding/new"
                    className="inline-block bg-[#1B4332] text-white text-xs font-semibold px-4 py-2 rounded-lg"
                  >
                    첫 라운딩 만들기
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {upcomingRoundings.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => router.push(`/rounding/${r.id}`)}
                      className="bg-white rounded-2xl shadow-sm p-4 text-left w-full hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-[#1F2937]">{r.golf_course}</p>
                            {r.region && (
                              <span className="text-xs text-[#2D6A4F] bg-[#F0F9F4] px-1.5 py-0.5 rounded-full">
                                {r.region}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#2D6A4F] mt-0.5">
                            {formatDate(r.date)}
                            {r.tee_time && ` · ${r.tee_time}`}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                          {r.player_count}명
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-3">
              <p className="text-base font-bold text-[#1F2937]">골프 모임 정산, 카톡보다 깔끔하게.</p>
              <p className="text-sm text-gray-500">한 명이 먼저 결제했거나, 비용 부담자가 다를 때<br />정산금액을 자동 계산하고 링크로 공유하세요.</p>
              <Link
                href="/settlement"
                className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-sm font-semibold py-3 rounded-xl text-center transition-colors"
              >
                회원가입 없이 정산해보기
              </Link>
              <div className="flex gap-2">
                <Link
                  href="/auth/login"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#1F2937] text-sm font-semibold py-2.5 rounded-xl text-center transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#1F2937] text-sm font-semibold py-2.5 rounded-xl text-center transition-colors"
                >
                  회원가입
                </Link>
              </div>
            </div>
          </section>
        )}

        <footer className="text-center text-xs text-gray-400 py-2">
          GolfMate · 골프 약속과 정산을 쉽게
        </footer>
      </div>
    </main>
  );
}
