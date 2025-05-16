import React from "react";

export function LineChart({
  data,
  color,
}: {
  data: number[];
  color?: string;
}) {
  const w = 800,
    h = 400,
    pad = 15;
  if (data.length < 2) return null;
  const min = Math.min(...data),
    max = Math.max(...data);
  // 구간별로 색상(상승: 빨강, 하락: 파랑, 보합: 직전 색상) 적용, 초록색은 사용하지 않음
  const segments = [];
  let lastColor = null;
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const x1 = pad + ((w - pad * 2) * (i - 1)) / (data.length - 1);
    const y1 = h - pad - ((h - pad * 2) * (prev - min)) / (max - min || 1);
    const x2 = pad + ((w - pad * 2) * i) / (data.length - 1);
    const y2 = h - pad - ((h - pad * 2) * (curr - min)) / (max - min || 1);
    let segColor;
    if (curr > prev) {
      segColor = "#ef4444"; // 빨강
    } else if (curr < prev) {
      segColor = "#2563eb"; // 파랑
    } else {
      segColor = lastColor || "#888"; // 변동 없으면 직전 색, 첫 구간이면 회색
    }
    segments.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={segColor}
        strokeWidth="3"
        style={{ filter: "drop-shadow(0 1px 2px #0002)" }}
      />
    );
    lastColor = segColor;
  }
  return (
    <svg
      width={w}
      height={h}
      className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-700"
    >
      {segments}
      <circle
        cx={pad}
        cy={h - pad - ((h - pad * 2) * (data[0] - min)) / (max - min || 1)}
        r="4"
        fill={segments[0]?.props?.stroke || "#888"}
      />
      <circle
        cx={w - pad}
        cy={h - pad - ((h - pad * 2) * (data[data.length - 1] - min)) / (max - min || 1)}
        r="4"
        fill={segments[segments.length - 1]?.props?.stroke || "#888"}
      />
    </svg>
  );
}
