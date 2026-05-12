"use client";

import { useState, useEffect } from "react";

const PARTICIPANT_OPTIONS = [2, 3, 4, 5, 6, 7, 8];

type RoundingMode = "exact" | "up" | "down";
type CostKey = "greenfee" | "cartfee" | "caddyfee" | "meal" | "etc";

interface Costs {
  greenfee: string;
  cartfee: string;
  caddyfee: string;
  meal: string;
  etc: string;
}

const costFields: { key: CostKey; label: string }[] = [
  { key: "greenfee", label: "그린피" },
  { key: "cartfee", label: "카트비" },
  { key: "caddyfee", label: "캐디피" },
  { key: "meal", label: "식사비" },
  { key: "etc", label: "기타" },
];

const ROUNDING_LABELS: Record<RoundingMode, string> = {
  exact: "정확히",
  up: "천원 올림 ★",
  down: "천원 내림",
};

function formatNumber(value: string): string {
  const num = value.replace(/[^0-9]/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("ko-KR");
}

function parseNumber(value: string): number {
  return Number(value.replace(/[^0-9]/g, "")) || 0;
}

function getKoreanDate(): string {
  const now = new Date();
  const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  return `${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}`;
}

function initAllocations(): Record<CostKey, number[] | null> {
  return { greenfee: null, cartfee: null, caddyfee: null, meal: null, etc: null };
}

function initExpanded(): Record<CostKey, boolean> {
  return { greenfee: false, cartfee: false, caddyfee: false, meal: false, etc: false };
}

export default function SettlementPage() {
  const [participants, setParticipants] = useState(4);
  const [costs, setCosts] = useState<Costs>({
    greenfee: "", cartfee: "", caddyfee: "", meal: "", etc: "",
  });
  const [playerNames, setPlayerNames] = useState<string[]>(Array(4).fill(""));
  const [payerName, setPayerName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [todayStr, setTodayStr] = useState("");
  const [roundingMode, setRoundingMode] = useState<RoundingMode>("up");
  const [allocations, setAllocations] = useState<Record<CostKey, number[] | null>>(initAllocations());
  const [expanded, setExpanded] = useState<Record<CostKey, boolean>>(initExpanded());

  useEffect(() => { setTodayStr(getKoreanDate()); }, []);

  useEffect(() => {
    setAllocations(initAllocations());
    setExpanded(initExpanded());
    setPlayerNames(Array(participants).fill(""));
  }, [participants]);

  function getParticipantName(i: number): string {
    return playerNames[i]?.trim() || `참석자 ${i + 1}`;
  }

  const totalAmount =
    parseNumber(costs.greenfee) + parseNumber(costs.cartfee) +
    parseNumber(costs.caddyfee) + parseNumber(costs.meal) + parseNumber(costs.etc);

  const hasPartialAllocation = (Object.keys(allocations) as CostKey[]).some(
    (key) => allocations[key] !== null && allocations[key]!.length < participants
  );

  function applyRounding(amount: number): number {
    if (roundingMode === "up") return Math.ceil(amount / 1000) * 1000;
    if (roundingMode === "down") return Math.floor(amount / 1000) * 1000;
    return Math.floor(amount);
  }

  function calculateRawAmounts(): number[] {
    const amounts: number[] = new Array(participants).fill(0);
    for (const { key } of costFields) {
      const fieldAmount = parseNumber(costs[key]);
      if (fieldAmount === 0) continue;
      const alloc = allocations[key];
      const payers = alloc !== null
        ? alloc.filter((i) => i < participants)
        : Array.from({ length: participants }, (_, i) => i);
      if (payers.length === 0) continue;
      const share = fieldAmount / payers.length;
      for (const idx of payers) amounts[idx] += share;
    }
    return amounts;
  }

  const rawAmounts = calculateRawAmounts();
  const roundedAmounts = rawAmounts.map(applyRounding);
  const perPersonRaw = totalAmount > 0 ? totalAmount / participants : 0;
  const perPersonRounded = applyRounding(perPersonRaw);
  const totalCollected = hasPartialAllocation
    ? roundedAmounts.reduce((s, a) => s + a, 0)
    : perPersonRounded * participants;
  const difference = totalCollected - totalAmount;

  function togglePanel(key: CostKey) {
    const isOpen = expanded[key];
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
    if (!isOpen && allocations[key] === null) {
      setAllocations((prev) => ({
        ...prev,
        [key]: Array.from({ length: participants }, (_, i) => i),
      }));
    }
  }

  function toggleParticipant(key: CostKey, idx: number) {
    setAllocations((prev) => {
      const current = prev[key] ?? Array.from({ length: participants }, (_, i) => i);
      const updated = current.includes(idx)
        ? current.filter((i) => i !== idx)
        : [...current, idx].sort((a, b) => a - b);
      if (updated.length === 0) return prev;
      return { ...prev, [key]: updated };
    });
  }

  function handleCostChange(field: CostKey, value: string) {
    setCosts((prev) => ({ ...prev, [field]: formatNumber(value) }));
  }

  function buildShareText(): string {
    const lines = [
      "[GolfMate 정산]",
      `날짜: ${todayStr}`,
      `참석자: ${participants}명 | 총 비용: ${totalAmount.toLocaleString("ko-KR")}원`,
    ];
    if (hasPartialAllocation) {
      lines.push("1인당 금액:");
      roundedAmounts.forEach((amount, i) => {
        lines.push(`  ${getParticipantName(i)}: ${amount.toLocaleString("ko-KR")}원`);
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

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-5">

        <header className="bg-[#1B4332] rounded-2xl px-6 py-5 text-white text-center">
          <h1 className="text-2xl font-bold tracking-tight">💰 정산 계산기</h1>
          <p className="text-sm text-white/80 mt-1">로그인 없이 바로 계산하세요</p>
        </header>

        {/* 참석자 수 */}
        <section>
          <p className="text-sm font-semibold text-[#1F2937] mb-2">참석자 수</p>
          <div className="flex flex-wrap gap-2">
            {PARTICIPANT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setParticipants(n)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  participants === n
                    ? "bg-[#1B4332] text-white border-[#1B4332]"
                    : "bg-white text-[#1B4332] border-[#1B4332]"
                }`}
              >
                {n}명
              </button>
            ))}
          </div>
        </section>

        {/* 참석자 이름 */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm font-semibold text-[#1F2937] mb-1">참석자 이름</p>
          <p className="text-xs text-gray-400 mb-3">입력 안 하면 &apos;참석자N&apos;으로 표시돼요</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {Array.from({ length: participants }, (_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 shrink-0 w-8">{i + 1}번</span>
                <input
                  type="text"
                  value={playerNames[i] ?? ""}
                  onChange={(e) => {
                    const newNames = [...playerNames];
                    newNames[i] = e.target.value;
                    setPlayerNames(newNames);
                  }}
                  placeholder={`참석자${i + 1}`}
                  className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 비용 입력 */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm font-semibold text-[#1F2937] mb-3">비용 입력</p>
          <div className="flex flex-col gap-4">
            {costFields.map(({ key, label }) => {
              const isOpen = expanded[key];
              const alloc = allocations[key];
              const isPartial = alloc !== null && alloc.length < participants;
              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <label className="w-14 text-sm text-[#1F2937] shrink-0">{label}</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={costs[key]}
                      onChange={(e) => handleCostChange(key, e.target.value)}
                      placeholder="0"
                      className="flex-1 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                    />
                    <span className="text-sm text-gray-500 shrink-0">원</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePanel(key)}
                    className={`w-full py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors ${
                      isOpen || isPartial
                        ? "bg-[#1B4332] text-white border-[#1B4332]"
                        : "bg-white text-[#1B4332] border-[#1B4332]"
                    }`}
                  >
                    {isOpen ? "접기" : isPartial ? `${alloc!.length}명만 부담` : "일부만 부담"}
                  </button>

                  {isOpen && (
                    <div className="p-3 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0]">
                      <p className="text-xs text-[#166534] font-medium mb-2">부담자 선택</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: participants }, (_, i) => i).map((idx) => {
                          const checked = alloc?.includes(idx) ?? true;
                          return (
                            <button
                              key={idx}
                              onClick={() => toggleParticipant(key, idx)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                checked
                                  ? "bg-[#1B4332] text-white border-[#1B4332]"
                                  : "bg-white text-[#374151] border-gray-300"
                              }`}
                            >
                              {getParticipantName(idx)}
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
            <span className="text-sm font-medium">
              {totalAmount > 0 ? `${totalAmount.toLocaleString("ko-KR")}원` : "-"}
            </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-white/70">참석자</span>
            <span className="text-sm font-medium">{participants}명</span>
          </div>

          <div className="border-t border-white/20 pt-4">
            {hasPartialAllocation ? (
              <div>
                <p className="text-sm text-white/70 mb-3 text-center">개인별 금액</p>
                <div className="flex flex-col gap-2">
                  {roundedAmounts.map((amount, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm text-white/80">{getParticipantName(i)}</span>
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

          {(payerName || accountNumber) && totalAmount > 0 && (
            <div className="mt-3 text-center">
              {payerName && (
                <p className="text-sm text-white/80">
                  각자 <span className="font-semibold text-white">{payerName}</span>에게 입금하세요
                </p>
              )}
              {accountNumber && (
                <p className="text-sm font-semibold mt-1 text-[#B7791F]">
                  💳 {accountNumber}
                </p>
              )}
            </div>
          )}
        </section>

        {/* 카톡 공유 문구 */}
        <section className="bg-gray-100 rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1F2937] mb-3">카톡 공유 문구</p>
          <div className="bg-white rounded-xl p-4 text-sm text-[#1F2937] whitespace-pre-wrap font-mono leading-relaxed border border-gray-200 break-words">
            {buildShareText()}
          </div>
          <button
            onClick={handleCopy}
            className="mt-3 w-full bg-[#B7791F] hover:bg-[#9a6519] active:bg-[#7d5217] text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {copied ? "✅ 복사 완료!" : "📋 문구 복사하기"}
          </button>
        </section>

      </div>
    </main>
  );
}
