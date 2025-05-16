<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

// 🧠 경제 구조 기반 주식 시뮬레이터를 작성해주세요 (Copilot용 프롬프트)
//
// 🎯 목표:
// 사용자가 거시경제 요인을 학습할 수 있는 콘솔 기반 주식 시뮬레이터를 만듭니다.
//
// 📌 주식 3종을 정의해주세요. 각각 산업별로 민감도가 다릅니다:
// - TechAI (기술주): 금리↑에 약함, 환율 영향 적음
// - BankZone (금융주): 금리↑에 강함
// - EcoEnergy (에너지/소재주): 인플레이션↑, 환율↑에 강함
//
// 🏦 경제 변수 4가지를 매일 조금씩 변화시켜주세요:
// - 금리 interestRate (기본값 2.5%, ±0.1%)
// - 물가 inflationRate (기본값 2.0%, ±0.2%)
// - 환율 exchangeRate (기본값 1150, ±10)
// - 성장률 gdpGrowth (기본값 2.5%, ±0.2%)
//
// 📉 각 주식은 다음 가중치에 따라 가격이 움직입니다:
// 가격 변화율 =
//   (금리 변화량) * 금리 민감도 +
//   (물가 변화량) * 물가 민감도 +
//   (환율 변화량) * 환율 민감도 +
//   (GDP 변화량) * 성장 민감도 +
//   변동성 난수 (volatility)
//
// 모든 변화량은 "현재값 - 기준값"입니다.
// Day 1
// 금리: 2.61%, 물가: 2.14%, 환율: 1158, GDP: 2.6%
// TechAI: 9981.12원
// BankZone: 10092.78원
// EcoEnergy: 10203.55원
//
// 👀 뉴스 제목은 단순하지 않게 생성해주세요 (예: "기준금리 인상 단행, 은행주에 미세한 영향 가능성").
// => 이 뉴스는 변수 상태를 요약하며, 사용자가 직접 판단하게 유도해야 합니다.
//
// 📦 입력/출력은 파일 없이 콘솔 기반으로 동작해야 합니다.
// 외부 API는 사용하지 마세요.
