// 시뮬레이터 핵심 로직 및 유틸 함수 분리
export const BASE = {
  interestRate: 2.5,
  inflationRate: 2.0,
  exchangeRate: 1150,
  gdpGrowth: 2.5,
};

export const STOCKS = [
  {
    name: "TechAI",
    display: "TechAI (기술주)",
    basePrice: 10000,
    sensitivity: {
      interestRate: -40,
      inflationRate: 0,
      exchangeRate: -2,
      gdpGrowth: 30,
    },
    volatility: 0.7,
  },
  {
    name: "BankZone",
    display: "BankZone (금융주)",
    basePrice: 10000,
    sensitivity: {
      interestRate: 35,
      inflationRate: -5,
      exchangeRate: 0,
      gdpGrowth: 20,
    },
    volatility: 0.5,
  },
  {
    name: "EcoEnergy",
    display: "EcoEnergy (에너지/소재주)",
    basePrice: 10000,
    sensitivity: {
      interestRate: -5,
      inflationRate: 30,
      exchangeRate: 12,
      gdpGrowth: 10,
    },
    volatility: 2.0,
  },
];

export function randomDelta(base: number, range: number) {
  return base + (Math.random() * 2 - 1) * range;
}
export function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(num, max));
}

export function getNews(econ: typeof BASE) {
  const delta = {
    interestRate: econ.interestRate - BASE.interestRate,
    inflationRate: econ.inflationRate - BASE.inflationRate,
    exchangeRate: econ.exchangeRate - BASE.exchangeRate,
    gdpGrowth: econ.gdpGrowth - BASE.gdpGrowth,
  };
  const updown = (v: number) => (v > 0 ? "상승" : v < 0 ? "하락" : "보합");
  const newsTemplates = [
    `기준금리 ${updown(delta.interestRate)}, 성장률 ${updown(delta.gdpGrowth)}… 투자자들 신중 모드`,
    `환율 ${updown(delta.exchangeRate)}세, 인플레이션 ${updown(delta.inflationRate)}… 업종별 희비 교차`,
    `경제지표 혼조세, ${updown(delta.interestRate)} 금리와 ${updown(delta.inflationRate)} 물가에 시장 촉각`,
    `성장률 ${updown(delta.gdpGrowth)}, 에너지·금융주에 미묘한 영향 전망`,
    `환율·물가 ${updown(delta.exchangeRate + delta.inflationRate)}, 투자심리 변화 조짐`,
  ];
  return newsTemplates[Math.floor(Math.random() * newsTemplates.length)];
}

export function getBigNews(econ: typeof BASE, prev: typeof BASE) {
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
    const positive = [
      "정부, 대규모 경기부양책 발표! 시장 기대감 고조",
      "예상 밖 호재, 투자심리 급반등!",
      "중앙은행 완화적 정책, 주요 지표 개선세!",
      "국제 협력 강화, 환율·금리 안정세 진입!",
      "신성장 산업 호황, 업종별 강세장 연출!"
    ];
    const negative = [
      "정부, 전격적인 정책 변화 단행! 시장 충격 불가피",
      "예상치 못한 글로벌 이슈, 투자심리 급변!",
      "중앙은행 긴급 발표, 주요 지표 대폭 변동!",
      "국제 정세 급변, 환율·금리 동반 출렁임!",
      "시장에 충격파, 업종별 극단적 변동성 확대!"
    ];
    const sum = delta.interestRate + delta.inflationRate + delta.gdpGrowth + delta.exchangeRate / 100;
    if (sum > 0) {
      return { type: "positive", text: positive[Math.floor(Math.random() * positive.length)] };
    } else {
      return { type: "negative", text: negative[Math.floor(Math.random() * negative.length)] };
    }
  }
  return null;
}

export function formatNumber(n: number, digits = 2) {
  return n.toLocaleString("ko-KR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
