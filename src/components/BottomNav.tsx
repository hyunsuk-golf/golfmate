"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/my-roundings", label: "라운딩", icon: "⛳", requireAuth: true },
  { href: "/", label: "정산", icon: "💰", alwaysActive: true },
  { href: "/auth/login", label: "마이", icon: "👤", requireAuth: false, authHref: "/my-roundings" },
];

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

  const items = [
    { href: "/", label: "홈", icon: "🏠", active: true },
    { href: isLoggedIn ? "/my-roundings" : "/auth/login", label: "라운딩", icon: "⛳", active: isLoggedIn },
    { href: "/", label: "정산", icon: "💰", active: true },
    { href: isLoggedIn ? "/my-roundings" : "/auth/login", label: "마이", icon: "👤", active: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex">
        {items.map((item) => {
          const isCurrentPage = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
                isCurrentPage
                  ? "text-[#1B4332]"
                  : item.active
                  ? "text-gray-500 hover:text-[#1B4332]"
                  : "text-gray-300 pointer-events-none"
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
