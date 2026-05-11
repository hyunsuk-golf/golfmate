"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface Rounding {
  id: string;
  golf_course: string;
  date: string;
  tee_time: string | null;
  region: string | null;
  player_count: number;
  players: string[];
  memo: string | null;
  share_token: string;
}

interface Settlement {
  id: string;
  green_fee: number;
  cart_fee: number;
  caddie_fee: number;
  meal_fee: number;
  other_fee: number;
  total_fee: number;
  per_person: number;
  payer_name: string | null;
  account_number: string | null;
}

type CostKey = "green_fee" | "cart_fee" | "caddie_fee" | "meal_fee" | "other_fee";
type RoundingMode = "exact" | "up" | "down";

const COST_FIELDS: { key: CostKey; label: string }[] = [
  { key: "green_fee", label: "그린피" },
  { key: "cart_fee", label: "카트비" },
  { key: "caddie_fee", label: "캐디피" },
  { key: "meal_fee", label: "식사비" },
  { key: "other_fee", label: "기타" },
];

const ROUNDING_LABELS: Record<RoundingMode, string> = {
  exact: "정확히",
  up: "천원 올림 ★",
  down: "천원 내림",
};

function initAllocations(): Record<CostKey, number[] | null> {
  return { green_fee: null, cart_fee: null, caddie_fee: null, meal_fee: null, other_fee: null };
}

function initExpanded(): Record<CostKey, boolean> {
  return { green_fee: false, cart_fee: false, caddie_fee: false, meal_fee: false, other_fee: false };
}

