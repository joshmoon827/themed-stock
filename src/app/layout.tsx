import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "경제구조 기반 주식 시뮬레이터 | EasyStock",
  description:
    "거시경제 변수(금리, 물가, 환율, 성장률)와 산업별 민감도를 학습할 수 있는 콘솔/웹 기반 주식 시뮬레이션 게임. 실시간 뉴스, 차트, 거래 로그, 자산 관리, 교육용 시나리오 제공.",
  keywords: [
    "주식 시뮬레이터",
    "경제 교육",
    "거시경제",
    "금리",
    "인플레이션",
    "환율",
    "GDP 성장률",
    "투자 게임",
    "시뮬레이션",
    "한국어",
    "EasyStock",
    "교육용",
  ],
  authors: [{ name: "Josh Moon" }],
  creator: "Josh Moon",
  openGraph: {
    title: "경제구조 기반 주식 시뮬레이터 | EasyStock",
    description:
      "거시경제 변수와 산업별 민감도를 학습할 수 있는 웹 기반 주식 시뮬레이션 게임.",
    type: "website",
    locale: "ko_KR",
    url: "https://easystock.example.com/",
    images: [
      {
        url: "/globe.svg",
        width: 1200,
        height: 630,
        alt: "EasyStock 경제구조 기반 주식 시뮬레이터 대표 이미지",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "경제구조 기반 주식 시뮬레이터 | EasyStock",
    description:
      "거시경제 변수와 산업별 민감도를 학습할 수 있는 웹 기반 주식 시뮬레이션 게임.",
    images: [
      {
        url: "/globe.svg",
        alt: "EasyStock 경제구조 기반 주식 시뮬레이터 대표 이미지",
      },
    ],
  },
  metadataBase: new URL("https://easystock.example.com/"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
