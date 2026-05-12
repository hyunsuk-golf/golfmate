"use client";

import { useState } from "react";

type RoundingMode = "exact" | "up" | "down";

interface Settlement {
  green_fee: number;
  cart_fee: number;
  caddie_fee: number;
  meal_fee: number;
  other_fee: number;
  total_fee: number;
  per_person: number;
  payer_name: string | null;
  account_number: string | null;
  per_person_amounts?: number[] | null;
  allocations_data?: Record<string, number[] | null> | null;
}

interface Props {
  settlement: Settlement;
  playerCount: number;
  players: string[];
  golfCourse: string;
  formattedDate: string;
}

const ROUNDING_LABELS: Record<RoundingMode, string> = {
  exact: "정확히",
  up: "천원 올림 ★",
  down: "천원 내림",
};

const COST_ROWS = [
  { key: "green_fee", label: "그린피" },
  { key: "cart_fee", label: "카트비" },
  { key: "caddie_fee", label: "캐디피" },
  { key: "meal_fee", label: "식사비" },
  { key: "other_fee", label: "기타" },
];

function formatNum(n: number) {
  return n > 0 ? n.toLocaleString("ko-KR") + "원" : "-";
}

export default function SettlementCard({
  settlement,
  playerCount,
  players,
  golfCourse,
  formattedDate,
}: Props) {
  const [roundingMode, setRoundingMode] = useState<RoundingMode>("up");
  const [copied, setCopied] = useState(false);

  function applyRounding(amount: number): number {
    if (roundingMode === "up") return Math.ceil(amount / 1000) * 1000;
    if (roundingMode === "down") return Math.floor(amount / 1000) * 1000;
    return Math.floor(amount);
  }

  const perPersonRaw = playerCount > 0 ? settlement.total_fee / playerCount : 0;
  const perPersonRounded = applyRounding(perPersonRaw);
  const difference = perPersonRounded * playerCount - settlement.total_fee;

  const storedAmounts = settlement.per_person_amounts;
  const hasIndividualAmounts =
    storedAmounts != null && storedAmounts.length === playerCount;

  const allocData = settlement.allocations_data;

  function getPlayerName(idx: number) {
    return players[idx] || `참석자 ${idx + 1}`;
  }

  function buildShareText(): string {
    const lines = [
      "[GolfMate 정산]",
      `날짜: ${formattedDate}`,
      `장소: ${golfCourse}`,
      `참석자: ${playerCount}명 | 총 비용: ${settlement.total_fee.toLocaleString("ko-KR")}원`,
    ];

    if (hasIndividualAmounts) {
      lines.push("1인당 금액:");
      storedAmounts!.forEach((amount, i) => {
        lines.push(`  ${getPlayerName(i)}: ${amount.toLocaleString("ko-KR")}원`);
      });
    } else if (players.length > 0) {
      lines.push("1인당 금액:");
      Array.from({ length: playerCount }, (_, i) => i).forEach((i) => {
        lines.push(`  ${getPlayerName(i)}: ${perPersonRounded.toLocaleString("ko-KR")}원`);
      });
    } else {
      lines.push(`1인당: ${perPersonRounded.toLocaleString("ko-KR")}원`);
    }

    if (!hasIndividualAmounts && roundingMode !== "exact" && difference !== 0) {
      const abs = Math.abs(difference).toLocaleString("ko-KR");
      lines.push(difference > 0 ? `남는 금액: ${abs}원` : `부족 금액: ${abs}원`);
    }

    if (settlement.payer_name || settlement.account_number) lines.push("");
    if (settlement.payer_name) lines.push(`선결제자: ${settlement.payer_name}`);
    if (settlement.account_number) lines.push(`계좌: ${settlement.account_number}`);
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
    <>
      {/* 정산 결과 카드 */}
      <section className="bg-[#1B4332] rounded-2xl p-5 text-white">
        <p className="text-sm font-semibold text-white/80 mb-4">정산 내역</p>

        {/* 항목별 비용 */}
        <div className="flex flex-col gap-2 mb-4">
          {COST_ROWS.map(({ key, label }) => {
            const amount = settlement[key as keyof Settlement] as number;
            if (amount <= 0) return null;

            const alloc = allocData ? allocData[key] : null;
            const isPartial = alloc !== null && alloc !== undefined && alloc.length < playerCount;
            const payerNames = isPartial
              ? alloc!.map((i) => getPlayerName(i)).join(", ")
              : null;

            return (
              <div key={key} className="flex justify-between text-sm items-start">
                <span className="text-white/70 shrink-0">{label}</span>
                <div className="text-right">
                  <span>{formatNum(amount)}</span>
                  {isPartial && payerNames && (
                    <p className="text-xs text-white/50 mt-0.5">{payerNames}만 부담</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/20 pt-4">
          {/* 개인별 금액 */}
          {hasIndividualAmounts ? (
            <div>
              <p className="text-sm text-white/70 mb-3 text-center">개인별 금액</p>
              <div className="flex flex-col gap-2">
                {storedAmounts!.map((amount, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm text-white/80">{getPlayerName(i)}</span>
                    <span className="text-xl font-bold text-[#B7791F]">
                      {amount.toLocaleString("ko-KR")}원
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : players.length > 0 ? (
            <div>
              <p className="text-sm text-white/70 mb-3 text-center">개인별 금액</p>
              <div className="flex flex-col gap-2">
                {Array.from({ length: playerCount }, (_, i) => i).map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm text-white/80">{getPlayerName(i)}</span>
                    <span className="text-xl font-bold text-[#B7791F]">
                      {perPersonRounded.toLocaleString("ko-KR")}원
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

          {/* 올림/내림 버튼 - 균등 분배일 때만 표시 */}
          {!hasIndividualAmounts && (
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
              {roundingMode !== "exact" && difference !== 0 && (
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
          )}
        </div>

        {/* 선결제자 + 계좌 - 이름 없어도 계좌번호 표시 */}
        {(settlement.payer_name || settlement.account_number) && (
          <div className="mt-4 pt-4 border-t border-white/20 text-center">
            {settlement.payer_name && (
              <p className="text-sm text-white/80">
                각자 <span className="font-bold text-white">{settlement.payer_name}</span>에게 입금해주세요
              </p>
            )}
            {settlement.account_number && (
              <p className="text-base text-[#B7791F] font-bold mt-2">
                💳 {settlement.account_number}
              </p>
            )}
          </div>
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
          onClick={handleCopy}
          className="mt-3 w-full bg-[#B7791F] hover:bg-[#9a6519] active:bg-[#7d5217] text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          {copied ? "✅ 복사 완료!" : "📋 문구 복사하기"}
        </button>
      </section>
    </>
  );
}
