import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import SettlementCard from "./SettlementCard";

interface SettlementRow {
  green_fee: number;
  cart_fee: number;
  caddie_fee: number;
  meal_fee: number;
  other_fee: number;
  total_fee: number;
  per_person: number;
  payer_name: string | null;
  account_number: string | null;
  per_person_amounts: number[] | null;
  allocations_data: Record<string, number[] | null> | null;
}

interface RoundingRow {
  golf_course: string;
  date: string;
  tee_time: string | null;
  region: string | null;
  player_count: number;
  players: string[] | null;
  share_enabled: boolean;
  share_expires_at: string | null;
  include_account_in_share: boolean;
  settlements: SettlementRow[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const supabase = createAdminClient();

  const { data: rounding } = await supabase
    .from("roundings")
    .select(`
      golf_course,
      date,
      tee_time,
      region,
      player_count,
      players,
      share_enabled,
      share_expires_at,
      include_account_in_share,
      settlements(
        green_fee,
        cart_fee,
        caddie_fee,
        meal_fee,
        other_fee,
        total_fee,
        per_person,
        payer_name,
        account_number,
        per_person_amounts,
        allocations_data
      )
    `)
    .eq("share_token", token)
    .eq("share_enabled", true)
    .single();

  if (!rounding) notFound();

  // 만료 시각 체크
  if (rounding.share_expires_at && new Date(rounding.share_expires_at) < new Date()) {
    notFound();
  }

  const typedRounding = rounding as unknown as RoundingRow;
  const settlement = typedRounding.settlements?.[0] ?? null;
  const formattedDate = formatDate(typedRounding.date);

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-10">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-5">
        <header className="bg-[#1B4332] rounded-2xl px-6 py-5 text-white text-center">
          <h1 className="text-2xl font-bold tracking-tight">⛳ GolfMate</h1>
          <p className="text-sm text-white/80 mt-1">라운딩 정산 공유</p>
        </header>

        {/* 라운딩 정보 */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">{typedRounding.golf_course}</h2>
          <div className="flex flex-col gap-2 text-sm text-[#1F2937]">
            <div className="flex justify-between">
              <span className="text-gray-500">날짜</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            {typedRounding.tee_time && (
              <div className="flex justify-between">
                <span className="text-gray-500">티타임</span>
                <span className="font-medium">{typedRounding.tee_time}</span>
              </div>
            )}
            {typedRounding.region && (
              <div className="flex justify-between">
                <span className="text-gray-500">지역</span>
                <span className="font-medium">{typedRounding.region}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">참석자</span>
              <span className="font-medium">{typedRounding.player_count}명</span>
            </div>
          </div>
          {typedRounding.players && typedRounding.players.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">참석자 명단</p>
              <div className="flex flex-wrap gap-2">
                {typedRounding.players.map((p: string, i: number) => (
                  <span key={i} className="bg-[#F0F9F4] text-[#1B4332] text-sm px-3 py-1 rounded-full font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 정산 정보 (클라이언트 컴포넌트) */}
        {settlement ? (
          <SettlementCard
            settlement={settlement}
            playerCount={typedRounding.player_count}
            players={typedRounding.players ?? []}
            golfCourse={typedRounding.golf_course}
            formattedDate={formattedDate}
          />
        ) : (
          <section className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <p className="text-gray-400 text-sm">아직 정산 정보가 입력되지 않았습니다.</p>
          </section>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-800 leading-relaxed text-center">
            이 링크를 아는 사람은 라운딩 정보와 정산 내용을 확인할 수 있습니다.<br />
            민감한 정보 입력 및 공유에 유의해주세요.
          </p>
        </div>

        <footer className="text-center text-xs text-gray-400 py-2">
          GolfMate · 골프 약속과 정산을 쉽게
        </footer>
      </div>
    </main>
  );
}
