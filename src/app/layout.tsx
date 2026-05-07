import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GolfMate — 골프 정산 계산기",
  description: "골프 약속과 정산, 카톡보다 쉽게.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-[#F8F9FA]">{children}</body>
    </html>
  );
}
