# Enhanced Compound Interest Calculator

![Enhanced Compound Interest Calculator](https://img.shields.io/badge/version-1.0.0-blue)

A sophisticated financial planning tool that provides realistic investment projections by incorporating advanced features like monthly compounding, tax considerations, market volatility, and retirement planning.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technical Architecture](#technical-architecture)
- [Mathematical Models](#mathematical-models)
- [Setup Guide](#setup-guide)
- [Usage Guide](#usage-guide)
- [Advanced Topics](#advanced-topics)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Enhanced Compound Interest Calculator goes beyond traditional calculators by modeling real-world investment factors that significantly impact long-term results. Unlike simple calculators that use annual compounding and fixed returns, this tool accounts for monthly compounding, contribution increases, tax implications, market volatility, and withdrawal strategies to produce more realistic projections.

## Features

### Core Financial Modeling

- **Monthly Compounding:** Compounds interest monthly rather than annually for more realistic growth
- **Variable Contributions:** Model increasing contributions based on salary growth
- **Tax-Aware Calculations:** Model different account types with appropriate tax treatment:
  - Tax-deferred accounts (Traditional 401k, IRA)
  - Tax-free accounts (Roth 401k, Roth IRA)
  - Taxable brokerage accounts
  - Mixed account strategies

### Advanced Financial Factors

- **Inflation Adjustment:** See real purchasing power of future dollars
- **Fee Impact Analysis:** Account for investment expense ratios and advisory fees
- **Market Volatility:** Realistically model market ups and downs with fat-tail distributions
- **Tax-Efficient Withdrawal Strategy:** Optimize withdrawals to minimize tax impact

### Retirement Planning

- **Withdrawal Phase Modeling:** Plan your retirement income strategy
- **Sequence of Returns Risk:** Test different market timing scenarios
- **Success Rate Analysis:** Calculate probability of funds lasting through retirement
- **Tax-Aware Withdrawal Sequencing:** Implement optimal withdrawal order from different account types

### User Experience

- **Interactive Charts:** Visualize growth trajectories, contribution impact, and withdrawals
- **Probability Analysis:** See median, best-case, and worst-case scenarios
- **Data Export:** Download detailed year-by-year projections to Excel
- **Educational Content:** Learn about compound interest, market volatility, and sequence risk

## Technical Architecture

### Frontend Stack

- **Framework:** Next.js 14+ with React 18+
- **Language:** TypeScript 5.0+
- **Styling:** Tailwind CSS with custom utility classes
- **State Management:** React useState hooks
- **Visualization:** Recharts library
- **Data Export:** SheetJS (xlsx)

### Key Components

- **Calculator.tsx:** Main component containing the user interface and state management
- **calculations.ts:** Core financial calculation logic and Monte Carlo simulation
- **calculator.ts:** TypeScript interfaces for calculator inputs and results

### File Structure

```
src/
├── app/
│   ├── layout.tsx      # Main application layout
│   ├── page.tsx        # Entry point page
│   └── globals.css     # Global styles
├── components/
│   └── Calculator.tsx  # Main calculator component
├── types/
│   └── calculator.ts   # TypeScript interfaces
└── utils/
    └── calculations.ts # Financial calculation logic
```

## Mathematical Models

### Monthly Compound Interest Formula

The core formula for monthly compounding with variable contributions:

```
FV = P(1 + r/n)^(nt) + PMT × [(1 + r/n)^(nt) - 1] / (r/n) × (1 + r/n)^(nt)
```

Where:

- FV = Future Value
- P = Principal (initial investment)
- r = Annual interest rate (decimal)
- n = Compounding periods per year (12 for monthly)
- t = Time in years
- PMT = Monthly contribution amount

### Volatility Modeling

Volatility is applied at the monthly level using a scaled annual volatility:

```typescript
// Monthly volatility = Annual volatility / √12
let monthlyReturnModifier =
  ((Math.random() - 0.5) * returnVolatility) / Math.sqrt(12) / 100;

// Fat-tail adjustment (5% chance of extreme event)
if (Math.random() < 0.05) {
  monthlyReturnModifier *= 2;
}

const monthlyReturn = monthlyRate + monthlyReturnModifier;
```

### Sequence Risk Analysis

The calculator implements the Fisher-Yates shuffle algorithm to test different market return sequences during retirement:

```typescript
// Shuffle only the returns during withdrawal phase
for (let i = withdrawalReturns.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [withdrawalReturns[i], withdrawalReturns[j]] = [
    withdrawalReturns[j],
    withdrawalReturns[i],
  ];
}
```

## Setup Guide

### Prerequisites

- Node.js 18.0+
- npm 9.0+ or yarn 1.22+
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/compound-interest-calculator.git
   cd compound-interest-calculator
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create environment file (if needed):

   ```bash
   cp .env.example .env.local
   ```

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
# or
yarn build
```

## Guides

- See the docs folder for more in-depth guides.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use functional components with hooks for React code
- Document code with JSDoc comments
- Follow the existing code style and formatting

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

_Disclaimer: This calculator is provided for educational purposes only and should not be considered financial advice. Always consult with a qualified financial professional before making investment decisions._
