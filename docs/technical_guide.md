# Enhanced Compound Interest Calculator: Technical Documentation

## Overview

The Enhanced Compound Interest Calculator provides a sophisticated model for investment growth and retirement planning. Unlike simple calculators, it accounts for monthly compounding, contribution increases, tax implications, market volatility, and withdrawal strategies to produce realistic projections.

### Understanding Randomness in the Calculator

The calculator simulates real-world market randomness to provide realistic investment projections:

1. **Return Volatility** represents the standard deviation of annual returns around the expected average:

   - With 15% volatility (typical for stock investments) and an 8% expected return, about two-thirds of annual returns will fall between -7% and +23%
   - Higher volatility creates a wider range of possible outcomes

2. **Monthly Random Returns** are calculated using:

   ```typescript
   let monthlyReturnModifier =
     ((Math.random() - 0.5) * returnVolatility) / Math.sqrt(12) / 100;
   const monthlyReturn = monthlyRate + monthlyReturnModifier;
   ```

3. **Fat-Tail Events** are modeled to simulate market crashes and rallies:
   ```typescript
   // Simple fat-tail adjustment: occasionally generate more extreme returns
   if (Math.random() < 0.05) {
     // 5% chance of a more extreme event
     monthlyReturnModifier *= 2;
   }
   ```
   This creates a 5% chance each month of doubling the random variation, simulating unexpected market moves.

- [More on Randomness](randomness.md)

## Core Calculation Functions

The calculator's backend logic (in `calculations.ts`) contains these key functions:

| Function                           | Purpose                                                          |
| ---------------------------------- | ---------------------------------------------------------------- |
| `calculateMonthlyCompoundInterest` | Main calculation function for investment growth                  |
| `calculateSequenceRisk`            | Analyzes different market scenarios using Monte Carlo simulation |
| `calculateRetirementPhase`         | Models the retirement withdrawal phase                           |
| `calculateRetirementSuccessRate`   | Calculates probability of retirement plan success                |
| `formatCurrency`                   | Formats numbers as currency strings                              |

## How Each Output is Calculated

### Final Balance

The Final Balance is the sum of all account balances at the end of the investment horizon:

```typescript
// From calculations.ts
results.summary.finalBalance =
  balanceTaxDeferred + balanceTaxFree + balanceTaxable;
```

This value is calculated through a monthly compounding process that:

1. Starts with the initial investment
2. Adds monthly contributions (with annual increases)
3. Applies market returns (with volatility)
4. Deducts fees and taxes
5. Processes withdrawals (if in retirement phase)

### Total Contributions

Total Contributions represents all money invested into the account:

```typescript
// Initial tracking
let _totalContributions = initialInvestment;

// After processing all years
results.summary.totalContributions = _totalContributions;
```

For each month, contributions are calculated with compound annual increases:

```typescript
const currentMonthlyContribution =
  monthlyContribution * Math.pow(1 + annualContributionIncrease / 100, year);
```

### Total Growth

Total Growth shows how much your investment grew from returns, calculated as:

```typescript
results.summary.totalGrowth =
  balanceTaxDeferred +
  balanceTaxFree +
  balanceTaxable -
  _totalContributions +
  totalWithdrawals;
```

This represents the difference between final balance and total contributions, adjusted for any withdrawals.

### Inflation-Adjusted Value

The Inflation-Adjusted value shows what your final balance would be worth in today's purchasing power:

```typescript
results.summary.inflationAdjustedValue =
  (balanceTaxDeferred + balanceTaxFree + balanceTaxable) /
  Math.pow(1 + inflationRate / 100, investmentHorizon);
```

This divides the final balance by an inflation factor based on the specified inflation rate and investment horizon.

### Probability Analysis

The Probability Analysis metrics come from the `calculateSequenceRisk` function, which:

1. Runs multiple simulations (default 1000) with different return sequences
2. For each simulation, calculates a final balance
3. Sorts the results and extracts percentiles:

```typescript
return {
  worstCaseScenario: finalBalances[Math.floor(finalBalances.length * 0.1)], // 10th percentile
  bestCaseScenario: finalBalances[Math.floor(finalBalances.length * 0.9)], // 90th percentile
  medianScenario: finalBalances[Math.floor(finalBalances.length * 0.5)], // 50th percentile
  successRate: successCount / simulations,
};
```

This provides a range of potential outcomes rather than just one projection.

## Market Volatility Modeling

Instead of using fixed returns, the calculator models market volatility for more realistic projections:

```typescript
// Basic volatility using normal distribution approximation
let monthlyReturnModifier =
  ((Math.random() - 0.5) * returnVolatility) / Math.sqrt(12) / 100;

// Fat-tail adjustment for extreme market events
if (Math.random() < 0.05) {
  // 5% chance of extreme event
  monthlyReturnModifier *= 2;
}

const monthlyReturn = monthlyRate + monthlyReturnModifier;
```

This creates a distribution of returns that better matches real-world market behavior.

## Fee Calculations

The calculator models two types of investment fees that impact returns:

1. **Expense Ratio**: Fees charged by investment funds
2. **Advisory Fee**: Fees charged by financial advisors

These are processed monthly:

