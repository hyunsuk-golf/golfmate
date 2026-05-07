"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

const PARTICIPANT_OPTIONS = [2, 3, 4, 5, 6, 7, 8];

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
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const day = days[now.getDay()];
  return `${month}월 ${date}일 ${day}`;
}

interface Costs {
  greenfee: string;
  cartfee: string;
  caddyfee: string;
  meal: string;
  etc: string;
}

export default function Home() {
  const [participants, setParticipants] = useState(4);
  const [costs, setCosts] = useState<Costs>({
    greenfee: "",
    cartfee: "",
    caddyfee: "",
    meal: "",
    etc: "",
  });
  const [payerName, setPayerName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [todayStr, setTodayStr] = useState("");
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    setTodayStr(getKoreanDate());
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(user.user_metadata?.name ?? user.email ?? null);
      }
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserName(null);
  }

  const totalAmount =
    parseNumber(costs.greenfee) +
    parseNumber(costs.cartfee) +
    parseNumber(costs.caddyfee) +
    parseNumber(costs.meal) +
    parseNumber(costs.etc);

  const perPerson = totalAmount > 0 ? Math.floor(totalAmount / participants) : 0;

  function handleCostChange(field: keyof Costs, value: string) {
    setCosts((prev) => ({ ...prev, [field]: formatNumber(value) }));
  }

  function buildShareText(): string {
    const lines: string[] = [
      "[GolfMate 정산]",
      `날짜: ${todayStr}`,
      `참석자: ${participants}명 | 총 비용: ${totalAmount.toLocaleString("ko-KR")}원`,
      `1인당: ${perPerson.toLocaleString("ko-KR")}원`,
    ];
    if (payerName || accountNumber) {
      lines.push("");
    }
    if (payerName) {
      lines.push(`선결제자: ${payerName}`);
    }
    if (accountNumber) {
      lines.push(`계좌: ${accountNumber}`);
    }
    lines.push("");
    lines.push("👉 골프 정산은 GolfMate → golfmate.kr");
    return lines.join("\n");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API 미지원 환경 대응
    }
  }

  const costFields: { key: keyof Costs; label: string }[] = [
    { key: "greenfee", label: "그린피" },
    { key: "cartfee", label: "카트비" },
    { key: "caddyfee", label: "캐디피" },
    { key: "meal", label: "식사비" },
    { key: "etc", label: "기타" },
  ];

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-5">

        {/* 헤더 */}
        <header className="bg-[#1B4332] rounded-2xl px-6 py-5 text-white">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold tracking-tight">⛳ GolfMate</h1>
            {userName ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/70">{userName}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-white/60 hover:text-white border border-white/30 px-2 py-1 rounded-lg transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-xs text-white/60 hover:text-white border border-white/30 px-2 py-1 rounded-lg transition-colors"
              >
                로그인
              </Link>
            )}
          </div>
          <p className="text-sm text-white/80">골프 약속과 정산, 카톡보다 쉽게.</p>
          {userName && (
            <Link
              href="/rounding/new"
              className="inline-block mt-3 bg-[#B7791F] hover:bg-[#9a6519] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              + 새 라운딩 만들기
            </Link>
          )}
        </header>

        {/* 참석자 수 선택 */}
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

        {/* 비용 입력 */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm font-semibold text-[#1F2937] mb-3">비용 입력</p>
          <div className="flex flex-col gap-3">
            {costFields.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <label className="w-14 text-sm text-[#1F2937] shrink-0">{label}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={costs[key]}
                  onChange={(e) => handleCostChange(key, e.target.value)}
                  placeholder="0"
                  className="flex-1 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
                <span className="text-sm text-gray-500 shrink-0 w-4">원</span>
              </div>
            ))}
          </div>
        </section>

        {/* 선결제자 정보 */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm font-semibold text-[#1F2937] mb-3">
            선결제자 정보{" "}
            <span className="font-normal text-gray-400">(선택)</span>
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

        {/* 정산 결과 카드 */}
        <section className="bg-[#1B4332] rounded-2xl p-5 text-white">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/70">총 비용</span>
            <span className="text-sm font-medium">
              {totalAmount > 0
                ? `${totalAmount.toLocaleString("ko-KR")}원`
                : "-"}
            </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-white/70">참석자</span>
            <span className="text-sm font-medium">{participants}명</span>
          </div>
          <div className="border-t border-white/20 pt-4 text-center">
            <p className="text-sm text-white/70 mb-1">1인당 금액</p>
            <p className="text-4xl font-bold text-[#B7791F]">
              {perPerson > 0
                ? `${perPerson.toLocaleString("ko-KR")}원`
                : "-"}
            </p>
          </div>
          {payerName && perPerson > 0 && (
            <p className="text-center text-sm text-white/80 mt-3">
              각자{" "}
              <span className="font-semibold text-white">{payerName}</span>에게{" "}
              <span className="font-semibold text-white">
                {perPerson.toLocaleString("ko-KR")}원
              </span>{" "}
              입금
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
            onClick={handleCopy}
            className="mt-3 w-full bg-[#B7791F] hover:bg-[#9a6519] active:bg-[#7d5217] text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {copied ? "✅ 복사 완료!" : "📋 문구 복사하기"}
          </button>
        </section>

        {/* 푸터 */}
        <footer className="text-center text-xs text-gray-400 py-2">
          GolfMate · 골프 약속과 정산을 쉽게
        </footer>
      </div>
    </main>
  );
}
