"use client";
import React, { useState } from "react";
import { useStockSimulator, TradeLog } from "./useStockSimulator";
import { LineChart } from "./LineChart";
import { formatNumber } from "../lib/sim-core";

// 기준값 정의
const BASE = {
  interestRate: 2.5,
  inflationRate: 2.0,
  exchangeRate: 1150,
  gdpGrowth: 2.5,
};

// 주식 3종 정의 (균형 잡힌 민감도)
const STOCKS = [
  {
    name: "TechAI",
    display: "TechAI (기술주)",
    basePrice: 10000,
    sensitivity: {
      interestRate: -30, // 금리 상승에 약함
      inflationRate: 0,
      exchangeRate: -2,
      gdpGrowth: 25, // 성장률에 민감
    },
    volatility: 0.7,
  },
  {
    name: "BankZone",
    display: "BankZone (금융주)",
    basePrice: 10000,
    sensitivity: {
      interestRate: 30, // 금리 상승에 강함
      inflationRate: -3,
      exchangeRate: 0,
      gdpGrowth: 15,
    },
    volatility: 0.5,
  },
  {
    name: "EcoEnergy",
    display: "EcoEnergy (에너지/소재주)",
    basePrice: 10000,
    sensitivity: {
      interestRate: -3,
      inflationRate: 20, // 인플레이션에 여전히 강함
      exchangeRate: 10, // 환율 상승에 강함
      gdpGrowth: 8,
    },
    volatility: 0.9,
  },
];

// 경제 변수 변화 함수
function randomDelta(base: number, range: number) {
  return base + (Math.random() * 2 - 1) * range;
}
function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(num, max));
}

// 뉴스 헤드라인 생성 (비직관적, 해석 유도)
function getNews(econ: typeof BASE) {
  const delta = {
    interestRate: econ.interestRate - BASE.interestRate,
    inflationRate: econ.inflationRate - BASE.inflationRate,
    exchangeRate: econ.exchangeRate - BASE.exchangeRate,
    gdpGrowth: econ.gdpGrowth - BASE.gdpGrowth,
  };
  const updown = (v: number) => (v > 0 ? "상승" : v < 0 ? "하락" : "보합");
  const newsTemplates = [
    `기준금리 ${updown(delta.interestRate)}, 성장률 ${updown(
      delta.gdpGrowth
    )}… 투자자들 신중 모드`,
    `환율 ${updown(delta.exchangeRate)}세, 인플레이션 ${updown(
      delta.inflationRate
    )}… 업종별 희비 교차`,
    `경제지표 혼조세, ${updown(delta.interestRate)} 금리와 ${updown(
      delta.inflationRate
    )} 물가에 시장 촉각`,
    `성장률 ${updown(delta.gdpGrowth)}, 에너지·금융주에 미묘한 영향 전망`,
    `환율·물가 ${updown(
      delta.exchangeRate + delta.inflationRate
    )}, 투자심리 변화 조짐`,
  ];
  return newsTemplates[Math.floor(Math.random() * newsTemplates.length)];
}

// 빅뉴스 이벤트 생성 함수
function getBigNews(econ: typeof BASE, prev: typeof BASE) {
  const delta = {
    interestRate: econ.interestRate - prev.interestRate,
    inflationRate: econ.inflationRate - prev.inflationRate,
    exchangeRate: econ.exchangeRate - prev.exchangeRate,
    gdpGrowth: econ.gdpGrowth - prev.gdpGrowth,
  };
  if (
    Math.abs(delta.interestRate) > 0.25 ||
    Math.abs(delta.inflationRate) > 0.25 ||
    Math.abs(delta.gdpGrowth) > 0.25 ||
    Math.abs(delta.exchangeRate) > 25
  ) {
    // 긍정/부정 빅뉴스 분리
    const positive = [
      "정부, 대규모 경기부양책 발표! 시장 기대감 고조",
      "예상 밖 호재, 투자심리 급반등!",
      "중앙은행 완화적 정책, 주요 지표 개선세!",
      "국제 협력 강화, 환율·금리 안정세 진입!",
      "신성장 산업 호황, 업종별 강세장 연출!",
    ];
    const negative = [
      "정부, 전격적인 정책 변화 단행! 시장 충격 불가피",
      "예상치 못한 글로벌 이슈, 투자심리 급변!",
      "중앙은행 긴급 발표, 주요 지표 대폭 변동!",
      "국제 정세 급변, 환율·금리 동반 출렁임!",
      "시장에 충격파, 업종별 극단적 변동성 확대!",
    ];
    // 경제 변수 변화 방향에 따라 분기
    const sum =
      delta.interestRate +
      delta.inflationRate +
      delta.gdpGrowth +
      delta.exchangeRate / 100;
    if (sum > 0) {
      return {
        type: "positive",
        text: positive[Math.floor(Math.random() * positive.length)],
      };
    } else {
      return {
        type: "negative",
        text: negative[Math.floor(Math.random() * negative.length)],
      };
    }
  }
  return null;
}

