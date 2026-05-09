"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

const REGIONS = ["수도권", "강원", "충청", "전라", "경상", "제주", "기타"];

interface SavedMember {
  id: string;
  name: string;
}

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
  const [savedMembers, setSavedMembers] = useState<SavedMember[]>([]);
  const [showMatchingAlert, setShowMatchingAlert] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data } = await supabase
        .from("members")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");
      setSavedMembers(data ?? []);
    }
    load();
  }, [router]);

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

  function addMemberToPlayers(memberName: string) {
    const alreadyAdded = players.some((p) => p.trim() === memberName);
    if (alreadyAdded) return;
    const firstEmpty = players.findIndex((p) => !p.trim());
    if (firstEmpty === -1) return;
    handlePlayerName(firstEmpty, memberName);
  }

  function isMemberAdded(memberName: string) {
    return players.some((p) => p.trim() === memberName);
  }

  const emptySlots = players.filter((p) => !p.trim()).length;

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

            {savedMembers.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">저장된 멤버에서 추가</label>
                <div className="flex flex-wrap gap-2">
                  {savedMembers.map((m) => {
                    const added = isMemberAdded(m.name);
                    const slotsFull = emptySlots === 0;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => addMemberToPlayers(m.name)}
                        disabled={added || slotsFull}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          added
                            ? "bg-[#1B4332] text-white border-[#1B4332] opacity-60"
                            : slotsFull
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "bg-[#F0F9F4] text-[#1B4332] border-[#2D6A4F] hover:bg-[#1B4332] hover:text-white"
                        }`}
                      >
                        {added ? "✓ " : ""}{m.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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

            {/* 멤버 부족 버튼 */}
            <div className="border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => setShowMatchingAlert(true)}
                className="w-full border border-dashed border-[#2D6A4F] text-[#2D6A4F] text-sm font-medium py-2.5 rounded-xl hover:bg-[#F0F9F4] transition-colors"
              >
                🔍 멤버가 부족한가요?
              </button>
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

      {/* 멤버 매칭 준비 중 알림 바텀시트 */}
      {showMatchingAlert && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end"
          onClick={() => setShowMatchingAlert(false)}
        >
          <div
            className="bg-white rounded-t-2xl px-6 pt-5 pb-8 w-full text-center flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-1" />
            <div className="text-4xl">🏌️</div>
            <h2 className="text-lg font-bold text-[#1F2937]">매칭 기능 준비 중!</h2>
            <p className="text-sm text-gray-500">
              함께 칠 멤버를 찾아주는 매칭 기능을 준비하고 있어요.<br />
              빠른 시일 내에 만나요! 기대해주세요 🎉
            </p>
            <button
              onClick={() => setShowMatchingAlert(false)}
              className="w-full bg-[#1B4332] text-white font-semibold py-3 rounded-xl text-sm mt-1"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
