"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export function BottomNav() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  const myHref = isLoggedIn ? "/my" : "/auth/login";
  const items = [
    { href: "/",              label: "홈",   icon: "🏠", activeOn: ["/"] },
    { href: isLoggedIn ? "/my-roundings" : "/auth/login", label: "라운딩", icon: "⛳", activeOn: ["/my-roundings", "/rounding"] },
    { href: "/settlement",   label: "정산", icon: "💰", activeOn: ["/settlement"] },
    { href: myHref, label: "마이", icon: "👤", activeOn: ["/my", "/members"] },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex">
        {items.map((item) => {
          const isActive =
            pathname === "/" ? item.href === "/"
            : item.activeOn.some((p) => pathname.startsWith(p));
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
  );
}
