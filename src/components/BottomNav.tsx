"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export function BottomNav() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (pathname.startsWith("/auth")) return null;

  const items = [
    { href: "/",             label: "홈",    icon: "🏠", activeOn: ["/"],                          requiresLogin: false },
    { href: "/my-roundings", label: "라운딩", icon: "⛳", activeOn: ["/my-roundings", "/rounding"], requiresLogin: true  },
    { href: "/settlement",   label: "정산",  icon: "💰", activeOn: ["/settlement"],                requiresLogin: false },
    { href: "/my",           label: "마이",  icon: "👤", activeOn: ["/my", "/members"],            requiresLogin: true  },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto flex">
          {items.map((item) => {
            const isActive =
              pathname === "/" ? item.href === "/"
              : item.activeOn.some((p) => pathname.startsWith(p));

            if (item.requiresLogin && !isLoggedIn) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setShowLoginAlert(true)}
                  className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors text-gray-400 hover:text-[#1B4332]"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
                  isActive
                    ? "text-[#1B4332] font-semibold"
                    : "text-gray-400 hover:text-[#1B4332]"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {showLoginAlert && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] flex items-end"
          onClick={() => setShowLoginAlert(false)}
        >
          <div
            className="bg-white rounded-t-2xl px-6 pt-5 pb-8 w-full text-center flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-1" />
            <div className="text-3xl">🔒</div>
            <h2 className="text-base font-bold text-[#1F2937]">로그인이 필요합니다</h2>
            <p className="text-sm text-gray-500">이 기능을 사용하려면 로그인해주세요.</p>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setShowLoginAlert(false)}
                className="flex-1 border border-gray-200 text-gray-500 font-semibold py-3 rounded-xl text-sm"
              >
                취소
              </button>
              <Link
                href="/auth/login"
                onClick={() => setShowLoginAlert(false)}
                className="flex-1 bg-[#1B4332] text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center"
              >
                로그인하기
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
