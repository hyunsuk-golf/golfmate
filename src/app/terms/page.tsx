import Link from "next/link";

export const metadata = {
  title: "이용약관 | GolfMate",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-5 pb-16">
        <header className="bg-[#1B4332] rounded-2xl px-6 py-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/" className="text-white/70 hover:text-white text-sm">← 뒤로</Link>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">⛳ GolfMate</h1>
            <p className="text-sm text-white/80 mt-1">서비스 이용약관</p>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm p-5 text-sm text-[#1F2937] flex flex-col gap-1">
          <p className="text-xs text-gray-400">시행일: 2026년 5월 13일</p>
          <p className="text-gray-600 leading-relaxed mt-1">
            본 약관은 GolfMate(이하 &quot;서비스&quot;)의 이용에 관한 조건 및 절차를 규정합니다. 서비스를 이용하기 전에 본 약관을 주의 깊게 읽어 주세요.
          </p>
        </div>

        <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-[#1B4332]">제1조 (서비스 내용)</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            GolfMate는 골프 라운딩 참여자 간의 비용 정산을 돕기 위한 서비스로, 다음 기능을 제공합니다.
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 flex flex-col gap-1 pl-1">
            <li>라운딩 일정 등록 및 관리</li>
            <li>참석자 등록 및 관리</li>
            <li>비용 항목별 정산 계산</li>
            <li>정산 결과 저장</li>
            <li>카카오톡 공유 문구 및 공유 링크 생성</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-[#1B4332]">제2조 (이용자 의무 및 금지 행위)</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            이용자는 서비스 이용 시 다음 행위를 해서는 안 됩니다.
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 flex flex-col gap-1 pl-1">
            <li>허위 정보 입력</li>
            <li>타인의 개인정보 무단 입력</li>
            <li>서비스의 불법적 이용</li>
            <li>서비스에 대한 크롤링, 해킹, 역설계 행위</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-[#1B4332]">제3조 (정산 결과에 관한 책임)</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-sm text-amber-800 leading-relaxed">
              서비스가 제공하는 정산 결과는 <span className="font-semibold">참고용</span>이며, 실제 거래 전 이용자가 최종적으로 확인해야 합니다.
            </p>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            이용자의 입력 오류 또는 실제 결제 금액과의 차이로 인해 발생하는 분쟁에 대해 서비스 제공자는 책임을 지지 않습니다.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-[#1B4332]">제4조 (공유 링크 책임)</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            이용자가 직접 공유한 링크로 인한 개인정보 노출에 대해서는 이용자 본인이 주의해야 합니다. 신뢰할 수 있는 상대에게만 공유 링크를 전달해 주세요. 서비스 제공자는 이용자의 자발적 공유로 인한 정보 노출에 대해 책임을 지지 않습니다.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-[#1B4332]">제5조 (면책 조항)</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            서비스 제공자는 다음 사유로 발생한 손해에 대해 책임을 지지 않습니다.
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 flex flex-col gap-1 pl-1">
            <li>천재지변 등 불가항력적 상황</li>
            <li>이용자 귀책 사유로 발생한 서비스 이용 장애</li>
            <li>통신 장애, 서버 불안정 등 기술적 문제</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-[#1B4332]">제6조 (약관 변경)</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            서비스는 필요 시 약관을 변경할 수 있으며, 변경 시 서비스 내 공지를 통해 안내합니다. 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-[#1B4332]">제7조 (문의처)</h2>
          <p className="text-sm text-gray-600">
            서비스 이용과 관련한 문의사항은 아래 이메일로 연락해 주세요.
          </p>
          <a
            href="mailto:sendolee85@gmail.com"
            className="text-sm text-[#1B4332] font-semibold underline"
          >
            sendolee85@gmail.com
          </a>
        </section>

        <footer className="text-center text-xs text-gray-400 py-2">
          GolfMate · 서비스 이용약관 · 시행일 2026년 5월 13일
        </footer>
      </div>
    </main>
  );
}
