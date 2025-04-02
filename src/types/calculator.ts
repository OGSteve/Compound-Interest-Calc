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
  // Retirement planning properties
  retirementPhase: {
    enabled: boolean;
    annualWithdrawal: number;
    withdrawalAdjustForInflation: boolean;
    // New properties for separate retirement calculation
    retirementYears: number;
    retirementReturn: number;
    withdrawalStartYear?: number; // Optional property that defaults to investmentHorizon
  };
}

export interface CalculatorResults {
  summary: {
    finalBalance: number;
    totalContributions: number;
    totalGrowth: number;
    inflationAdjustedValue: number;
    totalWithdrawals?: number;
    totalTaxesPaid?: number;
  };
  probabilityMetrics: {
    median: number;
    upperBound: number;
    lowerBound: number;
    successProbability: number;
    // Added for sequence risk analysis
    worstCaseBalance: number;
    successRate: number;
  };
  yearByYearDetails: Array<{
    year: number;
    startingBalance: number;
    contributions: number;
    withdrawals?: number;
    earnings: number;
    fees: number;
    taxes: number;
    endingBalance: number;
    inflationAdjustedValue: number;
    // Added for withdrawal phase
    withdrawalTaxes?: number;
    remainingYears?: number;
  }>;
  // New field for separate retirement phase results
  retirementPhaseResults?: RetirementPhaseResults;
}

// New interface for retirement phase calculations
export interface RetirementPhaseResults {
  summary: {
    startingBalance: number;
    totalWithdrawals: number;
    totalGrowth: number;
    finalBalance: number;
    inflationAdjustedFinalBalance: number;
    totalTaxesPaid: number;
    yearsOfIncome: number;
    projectedLongevity: number;
  };
  probabilityMetrics: {
    successRate: number; // Percentage of scenarios where money doesn't run out
    medianEndingBalance: number;
    worstCaseBalance: number;
    bestCaseBalance: number;
  };
  yearByYearDetails: Array<{
    year: number;
    startingBalance: number;
    withdrawals: number;
    earnings: number;
    fees: number;
    taxes: number;
    endingBalance: number;
    inflationAdjustedValue: number;
    withdrawalTaxes: number;
  }>;
}

export interface ChartData {
  year: number;
  balance: number;
  contributions: number;
  withdrawals?: number;
  earnings: number;
  inflationAdjustedValue: number;
}

// Interface for retirement phase chart data
export interface RetirementChartData {
  year: number;
  balance: number;
  withdrawals: number;
  earnings: number;
  inflationAdjustedValue: number;
}

// Interface for sequence of returns modeling
export interface SequenceRiskAnalysis {
  worstCaseScenario: number;
  bestCaseScenario: number;
  medianScenario: number;
  successRate: number; // Percentage of scenarios where money doesn't run out
}
