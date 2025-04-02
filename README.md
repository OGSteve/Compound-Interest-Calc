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

### Deployment

This project is deployed to GitHub Pages with a custom domain. Follow these steps if you need to set up your own deployment:

### Automated Deployment with GitHub Actions

1. Push your changes to the `main` branch
2. GitHub Actions will automatically build and deploy to GitHub Pages
3. The site will be available at your custom domain (or GitHub Pages URL)

### Custom Domain Setup

1. Go to your repository settings > Pages
2. Under "Custom domain", enter your domain (e.g., compound-interest.net)
3. Check "Enforce HTTPS" if not already enabled
4. Set up your DNS provider with the following records:
   - A record: `@` pointing to GitHub Pages IPs (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153)
   - CNAME record: `www` pointing to `yourusername.github.io`

### Google Analytics Configuration

Google Analytics is configured to respect user privacy and only track anonymous usage metrics.

1. To change the Google Analytics configuration:
   - Create a new GA4 property in Google Analytics
   - Update the GA Measurement ID in GitHub repository secrets
   - This avoids exposing sensitive tracking IDs in the code repository

For more information on Google Analytics and privacy considerations, see [Google's privacy policy](https://policies.google.com/privacy).

## Usage Guide

### Basic Usage

1. **Initial Setup:**

   - Enter your initial investment amount
   - Set your monthly contribution
   - Specify annual contribution increase percentage (e.g., to model salary growth)
   - Define your investment horizon in years
   - Enter expected annual return percentage

2. **Click "Calculate"** to see projections.

3. **Analyze Results:**
   - Final balance
   - Total contributions
   - Total growth
   - Inflation-adjusted value

### Advanced Settings

Access advanced options by clicking "Show Advanced Parameters":

1. **Return Volatility:**

   - Higher values (15-20%) model typical stock market behavior
   - Lower values (5-10%) represent more stable investments
   - Very low values (2-3%) represent highly conservative portfolios

2. **Inflation Rate:**

   - Typically set to 2-3% based on central bank targets
   - Higher values model periods of high inflation

3. **Account Type:**

   - Tax-Deferred: Traditional 401(k), Traditional IRA
   - Tax-Free: Roth 401(k), Roth IRA
   - Taxable: Brokerage accounts
   - Mixed: Combination of tax-deferred and tax-free

4. **Retirement Planning:**
   - Enable to model withdrawal phase
   - Set annual withdrawal amount
   - Define withdrawal start year
   - Choose whether to adjust withdrawals for inflation

## Advanced Topics

### Understanding Probability Analysis

The probability analysis shows three key metrics:

1. **Median Outcome (50th percentile):** The middle result from 1,000 simulations
2. **90th Percentile:** Only 10% of simulations exceeded this amount
3. **10th Percentile:** 90% of simulations exceeded this amount

**Why probability analysis is often lower than the main projection:**

The main projection shows a single path using consistent returns, while Monte Carlo simulation accounts for market volatility and sequence risk. Even small volatility compounds over long periods, creating large differences.

### Tax-Efficient Withdrawal Strategy

The calculator implements an optimal withdrawal order:

1. Taxable accounts first (lowest tax impact)
2. Tax-free accounts second (no tax impact)
3. Tax-deferred accounts last (highest tax impact)

This strategy typically maximizes portfolio longevity by minimizing tax impact during retirement.

### Sequence of Returns Risk

Sequence risk refers to how the order of investment returns impacts retirement outcomes, especially when making withdrawals. Poor returns early in retirement can significantly reduce portfolio longevity, even with the same average return over time.

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
