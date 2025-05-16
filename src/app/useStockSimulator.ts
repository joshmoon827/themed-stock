import { useState } from "react";
import { BASE, STOCKS, randomDelta, clamp, getNews, getBigNews } from "../lib/sim-core";

export type TradeLog = {
  day: number;
  action: "buy" | "sell" | "hold";
  stock: string;
  amount: number;
  price: number;
  totalAsset: number;
  returns: number; // 일일 수익률(%)
  cash: number;
  holdings: { [key: string]: number };
  prices: { [key: string]: number };
};

function getStoredLogs(): TradeLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("stock-trade-logs");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLogs(logs: TradeLog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("stock-trade-logs", JSON.stringify(logs));
}

export function useStockSimulator() {
  const [day, setDay] = useState(1);
  const [econ, setEcon] = useState({ ...BASE });
  const [stocks, setStocks] = useState(
    STOCKS.map((s) => ({ ...s, price: s.basePrice }))
  );
  const [news, setNews] = useState(getNews(BASE));
  const [selected, setSelected] = useState<string | null>("TechAI");
  const [history, setHistory] = useState<{ [key: string]: number[] }>(
    Object.fromEntries(STOCKS.map((s) => [s.name, [s.basePrice]]))
  );
  const [bigNews, setBigNews] = useState<string | null>(null);
  const [isBigEvent, setIsBigEvent] = useState(false);
  const [prevEcon, setPrevEcon] = useState({ ...BASE });
  const [bigNewsType, setBigNewsType] = useState<"positive"|"negative"|null>(null);
  const [logs, setLogs] = useState<TradeLog[]>(getStoredLogs());

  const nextDay = () => {
    const nextEcon = {
      interestRate: clamp(randomDelta(econ.interestRate, 0.1 * 4), 1.0, 5.0),
      inflationRate: clamp(randomDelta(econ.inflationRate, 0.2 * 4), 0.5, 5.0),
      exchangeRate: clamp(randomDelta(econ.exchangeRate, 10 * 4), 1000, 1400),
      gdpGrowth: clamp(randomDelta(econ.gdpGrowth, 0.2 * 4), -2.0, 6.0),
    };
    let bigEvent = false;
    let bigNewsText = null;
    let bigType: "positive"|"negative"|null = null;
    if (Math.random() < 0.1) {
      const keys = ["interestRate", "inflationRate", "exchangeRate", "gdpGrowth"] as const;
      const key = keys[Math.floor(Math.random() * keys.length)];
      let change = 0;
      if (key === "exchangeRate") change = (Math.random() * 2 - 1) * 120;
      else change = (Math.random() * 2 - 1) * 0.7;
      if (key === "interestRate") nextEcon.interestRate = clamp(nextEcon.interestRate + change, 1.0, 5.0);
      if (key === "inflationRate") nextEcon.inflationRate = clamp(nextEcon.inflationRate + change, 0.5, 5.0);
      if (key === "exchangeRate") nextEcon.exchangeRate = clamp(nextEcon.exchangeRate + change, 1000, 1400);
      if (key === "gdpGrowth") nextEcon.gdpGrowth = clamp(nextEcon.gdpGrowth + change, -2.0, 6.0);
      bigEvent = true;
      const generated = getBigNews(nextEcon, econ);
      if (generated) {
        bigNewsText = `[빅뉴스] ${generated.text}`;
        bigType = generated.type === "positive" ? "positive" : "negative";
      } else {
        bigNewsText = "[빅뉴스] 시장에 큰 변동!";
        bigType = null;
      }
    } else {
      const detected = getBigNews(nextEcon, econ);
      if (detected) {
        bigEvent = true;
        bigNewsText = `[빅뉴스] ${detected.text}`;
        bigType = detected.type === "positive" ? "positive" : "negative";
      }
    }
    const delta = {
      interestRate: nextEcon.interestRate - BASE.interestRate,
      inflationRate: nextEcon.inflationRate - BASE.inflationRate,
      exchangeRate: nextEcon.exchangeRate - BASE.exchangeRate,
      gdpGrowth: nextEcon.gdpGrowth - BASE.gdpGrowth,
    };
    const nextStocks = stocks.map((stock) => {
      const { sensitivity, volatility, basePrice, name } = stock;
      let change =
        delta.interestRate * sensitivity.interestRate +
        delta.inflationRate * sensitivity.inflationRate +
        delta.exchangeRate * sensitivity.exchangeRate +
        delta.gdpGrowth * sensitivity.gdpGrowth +
        (Math.random() * 2 - 1) * volatility * 10 * 3; // 변동성 3배
      if (bigEvent && bigType === "positive") {
        const maxChange = Math.abs(basePrice * 0.3);
        change = Math.max(0, Math.min(change, maxChange));
      } else if (bigEvent && bigType === "negative") {
        const maxChange = Math.abs(basePrice * 0.3);
        change = Math.min(0, Math.max(change, -maxChange));
      } else if (bigEvent) {
        const maxChange = basePrice * 0.3;
        change = Math.max(Math.min(change, maxChange), -maxChange);
      }
      let price = stock.price + change;
      if (name === "EcoEnergy") {
        // 상승분만 1.6배
        if (change > 0) {
          price = stock.price + change * 1.6;
        }
        price = Math.max(price, 4000);
        price = stock.price + (price - stock.price) * 0.7;
      } else {
        price = Math.max(price, basePrice * 0.4);
      }
      return { ...stock, price };
    });
    setDay((d) => {
      const newDay = d + 1;
      // 4턴(24시간)마다 뉴스 갱신
      if (newDay % 4 === 1) {
        setNews(bigEvent ? bigNewsText! : getNews(nextEcon));
      }
      return newDay;
    });
    setPrevEcon(econ);
    setEcon(nextEcon);
    setStocks(nextStocks);
    setBigNews(bigEvent ? bigNewsText! : null);
    setIsBigEvent(bigEvent);
    setBigNewsType(bigType);
    setHistory((prev) => {
      const updated = { ...prev };
      nextStocks.forEach((s) => {
        // 30개까지만 유지, 새로 추가된 수만큼 앞에서 삭제
        const prevArr = updated[s.name] || [];
        const arr = [...prevArr, s.price];
        const over = arr.length - 80;
        updated[s.name] = over > 0 ? arr.slice(over) : arr;
      });
      return updated;
    });
  };

  function isDelisted(name: string) {
    const arr = history[name];
    if (!arr || arr.length < 5) return false;
    const last5 = arr.slice(-5);
    return last5.every((v) => v === 5000);
  }
  function isGoal(name: string) {
    const arr = history[name];
    if (!arr || arr.length < 5) return false;
    const last5 = arr.slice(-5);
    return last5.every((v) => v === 20000);
  }

  // 로그 추가 함수: page.tsx에서 매수/매도/다음날 등에서 호출
  function addLog(log: TradeLog) {
    setLogs((prev) => {
      const updated = [...prev, log];
      saveLogs(updated);
      return updated;
    });
  }

  // 로그 불러오기 함수 (result/page.tsx에서 사용)
  function getLogs() {
    return logs;
  }

  return {
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
    logs,
    addLog,
    getLogs,
  };
}
