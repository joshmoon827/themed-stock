"use client";
import React, { useEffect, useState } from "react";

export default function ResultPage({ searchParams }: any) {
  // 쿼리스트링으로 종목명, 가격, 일수 등 전달 가능
  const { stock, price, days } = searchParams || {};
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("stock-trade-logs");
      if (raw) setLogs(JSON.parse(raw));
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white">
      <div className="bg-white/10 rounded-2xl shadow-xl p-10 flex flex-col items-center gap-6 border border-zinc-700">
        <h1 className="text-3xl font-extrabold mb-2">🎉 목표 달성!</h1>
        {days && <div className="text-lg text-zinc-300">{days}일 만에 달성</div>}
        {price && <div className="text-lg text-zinc-400">최종 가격: <b>{Number(price).toLocaleString()}원</b></div>}
        <a href="/" className="mt-6 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow">처음으로</a>
        <a href="/result/log" className="mt-2 px-6 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-800 text-white font-semibold text-base shadow">거래/수익 로그 보기</a>
      </div>
    </div>
  );
}
