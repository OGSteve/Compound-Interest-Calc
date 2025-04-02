import { calculateMonthlyCompoundInterest } from "../calculations";
import { CalculatorInputs } from "@/types/calculator";

// Performance test helper
const measureExecutionTime = (fn: () => void): number => {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
};

describe("Performance tests for calculations", () => {
  // These tests will ensure that the calculation functions remain performant
  // They have more generous timeouts and are more like benchmarks than assertions

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

  it("completes a standard calculation within a reasonable time", () => {
    const executionTime = measureExecutionTime(() => {
      calculateMonthlyCompoundInterest(defaultInputs);
    });

    console.log(
      `Standard calculation completed in ${executionTime.toFixed(2)}ms`
    );

    // This is a performance benchmark rather than a strict test
    // Adjust the threshold based on realistic expectations
    expect(executionTime).toBeLessThan(5000); // 5 seconds is very conservative
  });

  it("handles long investment horizons efficiently", () => {
    const longHorizonInputs = {
      ...defaultInputs,
      investmentHorizon: 50, // Very long investment horizon
    };

    const executionTime = measureExecutionTime(() => {
      calculateMonthlyCompoundInterest(longHorizonInputs);
    });

    console.log(
      `Long horizon calculation (50 years) completed in ${executionTime.toFixed(
        2
      )}ms`
    );

    // This scenario is more complex, so we allow a bit more time
    expect(executionTime).toBeLessThan(10000); // 10 seconds threshold
  });

  it("handles retirement phase calculations efficiently", () => {
    const retirementInputs = {
      ...defaultInputs,
      retirementPhase: {
        enabled: true,
        annualWithdrawal: 40000,
        withdrawalStartYear: 20,
        withdrawalAdjustForInflation: true,
      },
    };

    const executionTime = measureExecutionTime(() => {
      calculateMonthlyCompoundInterest(retirementInputs);
    });

    console.log(
      `Retirement phase calculation completed in ${executionTime.toFixed(2)}ms`
    );

    // This scenario includes withdrawal phase logic
    expect(executionTime).toBeLessThan(7000); // 7 seconds threshold
  });
});
