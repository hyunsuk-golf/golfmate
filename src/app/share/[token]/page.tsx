import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

function formatNum(n: number) {
  return n > 0 ? n.toLocaleString("ko-KR") + "원" : "-";
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: rounding } = await supabase
    .from("roundings")
    .select("*, settlements(*)")
    .eq("share_token", token)
    .single();

  if (!rounding) notFound();

  const settlement = rounding.settlements?.[0] ?? null;

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-5">
        <header className="bg-[#1B4332] rounded-2xl px-6 py-5 text-white text-center">
          <h1 className="text-2xl font-bold tracking-tight">⛳ GolfMate</h1>
          <p className="text-sm text-white/80 mt-1">라운딩 정산 공유</p>
        </header>

        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">{rounding.golf_course}</h2>
          <div className="flex flex-col gap-2 text-sm text-[#1F2937]">
            <div className="flex justify-between">
              <span className="text-gray-500">날짜</span>
              <span className="font-medium">{formatDate(rounding.date)}</span>
            </div>
            {rounding.tee_time && (
              <div className="flex justify-between">
                <span className="text-gray-500">티타임</span>
                <span className="font-medium">{rounding.tee_time}</span>
              </div>
            )}
            {rounding.region && (
              <div className="flex justify-between">
                <span className="text-gray-500">지역</span>
                <span className="font-medium">{rounding.region}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">참석자</span>
              <span className="font-medium">{rounding.player_count}명</span>
            </div>
          </div>
          {rounding.players?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">참석자 명단</p>
              <div className="flex flex-wrap gap-2">
                {(rounding.players as string[]).map((p: string, i: number) => (
                  <span key={i} className="bg-[#F0F9F4] text-[#1B4332] text-sm px-3 py-1 rounded-full font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {settlement ? (
          <section className="bg-[#1B4332] rounded-2xl p-5 text-white">
            <p className="text-sm font-semibold text-white/80 mb-4">정산 내역</p>
            <div className="flex flex-col gap-2 mb-4">
              {settlement.green_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">그린피</span>
                  <span>{formatNum(settlement.green_fee)}</span>
                </div>
              )}
              {settlement.cart_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">카트비</span>
                  <span>{formatNum(settlement.cart_fee)}</span>
                </div>
              )}
              {settlement.caddie_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">캐디피</span>
                  <span>{formatNum(settlement.caddie_fee)}</span>
                </div>
              )}
              {settlement.meal_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">식사비</span>
                  <span>{formatNum(settlement.meal_fee)}</span>
                </div>
              )}
              {settlement.other_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">기타</span>
                  <span>{formatNum(settlement.other_fee)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-white/20 pt-4 text-center">
              <p className="text-sm text-white/70 mb-1">1인당 금액</p>
              <p className="text-4xl font-bold text-[#B7791F]">
                {settlement.per_person > 0
                  ? `${settlement.per_person.toLocaleString("ko-KR")}원`
                  : "-"}
              </p>
            </div>
            {settlement.payer_name && settlement.per_person > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20 text-center">
                <p className="text-sm text-white/80">
                  각자 <span className="font-bold text-white">{settlement.payer_name}</span>에게{" "}
                  <span className="font-bold text-white">
                    {settlement.per_person.toLocaleString("ko-KR")}원
                  </span>{" "}
                  입금해주세요
                </p>
                {settlement.account_number && (
                  <p className="text-sm text-[#B7791F] font-semibold mt-2">
                    {settlement.account_number}
                  </p>
                )}
              </div>
            )}
          </section>
        ) : (
          <section className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <p className="text-gray-400 text-sm">아직 정산 정보가 입력되지 않았습니다.</p>
          </section>
        )}

        <footer className="text-center text-xs text-gray-400 py-2">
          GolfMate · 골프 약속과 정산을 쉽게
        </footer>
      </div>
    </main>
  );
}