export default function Home() {
  const {
    day,
    econ,
    stocks,
    news,
    selected,
    setSelected,
    history,
    bigNews,
    isBigEvent,
    bigNewsType,
    nextDay,
    isDelisted,
    isGoal,
    addLog,
    logs,
  } = useStockSimulator();

  // 자산 상태 추가
  const [cash, setCash] = React.useState(100000); // 10만원 시작
  const [holdings, setHoldings] = React.useState<{ [key: string]: number }>({
    TechAI: 0,
    BankZone: 0,
    EcoEnergy: 0,
  });

  // 총 자산 계산 (현금 + 보유주식 시가)
  const totalAsset = cash + Object.entries(holdings).reduce((sum, [name, cnt]) => {
    const stock = stocks.find((s) => s.name === name);
    return sum + (stock ? stock.price * cnt : 0);
  }, 0);

  // 성공/파산 체크 (100만원 이상/0원 이하)
  React.useEffect(() => {
    if (totalAsset >= 200000) {
      window.location.href = `/result?success=1&asset=${Math.floor(totalAsset)}&days=${day}`;
    } else if (totalAsset < 0) {
      window.location.href = `/result?success=0&asset=0&days=${day}`;
    }
  }, [totalAsset, day]);

  // 매수/매도 핸들러
  const handleBuy = () => {
    if (!selected) return;
    const stock = stocks.find((s) => s.name === selected);
    if (!stock) return;
    if (cash < stock.price) return;
    setCash((c) => c - stock.price);
    setHoldings((h) => {
      const newHoldings = { ...h, [selected]: h[selected] + 1 };
      addLog({
        day,
        action: "buy",
        stock: selected,
        amount: 1,
        price: stock.price,
        totalAsset: cash - stock.price + Object.entries(newHoldings).reduce((sum, [name, cnt]) => {
          const s = stocks.find((ss) => ss.name === name);
          return sum + (s ? s.price * cnt : 0);
        }, 0),
        returns: 0,
        cash: cash - stock.price,
        holdings: newHoldings,
        prices: Object.fromEntries(stocks.map(s => [s.name, s.price]))
      });
      return newHoldings;
    });
  };
  const handleSell = () => {
    if (!selected) return;
    if (holdings[selected] <= 0) return;
    const stock = stocks.find((s) => s.name === selected);
    if (!stock) return;
    setCash((c) => c + stock.price);
    setHoldings((h) => {
      const newHoldings = { ...h, [selected]: h[selected] - 1 };
      addLog({
        day,
        action: "sell",
        stock: selected,
        amount: 1,
        price: stock.price,
        totalAsset: cash + stock.price + Object.entries(newHoldings).reduce((sum, [name, cnt]) => {
          const s = stocks.find((ss) => ss.name === name);
          return sum + (s ? s.price * cnt : 0);
        }, 0),
        returns: 0,
        cash: cash + stock.price,
        holdings: newHoldings,
        prices: Object.fromEntries(stocks.map(s => [s.name, s.price]))
      });
      return newHoldings;
    });
  };
  // 다음날(hold) 로그 기록
  const handleNextDay = () => {
    addLog({
      day,
      action: "hold",
      stock: selected || "",
      amount: 0,
      price: selected ? (stocks.find((s) => s.name === selected)?.price || 0) : 0,
      totalAsset: cash + Object.entries(holdings).reduce((sum, [name, cnt]) => {
        const s = stocks.find((ss) => ss.name === name);
        return sum + (s ? s.price * cnt : 0);
      }, 0),
      returns: 0,
      cash,
      holdings,
      prices: Object.fromEntries(stocks.map(s => [s.name, s.price]))
    });
    nextDay();
  };

  // 날짜 표기: 1일 = 6시간 단위, 4번마다 Day+1
  const displayDay = Math.floor((day - 1) / 4) + 1;

  React.useEffect(() => {
    for (const stock of stocks) {
      if (isGoal(stock.name)) {
        window.location.href = `/result?stock=${encodeURIComponent(
          stock.display
        )}&price=20000&days=${day}`;
        break;
      }
    }
  }, [history, stocks, day, isGoal]);

  React.useEffect(() => {
    if (day === 1 && logs.length === 0) {
      addLog({
        day: 1,
        action: "hold",
        stock: selected || "",
        amount: 0,
        price: selected ? (stocks.find((s) => s.name === selected)?.price || 0) : 0,
        totalAsset: 100000,
        returns: 0,
        cash: 100000,
        holdings: { TechAI: 0, BankZone: 0, EcoEnergy: 0 },
        prices: Object.fromEntries(stocks.map(s => [s.name, s.price]))
      });
    }
  }, [day, logs, selected, stocks, addLog]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-8 flex flex-col md:flex-row gap-8 items-center justify-center">
        {/* 왼쪽: 종목/경제/뉴스 */}
        <div className="flex-1 flex flex-col gap-6 min-w-[280px] max-w-md w-full">
          <div className="flex flex-col gap-2 text-center">
            <div className="text-lg font-semibold">Day {displayDay} <span className="text-xs text-zinc-400">({((day-1)%4+1)*6}시간)</span></div>
            <div className="flex flex-wrap justify-center gap-3 text-base">
              <span>
                금리: <b>{formatNumber(econ.interestRate, 2)}%</b>
              </span>
              <span>
                물가: <b>{formatNumber(econ.inflationRate, 2)}%</b>
              </span>
              <span>
                환율: <b>{formatNumber(econ.exchangeRate, 0)}</b>
              </span>
              <span>
                GDP: <b>{formatNumber(econ.gdpGrowth, 2)}%</b>
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {stocks.map((stock) => {
              const delisted = isDelisted(stock.name);
              return (
                <button
                  key={stock.name}
                  className={`flex justify-between items-center px-4 py-2 rounded-lg shadow-sm border transition-all font-medium ${
                    delisted
                      ? "bg-black text-white relative"
                      : selected === stock.name
                      ? "bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-300"
                      : "bg-zinc-100 dark:bg-zinc-800 border-transparent hover:border-blue-300"
                  }`}
                  onClick={() => setSelected(stock.name)}
                  disabled={delisted}
                >
                  <span>{stock.display}</span>
                  <span className="font-mono text-lg">
                    {formatNumber(stock.price, 2)}원
                  </span>
                  {delisted && (
                    <span
                      className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-white"
                      style={{
                        pointerEvents: "none",
                        background: "rgba(0,0,0,0.7)",
                      }}
                    >
                      상장폐지
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div
            className={`bg-blue-50 dark:bg-blue-900/40 rounded-lg p-3 text-center text-base font-medium shadow-inner transition-colors 
            ${
              isBigEvent
                ? bigNewsType === "positive"
                  ? "bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-100 border-2 border-green-400"
                  : "bg-pink-200 dark:bg-pink-700 text-pink-900 dark:text-pink-100 border-2 border-pink-400"
                : "text-blue-900 dark:text-blue-100"
            }`}
          >
            {news}
            <span className="block text-xs text-zinc-400 mt-1">(뉴스는 24시간마다 갱신)</span>
            {/* 경제 변수 변화 효과 요약 */}
            
          </div>
          <span className="block text-xs mt-1 text-zinc-500">
              {econ.interestRate > BASE.interestRate ? '금리↑ ' : econ.interestRate < BASE.interestRate ? '금리↓ ' : ''}
              {econ.inflationRate > BASE.inflationRate ? '물가↑ ' : econ.inflationRate < BASE.inflationRate ? '물가↓ ' : ''}
              {econ.exchangeRate > BASE.exchangeRate ? '환율↑ ' : econ.exchangeRate < BASE.exchangeRate ? '환율↓ ' : ''}
              {econ.gdpGrowth > BASE.gdpGrowth ? '성장↑' : econ.gdpGrowth < BASE.gdpGrowth ? '성장↓' : ''}
            </span>
          <button
            className="mt-2 py-2 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-md transition-colors"
            onClick={handleNextDay}
          >
            다음 날 ▶
          </button>
          <div className="flex gap-2 justify-center mt-2">
            <button
              className="py-1.5 px-4 rounded-lg bg-blue-200 hover:bg-blue-300 text-blue-900 font-semibold text-base shadow-sm transition-colors"
              onClick={() => {
                for (let i = 0; i < 3; i++) nextDay();
              }}
            >
              6시간 뒤
            </button>
            <button
              className="py-1.5 px-4 rounded-lg bg-blue-200 hover:bg-blue-300 text-blue-900 font-semibold text-base shadow-sm transition-colors"
              onClick={() => {
                for (let i = 0; i < 7; i++) nextDay();
              }}
            >
              1주일 뒤
            </button>
          </div>
          <div className="text-xs text-zinc-500 text-center mt-2">
            ※ 모든 데이터는 시뮬레이션용이며, 실제 투자와 무관합니다.
          </div>
        </div>
        {/* 오른쪽: 차트 */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-[280px] w-full max-w-xl">
          {/* 내 자산 현황 */}
          <div className="mb-2 w-full flex flex-col items-center">
            <div className="text-base font-semibold text-zinc-700 dark:text-zinc-200">
              내 총자산: <span className="font-mono text-lg">{formatNumber(totalAsset, 0)}원</span>
              <span className="ml-2 text-xs text-zinc-400">(현금: {formatNumber(cash, 0)}원, 보유주식 평가액 포함)</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {Object.entries(holdings).map(([name, cnt]) =>
                cnt > 0 ? (
                  <span key={name} className="mr-2">
                    {stocks.find((s) => s.name === name)?.display}: {cnt}주
                  </span>
                ) : null
              )}
            </div>
          </div>
          {/* 차트 */}
          {selected && isDelisted(selected) ? (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="text-3xl font-extrabold text-white bg-black rounded-xl px-8 py-12 shadow-lg">
                상장폐지
              </div>
            </div>
          ) : selected ? (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="text-lg font-bold mb-1">
                {stocks.find((s) => s.name === selected)?.display} 차트
              </div>
              <div className="w-full flex items-center justify-center">
                {history[selected].length < 2 ? (
                  <div className="text-zinc-400 text-center text-base py-12">
                    첫날에는 가격 변화가 없어 차트가 표시되지 않습니다.<br />
                    (다음 날 버튼을 눌러보세요)
                  </div>
                ) : (
                  <LineChart data={history[selected]} />
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  className="py-1 px-4 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold text-base shadow-sm transition-colors"
                  onClick={handleBuy}
                  disabled={!selected || cash < (stocks.find((s) => s.name === selected)?.price || 0)}
                >
                  매수
                </button>
                <button
                  className="py-1 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-base shadow-sm transition-colors"
                  onClick={handleSell}
                  disabled={!selected || holdings[selected] <= 0}
                >
                  매도
                </button>
              </div>
              <div className="text-sm text-zinc-500">
                {history[selected].length}일간 가격 추이
              </div>
            </div>
          ) : (
            <div className="text-zinc-400 text-center">
              종목을 클릭하면
              <br />
              가격 차트가 표시됩니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
