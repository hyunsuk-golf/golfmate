"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

const REGIONS = ["수도권", "강원", "충청", "전라", "경상", "제주", "기타"];

export default function NewRoundingPage() {
  const router = useRouter();
  const [golfCourse, setGolfCourse] = useState("");
  const [date, setDate] = useState("");
  const [teeTime, setTeeTime] = useState("");
  const [region, setRegion] = useState("");
  const [playerCount, setPlayerCount] = useState(4);
  const [players, setPlayers] = useState<string[]>(["", "", "", ""]);
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handlePlayerCountChange(count: number) {
    setPlayerCount(count);
    setPlayers((prev) => {
      const next = [...prev];
      while (next.length < count) next.push("");
      return next.slice(0, count);
    });
  }

  function handlePlayerName(index: number, value: string) {
    setPlayers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    const { data, error: insertError } = await supabase
      .from("roundings")
      .insert({
        user_id: user.id,
        golf_course: golfCourse,
        date,
        tee_time: teeTime || null,
        region: region || null,
        player_count: playerCount,
        players: players.filter((p) => p.trim()),
        memo: memo || null,
      })
      .select("id")
      .single();
    setLoading(false);
    if (insertError) {
      setError("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }
    router.push(`/rounding/${data.id}`);
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-5">
        <header className="bg-[#1B4332] rounded-2xl px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/70 hover:text-white text-sm">← 뒤로</Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">라운딩 만들기</h1>
              <p className="text-xs text-white/70 mt-0.5">새 라운딩 일정을 등록하세요</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
            <p className="text-sm font-semibold text-[#1F2937]">기본 정보</p>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">골프장명 *</label>
              <input
                type="text"
                value={golfCourse}
                onChange={(e) => setGolfCourse(e.target.value)}
                placeholder="예: 블루원 용인CC"
                required
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">날짜 *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-gray-500">티타임 (선택)</label>
                <input
                  type="time"
                  value={teeTime}
                  onChange={(e) => setTeeTime(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-gray-500">지역 (선택)</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] bg-white"
                >
                  <option value="">선택 안 함</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
            <p className="text-sm font-semibold text-[#1F2937]">참석자</p>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">참석자 수</label>
              <div className="flex flex-wrap gap-2">
                {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handlePlayerCountChange(n)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      playerCount === n
                        ? "bg-[#1B4332] text-white border-[#1B4332]"
                        : "bg-white text-[#1B4332] border-[#1B4332]"
                    }`}
                  >
                    {n}명
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">참석자 이름 (선택)</label>
              {players.map((name, i) => (
                <input
                  key={i}
                  type="text"
                  value={name}
                  onChange={(e) => handlePlayerName(i, e.target.value)}
                  placeholder={`참석자 ${i + 1}`}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#1F2937]">
              메모 <span className="font-normal text-gray-400">(선택)</span>
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="특이사항, 준비물 등을 입력하세요"
              rows={3}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] resize-none"
            />
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {loading ? "저장 중..." : "라운딩 저장하기"}
          </button>
        </form>
      </div>
    </main>
  );
}
