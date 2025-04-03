## Example Setup

Sample inputs:

- Initial investment: $10,000
- Monthly contribution: $500
- Expected annual return: 8% (clean number for calculations)
- Return volatility: 15% (typical stock market volatility)
- Investment horizon: 3 years (keeping it brief for clarity)
- Account type: Tax-free (to simplify tax calculations)

## How Randomness Is Applied

### Step 1: Converting Annual Rates to Monthly

First, the calculator converts the annual expected return to a monthly rate:

```
Monthly rate = Expected annual return / 12 / 100
Monthly rate = 8% / 12 / 100 = 0.00667 (0.667% per month)
```

### Step 2: Introducing Volatility Each Month

Now for each month, the calculator introduces randomness:

```typescript
// From the code in calculations.ts
let monthlyReturnModifier =
  ((Math.random() - 0.5) * returnVolatility) / Math.sqrt(12) / 100;

// Occasionally simulate market shocks (5% of the time)
if (Math.random() < 0.05) {
  monthlyReturnModifier *= 2;
}

const monthlyReturn = monthlyRate + monthlyReturnModifier;
```

Examples:

#### Month 1:

1. Base monthly rate: 0.667%
2. Random number generated: 0.73 (between 0 and 1)
3. Adjusted: (0.73 - 0.5) = 0.23
4. Apply volatility: 0.23 × 15% ÷ √12 ÷ 100 = 0.00099
5. Check for market shock: Random number 0.12 > 0.05, so no shock
6. Final monthly return: 0.667% + 0.099% = 0.766%
7. Growth calculation: $10,000 × 0.00766 = $76.60
8. Add monthly contribution: $500
9. End of month balance: $10,576.60

#### Month 2:

1. Base monthly rate: 0.667%
2. Random number generated: 0.31 (between 0 and 1)
3. Adjusted: (0.31 - 0.5) = -0.19
4. Apply volatility: -0.19 × 15% ÷ √12 ÷ 100 = -0.00082
5. Check for market shock: Random number 0.02 < 0.05, so YES shock
6. Double the modifier: -0.00082 × 2 = -0.00164
7. Final monthly return: 0.667% - 0.164% = 0.503%
8. Growth calculation: $10,576.60 × 0.00503 = $53.20
9. Add monthly contribution: $500
10. End of month balance: $11,129.80

#### Month 3:

1. Base monthly rate: 0.667%
2. Random number generated: 0.51 (just above 0.5)
3. Adjusted: (0.51 - 0.5) = 0.01
4. Apply volatility: 0.01 × 15% ÷ √12 ÷ 100 = 0.00004$$
5. Check for market shock: Random number 0.27 > 0.05, so no shock
6. Final monthly return: 0.667% + 0.004% = 0.671%
7. Growth calculation: $11,129.80 × 0.00671 = $74.68
8. Add monthly contribution: $500
9. End of month balance: $11,704.48

### What's Really Happening Here

1. **The Random Factor**: `Math.random()` generates a number between 0 and 1

   - Subtracting 0.5 gives a range from -0.5 to +0.5
   - This creates equal chance of positive or negative variation

2. **Scaling by Volatility**: Multiplying by the volatility parameter (15%) scales the variation

   - Higher volatility = larger random swings

3. **Monthly Adjustment**: Dividing by √12 converts annual volatility to monthly

   - This is a standard financial conversion for time scaling

4. **Market Shock Simulation**: The 5% chance of doubling the modifier simulates:
   - Occasional larger market moves (both up and down)
   - Creates a more realistic "fat-tailed" distribution like real markets

### Visualizing the Randomness Over Time

Here's what three years might look like with our example (showing quarterly for brevity):

| Quarter | Base Return | Random Modifier | Actual Return | Quarter Growth | Balance |
| ------- | ----------- | --------------- | ------------- | -------------- | ------- |
| Start   | -           | -               | -             | -              | $10,000 |
| Q1      | 2.00%       | +0.83%          | 2.83%         | $325           | $12,325 |
| Q2      | 2.00%       | -1.25%          | 0.75%         | $201           | $14,026 |
| Q3      | 2.00%       | +0.34%          | 2.34%         | $362           | $15,888 |
| Q4      | 2.00%       | -0.47%          | 1.53%         | $268           | $17,656 |
| Q5      | 2.00%       | +2.15%          | 4.15%         | $796           | $19,952 |
| Q6      | 2.00%       | +0.12%          | 2.12%         | $463           | $21,915 |
| Q7      | 2.00%       | -2.38%          | -0.38%        | -$99           | $23,316 |
| Q8      | 2.00%       | +0.76%          | 2.76%         | $686           | $25,502 |
| Q9      | 2.00%       | -0.90%          | 1.10%         | $310           | $27,312 |
| Q10     | 2.00%       | +1.23%          | 3.23%         | $930           | $29,742 |
| Q11     | 2.00%       | +0.01%          | 2.01%         | $633           | $31,875 |
| Q12     | 2.00%       | -1.57%          | 0.43%         | $155           | $33,530 |

Note how some quarters have above-average returns, others below-average, and occasionally there might even be negative returns despite a positive expected return. This mirrors real market behavior.

### Monte Carlo Simulation Process

For the Probability Analysis, the calculator runs this process thousands of times:

1. Each simulation generates a new random sequence of returns
2. For example, the first simulation might end with $33,530
3. The second might end with $38,245 (more positive random returns)
4. The third might end with $30,120 (more negative random returns)
5. After 5,000 simulations, it sorts all final balances from lowest to highest
6. It then extracts:
   - 10th percentile (90% of results are better than this)
   - 50th percentile (the median outcome)
   - 90th percentile (only 10% of results are better than this)

### The Impact of Volatility

With 0% volatility, all months would have exactly 0.667% returns.

With 15% volatility (as in our example):

- Some months might see returns as high as 2-3%
- Others might see slightly negative returns
- Occasionally there are larger swings (the market shocks)

With 30% volatility:

- Much wider range of monthly returns
- More frequent negative months
- Larger market shocks
