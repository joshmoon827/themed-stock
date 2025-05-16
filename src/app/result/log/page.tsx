"use client";
import React, { useEffect, useState } from "react";

export default function ResultLogPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("stock-trade-logs");
      if (raw) setLogs(JSON.parse(raw));
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white">
      <div className="w-full max-w-2xl bg-zinc-800/80 rounded-xl p-6 shadow border border-zinc-700 mt-10">
        <h2 className="text-xl font-bold mb-4">📑 거래/수익 로그</h2>
        {logs.length === 0 && <div className="text-zinc-400">로그 데이터가 없습니다.</div>}
        <ol className="space-y-3">
          {logs.map((log, idx) => (
            <li key={idx} className="bg-zinc-900/80 rounded-lg p-4 border border-zinc-700">
              <div className="font-semibold text-zinc-200">{log.day}일차</div>
              <div className="text-zinc-400 text-sm mb-1">액션: <b>{log.action}</b></div>
              <div className="text-zinc-400 text-sm mb-1">현금: {Number(log.cash).toLocaleString()}원, 총자산: {Number(log.totalAsset).toLocaleString()}원</div>
              <div className="text-zinc-400 text-sm mb-1">보유: {Object.entries(log.holdings || {}).map(([k, v]) => `${k}: ${v}`).join(", ")}</div>
              <div className="text-zinc-400 text-sm">주가: {Object.entries(log.prices || {}).map(([k, v]) => `${k}: ${Number(v).toLocaleString()}원`).join(", ")}</div>
              {log.returns !== undefined && (
                <div className={"text-sm mt-1 " + (log.returns > 0 ? "text-red-400" : log.returns < 0 ? "text-blue-400" : "text-zinc-400")}>일일 수익률: {log.returns > 0 ? "+" : ""}{log.returns.toFixed(2)}%</div>
              )}
            </li>
          ))}
        </ol>
        <a href="/result" className="block mt-8 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-base text-center shadow">결과로 돌아가기</a>
      </div>
    </div>
  );
}