function formatNum(n: number) {
  return n > 0 ? n.toLocaleString("ko-KR") + "원" : "-";
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

function formatNumber(value: string): string {
  const num = value.replace(/[^0-9]/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("ko-KR");
}

function parseNumber(value: string): number {
  return Number(value.replace(/[^0-9]/g, "")) || 0;
}

export default function RoundingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [rounding, setRounding] = useState<Rounding | null>(null);
  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [costs, setCosts] = useState<Record<CostKey, string>>({
    green_fee: "", cart_fee: "", caddie_fee: "", meal_fee: "", other_fee: "",
  });
  const [payerName, setPayerName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);

  const [roundingMode, setRoundingMode] = useState<RoundingMode>("up");
  const [allocations, setAllocations] = useState<Record<CostKey, number[] | null>>(initAllocations());
  const [expanded, setExpanded] = useState<Record<CostKey, boolean>>(initExpanded());

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const [{ data: r }, { data: s }, { data: profile }] = await Promise.all([
        supabase.from("roundings").select("*").eq("id", id).single(),
        supabase.from("settlements").select("*").eq("rounding_id", id).maybeSingle(),
        supabase.from("profiles").select("name, account_number").eq("id", user.id).maybeSingle(),
      ]);

      if (!r) { router.push("/my-roundings"); return; }
      setRounding(r);

      if (s) {
        setSettlement(s);
        setCosts({
          green_fee: s.green_fee > 0 ? s.green_fee.toLocaleString("ko-KR") : "",
          cart_fee: s.cart_fee > 0 ? s.cart_fee.toLocaleString("ko-KR") : "",
          caddie_fee: s.caddie_fee > 0 ? s.caddie_fee.toLocaleString("ko-KR") : "",
          meal_fee: s.meal_fee > 0 ? s.meal_fee.toLocaleString("ko-KR") : "",
          other_fee: s.other_fee > 0 ? s.other_fee.toLocaleString("ko-KR") : "",
        });
        setPayerName(s.payer_name ?? "");
        setAccountNumber(s.account_number ?? "");
      } else if (profile?.account_number) {
        setPayerName(profile.name ?? "");
        setAccountNumber(profile.account_number);
      }
      setLoading(false);
    }
    load();
  }, [id, router]);

  const playerCount = rounding?.player_count ?? 0;

  const totalAmount =
    parseNumber(costs.green_fee) + parseNumber(costs.cart_fee) +
    parseNumber(costs.caddie_fee) + parseNumber(costs.meal_fee) +
    parseNumber(costs.other_fee);

  const hasPartialAllocation = (Object.keys(allocations) as CostKey[]).some(
    (key) => allocations[key] !== null && allocations[key]!.length < playerCount
  );

  function applyRounding(amount: number): number {
    if (roundingMode === "up") return Math.ceil(amount / 1000) * 1000;
    if (roundingMode === "down") return Math.floor(amount / 1000) * 1000;
    return Math.floor(amount);
  }

  function calculateRawAmounts(): number[] {
    if (playerCount === 0) return [];
    const amounts: number[] = new Array(playerCount).fill(0);
    for (const { key } of COST_FIELDS) {
      const fieldAmount = parseNumber(costs[key]);
      if (fieldAmount === 0) continue;
      const alloc = allocations[key];
      const payers = alloc !== null
        ? alloc.filter((i) => i < playerCount)
        : Array.from({ length: playerCount }, (_, i) => i);
      if (payers.length === 0) continue;
      const share = fieldAmount / payers.length;
      for (const idx of payers) amounts[idx] += share;
    }
    return amounts;
  }

  const rawAmounts = calculateRawAmounts();
  const roundedAmounts = rawAmounts.map(applyRounding);
  const perPersonRaw = totalAmount > 0 && playerCount > 0 ? totalAmount / playerCount : 0;
  const perPersonRounded = applyRounding(perPersonRaw);
  const totalCollected = hasPartialAllocation
    ? roundedAmounts.reduce((s, a) => s + a, 0)
    : perPersonRounded * playerCount;
  const difference = totalCollected - totalAmount;

  function getPlayerName(idx: number): string {
    if (rounding?.players && rounding.players[idx]) return rounding.players[idx];
    return `참석자 ${idx + 1}`;
  }

  function togglePanel(key: CostKey) {
    const isOpen = expanded[key];
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
    if (!isOpen && allocations[key] === null) {
      setAllocations((prev) => ({
        ...prev,
        [key]: Array.from({ length: playerCount }, (_, i) => i),
      }));
    }
  }

  function toggleParticipant(key: CostKey, idx: number) {
    setAllocations((prev) => {
      const current = prev[key] ?? Array.from({ length: playerCount }, (_, i) => i);
      const updated = current.includes(idx)
        ? current.filter((i) => i !== idx)
        : [...current, idx].sort((a, b) => a - b);
      if (updated.length === 0) return prev;
      return { ...prev, [key]: updated };
    });
  }

  async function handleSaveSettlement() {
    if (!rounding) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      rounding_id: rounding.id,
      green_fee: parseNumber(costs.green_fee),
      cart_fee: parseNumber(costs.cart_fee),
      caddie_fee: parseNumber(costs.caddie_fee),
      meal_fee: parseNumber(costs.meal_fee),
      other_fee: parseNumber(costs.other_fee),
      total_fee: totalAmount,
      per_person: hasPartialAllocation ? Math.floor(totalAmount / playerCount) : perPersonRounded,
      payer_name: payerName || null,
      account_number: accountNumber || null,
    };
    if (settlement) {
      await supabase.from("settlements").update(payload).eq("id", settlement.id);
    } else {
      const { data } = await supabase.from("settlements").insert(payload).select().single();
      setSettlement(data);
    }
    setSaving(false);
  }

  async function handleCopyShareLink() {
    if (!rounding) return;
    const url = `${window.location.origin}/share/${rounding.share_token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  function buildShareText(): string {
    if (!rounding) return "";
    const lines = [
      "[GolfMate 정산]",
      `날짜: ${formatDate(rounding.date)}`,
      `장소: ${rounding.golf_course}`,
      `참석자: ${playerCount}명 | 총 비용: ${totalAmount.toLocaleString("ko-KR")}원`,
    ];
    if (hasPartialAllocation) {
      lines.push("1인당 금액:");
      roundedAmounts.forEach((amount, i) => {
        lines.push(`  ${getPlayerName(i)}: ${amount.toLocaleString("ko-KR")}원`);
      });
    } else {
      lines.push(`1인당: ${perPersonRounded.toLocaleString("ko-KR")}원`);
      if (roundingMode !== "exact" && difference !== 0) {
        const abs = Math.abs(difference).toLocaleString("ko-KR");
        lines.push(difference > 0 ? `남는 금액: ${abs}원` : `부족 금액: ${abs}원`);
      }
    }
    if (payerName || accountNumber) lines.push("");
    if (payerName) lines.push(`선결제자: ${payerName}`);
    if (accountNumber) lines.push(`계좌: ${accountNumber}`);
    lines.push("", "👉 골프 정산은 GolfMate → mygolfmate.co.kr");
    return lines.join("\n");
  }

  async function handleCopyShareText() {
    try {
      await navigator.clipboard.writeText(buildShareText());
      setTextCopied(true);
      setTimeout(() => setTextCopied(false), 1500);
    } catch {}
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
  if (!rounding) return null;

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-5">
        <header className="bg-[#1B4332] rounded-2xl px-6 py-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/my-roundings" className="text-white/70 hover:text-white text-sm">← 뒤로</Link>
          </div>
          <h1 className="text-xl font-bold">{rounding.golf_course}</h1>
          <p className="text-sm text-white/70 mt-1">{formatDate(rounding.date)}</p>
          {rounding.tee_time && (
            <p className="text-sm text-white/70">티타임: {rounding.tee_time}</p>
          )}
          {rounding.region && (
            <span className="inline-block mt-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
              {rounding.region}
            </span>
          )}
        </header>

        <section className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm font-semibold text-[#1F2937] mb-3">참석자 ({playerCount}명)</p>
          {rounding.players.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {rounding.players.map((p, i) => (
                <span key={i} className="bg-[#F0F9F4] text-[#1B4332] text-sm px-3 py-1 rounded-full font-medium">
                  {p}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">{playerCount}명 (이름 미입력)</p>
          )}
          {rounding.memo && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">메모</p>
              <p className="text-sm text-[#1F2937] whitespace-pre-wrap">{rounding.memo}</p>
            </div>
          )}
        </section>

        {/* 비용 입력 */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm font-semibold text-[#1F2937] mb-3">정산 계산기</p>
          <div className="flex flex-col gap-4">
            {COST_FIELDS.map(({ key, label }) => {
              const isOpen = expanded[key];
              const alloc = allocations[key];
              const isPartial = alloc !== null && alloc.length < playerCount;
              return (
                <div key={key}>
                  <div className="flex items-center gap-2">
                    <label className="w-14 text-sm text-[#1F2937] shrink-0">{label}</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={costs[key]}
                      onChange={(e) =>
                        setCosts((prev) => ({ ...prev, [key]: formatNumber(e.target.value) }))
                      }
                      placeholder="0"
                      className="flex-1 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                    />
                    <span className="text-sm text-gray-500 shrink-0">원</span>
                    <button
                      type="button"
                      onClick={() => togglePanel(key)}
                      style={{
                        backgroundColor: isOpen || isPartial ? "#1B4332" : "#ffffff",
                        color: isOpen || isPartial ? "#ffffff" : "#1B4332",
                        border: "2px solid #1B4332",
                        borderRadius: "8px",
                        padding: "4px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        cursor: "pointer",
                      }}
                    >
                      {isOpen ? "접기" : isPartial ? `${alloc!.length}명만` : "일부만"}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-2 ml-16 p-3 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0]">
                      <p className="text-xs text-[#166534] font-medium mb-2">부담자 선택</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: playerCount }, (_, i) => i).map((idx) => {
                          const checked = alloc?.includes(idx) ?? true;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => toggleParticipant(key, idx)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                                checked
                                  ? "bg-[#1B4332] text-white border-[#1B4332]"
                                  : "bg-white text-[#374151] border-gray-300"
                              }`}
                            >
                              {getPlayerName(idx)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 선결제자 정보 */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm font-semibold text-[#1F2937] mb-3">
            선결제자 정보 <span className="font-normal text-gray-400">(선택)</span>
          </p>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              placeholder="선결제자 이름"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="예: KB 123-456-7890"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
          </div>
        </section>

        {/* 결과 카드 */}
        <section className="bg-[#1B4332] rounded-2xl p-5 text-white">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/70">총 비용</span>
            <span className="text-sm font-medium">{formatNum(totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-white/70">참석자</span>
            <span className="text-sm font-medium">{playerCount}명</span>
          </div>

          <div className="border-t border-white/20 pt-4">
            {hasPartialAllocation ? (
              <div>
                <p className="text-sm text-white/70 mb-3 text-center">개인별 금액</p>
                <div className="flex flex-col gap-2">
                  {roundedAmounts.map((amount, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm text-white/80">{getPlayerName(i)}</span>
                      <span className="text-xl font-bold text-[#B7791F]">
                        {amount.toLocaleString("ko-KR")}원
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-white/70 mb-1">1인당 금액</p>
                <p className="text-4xl font-bold text-[#B7791F]">
                  {perPersonRounded > 0 ? `${perPersonRounded.toLocaleString("ko-KR")}원` : "-"}
                </p>
              </div>
            )}

            {/* 올림/내림 버튼 - 항상 표시 */}
            <div className="mt-4">
              <div className="flex gap-2 justify-center flex-wrap">
                {(["exact", "up", "down"] as RoundingMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setRoundingMode(mode)}
                    style={{
                      backgroundColor: roundingMode === mode ? "#ffffff" : "rgba(255,255,255,0.15)",
                      color: roundingMode === mode ? "#1B4332" : "#ffffff",
                      border: `2px solid ${roundingMode === mode ? "#ffffff" : "rgba(255,255,255,0.5)"}`,
                      borderRadius: "8px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {ROUNDING_LABELS[mode]}
                  </button>
                ))}
              </div>
              {roundingMode !== "exact" && totalAmount > 0 && difference !== 0 && (
                <p className="text-center text-sm mt-2 font-medium">
                  {difference > 0 ? (
                    <span style={{ color: "#86efac" }}>
                      남는 금액 {difference.toLocaleString("ko-KR")}원
                    </span>
                  ) : (
                    <span style={{ color: "#fca5a5" }}>
                      부족 금액 {Math.abs(difference).toLocaleString("ko-KR")}원
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {payerName && totalAmount > 0 && (
            <p className="text-center text-sm text-white/80 mt-3">
              각자 <span className="font-semibold text-white">{payerName}</span>에게 입금하세요
            </p>
          )}
        </section>

        {/* 카톡 공유 문구 */}
        <section className="bg-gray-100 rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1F2937] mb-3">카톡 공유 문구</p>
          <div className="bg-white rounded-xl p-4 text-sm text-[#1F2937] whitespace-pre-wrap font-mono leading-relaxed border border-gray-200">
            {buildShareText()}
          </div>
          <button
            type="button"
            onClick={handleCopyShareText}
            className="mt-3 w-full bg-[#B7791F] hover:bg-[#9a6519] active:bg-[#7d5217] text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {textCopied ? "✅ 복사 완료!" : "📋 문구 복사하기"}
          </button>
        </section>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleSaveSettlement}
            disabled={saving}
            className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {saving ? "저장 중..." : "정산 저장하기"}
          </button>
          <button
            onClick={handleCopyShareLink}
            className="w-full bg-[#B7791F] hover:bg-[#9a6519] text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {copied ? "✅ 링크 복사됨!" : "🔗 카톡 공유 링크 복사"}
          </button>
        </div>
      </div>
    </main>
  );
}
