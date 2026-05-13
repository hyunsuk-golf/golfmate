import Link from "next/link";

export const metadata = {
  title: "개인정보처리방침 | GolfMate",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-5 pb-16">
        <header className="bg-[#1B4332] rounded-2xl px-6 py-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/" className="text-white/70 hover:text-white text-sm">← 뒤로</Link>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">⛳ GolfMate</h1>
            <p className="text-sm text-white/80 mt-1">개인정보처리방침</p>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm p-5 text-sm text-[#1F2937] flex flex-col gap-1">
          <p className="text-xs text-gray-400">시행일: 2026년 5월 13일</p>
          <p className="text-gray-600 leading-relaxed mt-1">
            GolfMate(이하 &quot;서비스&quot;)는 이용자의 개인정보를 소중히 여기며, 정보통신망 이용촉진 및 정보보호에 관한 법률 및 개인정보 보호법에 따라 다음과 같이 개인정보처리방침을 안내합니다.
          </p>
        </div>

        <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
          <h2 className="text-base font-bold text-[#1B4332]">1. 수집하는 개인정보 항목</h2>
          <div className="flex flex-col gap-2 text-sm text-[#1F2937]">
            <div>
              <span className="inline-block bg-[#1B4332] text-white text-xs px-2 py-0.5 rounded-full font-medium mb-1">필수</span>
              <p className="text-gray-700">이메일 주소, 닉네임(이름)</p>
            </div>
            <div>
              <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium mb-1">선택</span>
              <p className="text-gray-700">은행명, 계좌번호</p>
            </div>
            <div>
              <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium mb-1">자동 수집</span>
              <p className="text-gray-700">서비스 이용 기록, 접속 로그, 기기 및 브라우저 정보</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
          <h2 className="text-base font-bold text-[#1B4332]">2. 개인정보의 수집 및 이용 목적</h2>
          <div className="flex flex-col gap-2 text-sm text-[#1F2937]">
            <div>
              <p className="font-medium text-gray-800 mb-1">필수 항목 이용 목적</p>
              <ul className="list-disc list-inside text-gray-600 flex flex-col gap-1 pl-1">
                <li>회원 식별 및 로그인</li>
                <li>라운딩 정산 서비스 제공</li>
                <li>공유 링크 생성</li>
                <li>서비스 개선 및 오류 분석</li>
                <li>고객 문의 응대</li>
              </ul>
            </div>
            <div className="pt-1 border-t border-gray-100">
              <p className="font-medium text-gray-800 mb-1">선택 항목 이용 목적</p>
              <ul className="list-disc list-inside text-gray-600 pl-1">
                <li>마케팅 정보 수신 및 이벤트 안내 (선택 동의자에 한함)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-[#1B4332]">3. 개인정보의 보유 및 이용 기간</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            수집된 개인정보는 회원 탈퇴 시까지 보유합니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 법령에서 정한 기간 동안 보관합니다.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-[#1B4332]">4. 개인정보의 제3자 제공</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-1">
            <p className="text-sm text-amber-800 leading-relaxed">
              <span className="font-semibold">공유 링크 주의:</span> 이용자가 직접 공유 링크를 타인에게 전달한 경우, 링크에 접근한 사람은 해당 라운딩의 참석자 이름, 정산 금액, 계좌 정보를 확인할 수 있습니다. 공유 링크는 신뢰할 수 있는 상대에게만 전달해 주세요.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-[#1B4332]">5. 계좌번호 안내</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            계좌번호는 정산 공유의 편의를 위해 선택적으로 입력할 수 있으며, 저장하지 않아도 정산 계산 및 공유 기능을 이용할 수 있습니다. 계좌번호를 입력하는 경우 공유 링크를 통해 다른 참석자에게 노출될 수 있으니 유의해 주세요.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-[#1B4332]">6. 이용자의 권리</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            이용자는 언제든지 아래 권리를 행사할 수 있습니다.
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 flex flex-col gap-1 pl-1">
            <li>개인정보 열람 요청</li>
            <li>개인정보 수정 요청</li>
            <li>개인정보 삭제 요청</li>
            <li>개인정보 처리 정지 요청</li>
          </ul>
          <p className="text-sm text-gray-500 mt-1">
            권리 행사는 아래 문의처로 연락해 주세요.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-[#1B4332]">7. 개인정보의 파기</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 복구 불가능한 방법으로 즉시 삭제합니다.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-[#1B4332]">8. 개인정보 안전성 확보 조치</h2>
          <ul className="list-disc list-inside text-sm text-gray-600 flex flex-col gap-1 pl-1">
            <li>접근 권한 관리 (인증된 사용자만 본인 데이터 접근)</li>
            <li>공유 링크 토큰 난수화 처리</li>
            <li>개인정보 접근 최소화 원칙 적용</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2">
          <h2 className="text-base font-bold text-[#1B4332]">9. 개인정보 보호 문의처</h2>
          <p className="text-sm text-gray-600">
            개인정보 관련 문의사항은 아래 이메일로 연락해 주세요.
          </p>
          <a
            href="mailto:sendolee85@gmail.com"
            className="text-sm text-[#1B4332] font-semibold underline"
          >
            sendolee85@gmail.com
          </a>
        </section>

        <footer className="text-center text-xs text-gray-400 py-2">
          GolfMate · 개인정보처리방침 · 시행일 2026년 5월 13일
        </footer>
      </div>
    </main>
  );
}
