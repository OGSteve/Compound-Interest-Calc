# Enhanced Compound Interest Calculator: User Guide

## Understanding Your Results

This guide explains what each number in your calculation results means and how it's determined.

### Why Results Change Each Time You Calculate

You may notice that even with identical inputs, your results vary slightly each time you click "Calculate." This is intentional and reflects how real markets behave:

- Real investment returns fluctuate year-to-year, not growing at a steady rate
- The calculator simulates this market randomness using your "Return Volatility" setting
- Each calculation represents a different possible market scenario
- This approach is more realistic than assuming the same return every year

The Final Balance and other main results show one possible path, while the Probability Analysis (Median, 90th, and 10th percentile values) shows the range of outcomes from running thousands of different scenarios.

### Your Input Parameters

The calculator uses these parameters to project your investment's growth:

- **Initial Investment**: Your starting amount
- **Monthly Contribution**: How much you add each month
- **Annual Contribution Increase**: How much your monthly contribution grows each year
- **Investment Horizon**: How many years you'll be investing
- **Expected Annual Return**: Average yearly investment return (before inflation)
- **Return Volatility**: How much returns might vary year-to-year
- **Inflation Rate**: Annual increase in prices that reduces purchasing power
- **Fund Expense Ratio**: The annual fee charged by funds to cover operating expenses
- **Advisory Fee**: The fee paid for a financial advisor for portfolio management
- **Account Type**: Tax treatment of your investment account

### Main Results Explained

#### Final Balance

This is the projected total value of your investment at the end of your investment horizon. It includes:

- Your initial investment
- All contributions made over time
- Investment growth through compound returns
- Minus any fees

This number shows the nominal future value, not adjusted for inflation.

#### Total Contributions

This represents all the money you personally invested:

- Your initial investment
- All monthly contributions over the investment period (including annual increases)

This helps you see how much of your final balance came from your own investments versus investment growth.

#### Total Growth

This shows how much your money grew from investment returns:

- Total Growth = Final Balance - Total Contributions - Fees

This number demonstrates the power of compound interest, showing your investment earnings over time.

#### Inflation-Adjusted Value

This shows what your final balance would be worth in today's purchasing power:

- It accounts for how inflation reduces the value of money over time
- For example, $1,000,000 in 30 years might only buy what $550,000 buys today

This gives you a more realistic picture of your investment's future value.

### Probability Analysis

These numbers come from running thousands of market simulations with your inputs:

#### Median Outcome

The middle result from all simulations - there's a 50% chance your actual result will be higher than this amount.

This is typically lower than the Final Balance because the standard projection often uses a constant rate of return, while real markets have ups and downs.

#### 90th Percentile

A very optimistic outcome - only 10% of simulations exceeded this amount.

This shows what might happen if market conditions are particularly favorable during your investment period.

#### 10th Percentile

A pessimistic outcome - 90% of simulations performed better than this.

This helps you understand potential downside risk and plan accordingly.

### Investment Growth Chart

The chart visualizes:

- **Balance** (blue): Your projected investment value over time
- **Inflation-Adjusted** (teal): What that value is worth in today's purchasing power
- **Initial Investment** line: Your starting amount for reference

This shows how your investment grows over time, with the steeper curve in later years demonstrating compound interest's exponential effect.

### Retirement Analysis (if enabled)

If you've enabled retirement withdrawal phase, you'll see additional information:

#### Retirement Chart

Shows your portfolio balance during the withdrawal phase:

- Starting with your ending balance from the investment growth phase
- Decreasing as you make withdrawals
- Still potentially growing from continued investment returns

#### Retirement Metrics

- **Years of Income Required**: Your specified retirement period
- **Projected Longevity**: How long your portfolio will actually last
- **Success Rate**: Likelihood your money will last through retirement

## Advanced Parameters

### Return Volatility

Return Volatility represents how much investment returns tend to fluctuate:

- With 15% volatility (default) and a 7% expected return, annual returns typically range from -7% to +23%
- Lower volatility (5-10%): Smoother returns, like a bond-heavy portfolio
- Medium volatility (15-20%): Moderate fluctuations, typical for a balanced portfolio
- Higher volatility (25%+): Larger swings, like an aggressive stock portfolio

The calculator occasionally simulates larger market moves (both up and down) to reflect real-world market behavior.

### Investment Fees

- **Expense Ratio**: Fees charged by investment funds (default: 0.1%)
- **Advisory Fee**: Fees charged by financial advisors (default: 0% , self-managed)

These fees are deducted as monthly equivalents (e.g. 0.1%/12) from your investment and compound over time. Even small fee differences can significantly impact long-term results.

### Inflation Rate

The calculator factors in how inflation reduces purchasing power:

- The historical average is around 2-3% annually
- This helps you understand what your money will actually be worth

### Account Type

Different investment accounts have different tax treatments:

- **Tax-Deferred** (401k, Traditional IRA): No taxes on contributions or growth until withdrawal, then taxed as ordinary income
- **Tax-Free** (Roth accounts): Contributions are taxed, but growth and withdrawals are tax-free
- **Taxable**: Contributions are taxed, dividends taxed annually, and withdrawals may trigger capital gains tax
- **Mixed**: Combination of tax-deferred and tax-free accounts

During retirement withdrawals, the calculator uses a tax-efficient strategy that withdraws from accounts in this order:

1. Taxable accounts first (typically lower tax rates)
2. Tax-free accounts next (no tax impact)
3. Tax-deferred accounts last (typically higher tax rates)

### Retirement Planning

When enabled, this models taking money out of your investments:

- **Annual Withdrawal**: How much you'll take out each year
- **Withdrawal Adjusted for Inflation**: Whether withdrawals increase with inflation
- **Retirement Years**: How long you need the money to last
- **Expected Return in Retirement**: Typically lower than during accumulation

## Monte Carlo Simulation

The calculator uses Monte Carlo simulation to model thousands of possible market scenarios:

1. Each simulation uses a random sequence of returns based on your Expected Annual Return and Return Volatility
2. These sequences model the unpredictable nature of markets
3. By running thousands of simulations, the calculator generates a range of possible outcomes rather than a single projection
4. This provides a more realistic view of your investment's potential performance

## Factors Affecting Your Results

### Most Impactful Factors

1. **Investment Horizon**: Longer time periods dramatically increase final balances due to compound growth
2. **Expected Annual Return**: Higher returns compound over time, significantly affecting outcomes
3. **Monthly Contribution**: Consistent contributions build substantial wealth over time

### Other Important Factors

- **Return Volatility**: Impacts the range of potential outcomes
- **Inflation Rate**: Affects the real purchasing power of your final balance
- **Tax Treatment**: Different account types can lead to significant differences in after-tax returns
- **Fees**: Even small fees can substantially reduce returns over long periods
