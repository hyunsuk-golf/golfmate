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

const COST_FIELDS: { key: keyof Settlement; label: string }[] = [
  { key: "green_fee", label: "그린피" },
  { key: "cart_fee", label: "카트비" },
  { key: "caddie_fee", label: "캐디피" },
  { key: "meal_fee", label: "식사비" },
  { key: "other_fee", label: "기타" },
];

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
  const [costs, setCosts] = useState({
    green_fee: "",
    cart_fee: "",
    caddie_fee: "",
    meal_fee: "",
    other_fee: "",
  });
  const [payerName, setPayerName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: r } = await supabase
        .from("roundings")
        .select("*")
        .eq("id", id)
        .single();
      if (!r) { router.push("/my-roundings"); return; }
      setRounding(r);

      const { data: s } = await supabase
        .from("settlements")
        .select("*")
        .eq("rounding_id", id)
        .maybeSingle();
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
      }
      setLoading(false);
    }
    load();
  }, [id, router]);

  const totalAmount =
    parseNumber(costs.green_fee) +
    parseNumber(costs.cart_fee) +
    parseNumber(costs.caddie_fee) +
    parseNumber(costs.meal_fee) +
    parseNumber(costs.other_fee);
  const perPerson = totalAmount > 0 && rounding ? Math.floor(totalAmount / rounding.player_count) : 0;

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
      per_person: perPerson,
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
          <p className="text-sm font-semibold text-[#1F2937] mb-3">참석자 ({rounding.player_count}명)</p>
          {rounding.players.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {rounding.players.map((p, i) => (
                <span key={i} className="bg-[#F0F9F4] text-[#1B4332] text-sm px-3 py-1 rounded-full font-medium">
                  {p}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">{rounding.player_count}명 (이름 미입력)</p>
          )}
          {rounding.memo && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">메모</p>
              <p className="text-sm text-[#1F2937] whitespace-pre-wrap">{rounding.memo}</p>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm font-semibold text-[#1F2937] mb-3">정산 계산기</p>
          <div className="flex flex-col gap-3">
            {COST_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <label className="w-14 text-sm text-[#1F2937] shrink-0">{label}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={costs[key as keyof typeof costs]}
                  onChange={(e) =>
                    setCosts((prev) => ({
                      ...prev,
                      [key]: formatNumber(e.target.value),
                    }))
                  }
                  placeholder="0"
                  className="flex-1 text-right border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
                <span className="text-sm text-gray-500 shrink-0 w-4">원</span>
              </div>
            ))}
          </div>
        </section>

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

        <section className="bg-[#1B4332] rounded-2xl p-5 text-white">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/70">총 비용</span>
            <span className="text-sm font-medium">{formatNum(totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-white/70">참석자</span>
            <span className="text-sm font-medium">{rounding.player_count}명</span>
          </div>
          <div className="border-t border-white/20 pt-4 text-center">
            <p className="text-sm text-white/70 mb-1">1인당 금액</p>
            <p className="text-4xl font-bold text-[#B7791F]">
              {perPerson > 0 ? `${perPerson.toLocaleString("ko-KR")}원` : "-"}
            </p>
          </div>
          {payerName && perPerson > 0 && (
            <p className="text-center text-sm text-white/80 mt-3">
              각자 <span className="font-semibold text-white">{payerName}</span>에게{" "}
              <span className="font-semibold text-white">{perPerson.toLocaleString("ko-KR")}원</span> 입금
            </p>
          )}
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
