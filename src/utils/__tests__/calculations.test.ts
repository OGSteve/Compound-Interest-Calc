import {
  formatCurrency,
  calculateMonthlyCompoundInterest,
} from "../calculations";
import { CalculatorInputs } from "@/types/calculator";

describe("formatCurrency", () => {
  it("formats numbers as currency properly", () => {
    expect(formatCurrency(1000)).toBe("$1,000");
    expect(formatCurrency(1000.5)).toBe("$1,001");
    expect(formatCurrency(1000000)).toBe("$1,000,000");
    expect(formatCurrency(0)).toBe("$0");
    expect(formatCurrency(-1000)).toBe("-$1,000");
  });
});

describe("calculateMonthlyCompoundInterest", () => {
  const defaultInputs: CalculatorInputs = {
    initialInvestment: 10000,
    monthlyContribution: 500,
    annualContributionIncrease: 2,
    investmentHorizon: 30,
    expectedAnnualReturn: 7,
    returnVolatility: 15,
    inflationRate: 2.5,
    taxRate: {
      income: 25,
      dividends: 15,
      capitalGains: 15,
    },
    fees: {
      expenseRatio: 0.1,
      advisoryFee: 0.3,
    },
    accountType: "taxable",
    accountAllocation: {
      taxDeferred: 0,
      taxFree: 0,
    },
    assetAllocation: {
      stocks: 80,
      bonds: 15,
      cash: 5,
    },
    retirementPhase: {
      enabled: false,
      annualWithdrawal: 0,
      withdrawalStartYear: 30,
      withdrawalAdjustForInflation: true,
    },
  };

  it("calculates basic investment growth correctly", () => {
    // Using a simplified input with no volatility for predictable results
    const simpleInputs: CalculatorInputs = {
      ...defaultInputs,
      initialInvestment: 10000,
      monthlyContribution: 0, // No contributions to simplify
      annualContributionIncrease: 0,
      investmentHorizon: 1, // Just one year
      expectedAnnualReturn: 10, // 10% return
      returnVolatility: 0, // No volatility
      inflationRate: 0, // No inflation
      taxRate: {
        income: 0,
        dividends: 0,
        capitalGains: 0,
      },
      fees: {
        expenseRatio: 0,
        advisoryFee: 0,
      },
      accountType: "tax-free", // No tax impact
      accountAllocation: {
        taxDeferred: 0,
        taxFree: 100,
      },
      assetAllocation: {
        stocks: 100,
        bonds: 0,
        cash: 0,
      },
      retirementPhase: {
        enabled: false,
        annualWithdrawal: 0,
        withdrawalStartYear: 30,
        withdrawalAdjustForInflation: true,
      },
    };

    const result = calculateMonthlyCompoundInterest(simpleInputs);

    // Verify final balance after 1 year with 10% return should be close to $11,000
    expect(result.summary.finalBalance).toBeCloseTo(11000, -2);
    expect(result.summary.totalContributions).toBe(10000);
    expect(result.yearByYearDetails.length).toBe(2); // Initial year (0) + 1 year
  });

  it("handles compound growth with monthly contributions", () => {
    const contributionsInputs: CalculatorInputs = {
      ...defaultInputs,
      initialInvestment: 10000,
      monthlyContribution: 100,
      annualContributionIncrease: 0,
      investmentHorizon: 1,
      expectedAnnualReturn: 12,
      returnVolatility: 0,
      inflationRate: 0,
      taxRate: {
        income: 0,
        dividends: 0,
        capitalGains: 0,
      },
      fees: {
        expenseRatio: 0,
        advisoryFee: 0,
      },
      accountType: "tax-free",
      accountAllocation: {
        taxDeferred: 0,
        taxFree: 100,
      },
      assetAllocation: {
        stocks: 100,
        bonds: 0,
        cash: 0,
      },
      retirementPhase: {
        enabled: false,
        annualWithdrawal: 0,
        withdrawalStartYear: 30,
        withdrawalAdjustForInflation: true,
      },
    };

    const result = calculateMonthlyCompoundInterest(contributionsInputs);

    // Initial $10k + $1,200 in contributions + growth
    expect(result.summary.finalBalance).toBeGreaterThan(11200);
    expect(result.summary.totalContributions).toBeCloseTo(11200, 0);
  });

  it("accounts for inflation correctly", () => {
    const inflationInputs: CalculatorInputs = {
      ...defaultInputs,
      initialInvestment: 10000,
      monthlyContribution: 0,
      annualContributionIncrease: 0,
      investmentHorizon: 10,
      expectedAnnualReturn: 7,
      returnVolatility: 0,
      inflationRate: 3,
      taxRate: {
        income: 0,
        dividends: 0,
        capitalGains: 0,
      },
      fees: {
        expenseRatio: 0,
        advisoryFee: 0,
      },
      accountType: "tax-free",
      accountAllocation: {
        taxDeferred: 0,
        taxFree: 100,
      },
      assetAllocation: {
        stocks: 100,
        bonds: 0,
        cash: 0,
      },
      retirementPhase: {
        enabled: false,
        annualWithdrawal: 0,
        withdrawalStartYear: 30,
        withdrawalAdjustForInflation: true,
      },
    };

    const result = calculateMonthlyCompoundInterest(inflationInputs);

    // Verify inflation-adjusted value is less than nominal value
    expect(result.summary.inflationAdjustedValue).toBeLessThan(
      result.summary.finalBalance
    );

    // After 10 years with 3% inflation, purchasing power is about 74.4% of nominal value
    const expectedRatio = 1 / Math.pow(1.03, 10);
    const actualRatio =
      result.summary.inflationAdjustedValue / result.summary.finalBalance;
    expect(actualRatio).toBeCloseTo(expectedRatio, 2);
  });

  it("differentiates between account types", () => {
    // Use a simpler test with shorter horizons and no volatility to make it deterministic
    const taxTestInputs: CalculatorInputs = {
      ...defaultInputs,
      investmentHorizon: 5, // Use a shorter horizon to reduce randomness
      returnVolatility: 0, // No volatility for deterministic results
      taxRate: {
        income: 25,
        dividends: 15,
        capitalGains: 15,
      },
    };

    // Test with all account types using the same parameters
    const taxableResult = calculateMonthlyCompoundInterest({
      ...taxTestInputs,
      accountType: "taxable",
    });

    const taxDeferredResult = calculateMonthlyCompoundInterest({
      ...taxTestInputs,
      accountType: "tax-deferred",
    });

    const taxFreeResult = calculateMonthlyCompoundInterest({
      ...taxTestInputs,
      accountType: "tax-free",
    });

    // Due to the deterministic calculation mode for tests, we can check taxes directly
    // The taxable account should pay taxes on dividends during growth phase
    expect(taxableResult.summary.totalTaxesPaid).toBeGreaterThan(0);

    // Tax-free accounts don't pay taxes
    expect(taxFreeResult.summary.totalTaxesPaid).toBe(0);

    // Verify that taxable accounts pay more in taxes during the accumulation phase
    expect(taxableResult.yearByYearDetails[1].taxes).toBeGreaterThan(
      taxDeferredResult.yearByYearDetails[1].taxes
    );
  });
});