```typescript
// Convert annual percentages to monthly rates
const monthlyExpenseRatio = fees.expenseRatio / 12 / 100;
const monthlyAdvisoryFee = fees.advisoryFee / 12 / 100;

// Apply to each account balance
const feeTaxDeferred =
  balanceTaxDeferred * (monthlyExpenseRatio + monthlyAdvisoryFee);
const feeTaxFree = balanceTaxFree * (monthlyExpenseRatio + monthlyAdvisoryFee);
const feeTaxable = balanceTaxable * (monthlyExpenseRatio + monthlyAdvisoryFee);

// Deduct fees from respective balances
balanceTaxDeferred -= feeTaxDeferred;
balanceTaxFree -= feeTaxFree;
balanceTaxable -= feeTaxable;
```

Default values are 0.1% expense ratio and 0% advisory fee, but these can be modified in the inputs.

## Tax Treatment by Account Type

The calculator handles different account types with appropriate tax treatment:

| Account Type | Tax on Contributions  | Tax on Growth                          | Tax on Withdrawals          |
| ------------ | --------------------- | -------------------------------------- | --------------------------- |
| Tax-deferred | None                  | None                                   | Taxed as income             |
| Tax-free     | Taxed                 | None                                   | None                        |
| Taxable      | Taxed                 | Dividends/capital gains taxed annually | Capital gains on withdrawal |
| Mixed        | Depends on allocation | Depends on allocation                  | Depends on allocation       |

### Tax-Deferred Accounts (401k/Traditional IRA)

```typescript
// Apply income tax on withdrawals
const incomeTax = withdrawal * (taxRate.income / 100);
```

### Taxable Accounts

```typescript
// Monthly dividend taxes
const dividendPortion = earningsTaxable * 0.4; // Assumes 40% of returns are dividends
const monthlyTaxes = dividendPortion * (taxRate.dividends / 100);

// Capital gains taxes on withdrawal
const estimatedGain = withdrawal * 0.5; // Assumes 50% of withdrawal is capital gain
const capitalGainsTax = estimatedGain * (taxRate.capitalGains / 100);
```

### Tax-Efficient Withdrawal Strategy

The calculator implements this withdrawal sequence:

1. First from taxable accounts (lower capital gains rates)
2. Then from tax-free accounts (no tax impact)
3. Finally from tax-deferred accounts (ordinary income rates)

```typescript
// 1. First withdraw from taxable accounts
if (balanceTaxable > 0) {
  const withdrawal = Math.min(remainingWithdrawal, balanceTaxable);
  const estimatedGain = withdrawal * 0.5;
  const capitalGainsTax = estimatedGain * (taxRate.capitalGains / 100);

  yearWithdrawalTaxes += capitalGainsTax;
  balanceTaxable -= withdrawal;
  remainingWithdrawal -= withdrawal;
}

// Continue with tax-free, then tax-deferred accounts
```

## Retirement Withdrawal Phase

When retirement withdrawals are enabled, the calculator:

1. Calculates the withdrawal amount (adjusted for inflation if selected)
2. Implements a tax-efficient withdrawal strategy:
   - First from taxable accounts
   - Then from tax-free accounts
   - Finally from tax-deferred accounts
3. Applies taxes as appropriate for each account type
4. Projects how long the portfolio will last
5. Calculates a success rate using Monte Carlo simulation

```typescript
// Sample of withdrawal strategy implementation
// 1. First withdraw from taxable accounts
if (balanceTaxable > 0) {
  const withdrawal = Math.min(remainingWithdrawal, balanceTaxable);
  const estimatedGain = withdrawal * 0.5; // Assume 50% is gain
  const capitalGainsTax = estimatedGain * (taxRate.capitalGains / 100);

  yearWithdrawalTaxes += capitalGainsTax;
  balanceTaxable -= withdrawal;
  remainingWithdrawal -= withdrawal;
}

// 2. Then from tax-free accounts
if (remainingWithdrawal > 0 && balanceTaxFree > 0) {
  const withdrawal = Math.min(remainingWithdrawal, balanceTaxFree);
  balanceTaxFree -= withdrawal;
  remainingWithdrawal -= withdrawal;
}

// 3. Finally from tax-deferred accounts
if (remainingWithdrawal > 0 && balanceTaxDeferred > 0) {
  const withdrawal = Math.min(remainingWithdrawal, balanceTaxDeferred);
  const incomeTax = withdrawal * (taxRate.income / 100);

  yearWithdrawalTaxes += incomeTax;
  balanceTaxDeferred -= withdrawal;
  remainingWithdrawal -= withdrawal;
}
```

## Sequence of Returns Risk Analysis

The calculator analyzes sequence risk (the impact of return order, especially important during withdrawals):

```typescript
// Shuffle only the returns during withdrawal phase
const contributionReturns = annualReturns.slice(0, withdrawalStartYear);
const withdrawalReturns = annualReturns.slice(withdrawalStartYear);

// Fisher-Yates shuffle algorithm for withdrawal phase returns
for (let i = withdrawalReturns.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [withdrawalReturns[i], withdrawalReturns[j]] = [
    withdrawalReturns[j],
    withdrawalReturns[i],
  ];
}
```

This simulates different market scenarios to determine:

- Success rate (percentage of scenarios where money doesn't run out)
- Distribution of final balances
- Impact of different market sequences on retirement outcomes
