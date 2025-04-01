export interface CalculatorInputs {
  initialInvestment: number;
  monthlyContribution: number;
  annualContributionIncrease: number;
  investmentHorizon: number;
  expectedAnnualReturn: number;
  returnVolatility: number;
  inflationRate: number;
  taxRate: {
    income: number;
    dividends: number;
    capitalGains: number;
  };
  fees: {
    expenseRatio: number;
    advisoryFee: number;
  };
  accountType: "taxable" | "tax-deferred" | "tax-free" | "mixed";
  accountAllocation: {
    taxDeferred: number;
    taxFree: number;
  };
  assetAllocation: {
    stocks: number;
    bonds: number;
    cash: number;
  };
}

export interface CalculatorResults {
  summary: {
    finalBalance: number;
    totalContributions: number;
    totalGrowth: number;
    inflationAdjustedValue: number;
  };
  probabilityMetrics: {
    median: number;
    upperBound: number;
    lowerBound: number;
    successProbability: number;
  };
  yearByYearDetails: Array<{
    year: number;
    startingBalance: number;
    contributions: number;
    earnings: number;
    fees: number;
    taxes: number;
    endingBalance: number;
    inflationAdjustedValue: number;
  }>;
}

export interface ChartData {
  year: number;
  balance: number;
  contributions: number;
  earnings: number;
  inflationAdjustedValue: number;
}
