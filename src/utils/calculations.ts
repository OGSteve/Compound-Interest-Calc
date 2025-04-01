import {
  CalculatorInputs,
  CalculatorResults,
  ChartData,
} from "@/types/calculator";

// Helper function to format currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Calculate monthly compound interest with variable contributions
export const calculateMonthlyCompoundInterest = (
  inputs: CalculatorInputs
): CalculatorResults => {
  const {
    initialInvestment,
    monthlyContribution,
    annualContributionIncrease,
    investmentHorizon,
    expectedAnnualReturn,
    returnVolatility,
    inflationRate,
    taxRate,
    fees,
    accountType,
    accountAllocation,
  } = inputs;

  const monthlyRate = expectedAnnualReturn / 12 / 100;
  const monthlyInflation = inflationRate / 12 / 100;
  const monthlyExpenseRatio = fees.expenseRatio / 12 / 100;
  const monthlyAdvisoryFee = fees.advisoryFee / 12 / 100;

  // Initialize account balances
  let balanceTaxDeferred =
    accountType === "tax-free"
      ? 0
      : initialInvestment *
        (accountType === "mixed" ? accountAllocation.taxDeferred / 100 : 1);
  let balanceTaxFree =
    accountType === "tax-deferred" || accountType === "taxable"
      ? 0
      : initialInvestment *
        (accountType === "mixed" ? accountAllocation.taxFree / 100 : 1);
  let balanceTaxable = accountType === "taxable" ? initialInvestment : 0;

  let totalContributions = initialInvestment;
  const yearByYearDetails = [];
  const chartData: ChartData[] = [];

  for (let year = 0; year <= investmentHorizon; year++) {
    const yearStartBalanceTaxDeferred = balanceTaxDeferred;
    const yearStartBalanceTaxFree = balanceTaxFree;
    const yearStartBalanceTaxable = balanceTaxable;
    const yearStartBalance =
      yearStartBalanceTaxDeferred +
      yearStartBalanceTaxFree +
      yearStartBalanceTaxable;

    let yearContributions = 0;
    let yearEarningsTaxDeferred = 0;
    let yearEarningsTaxFree = 0;
    let yearEarningsTaxable = 0;
    let yearFees = 0;
    let yearTaxes = 0;

    // Calculate monthly values for the year
    for (let month = 1; month <= 12; month++) {
      // Calculate monthly contribution with annual increase
      const currentMonthlyContribution =
        monthlyContribution *
        Math.pow(1 + annualContributionIncrease / 100, year);

      // Calculate contribution allocation based on account type
      let contributionTaxDeferred = 0;
      let contributionTaxFree = 0;
      let contributionTaxable = 0;

      if (accountType === "tax-deferred") {
        contributionTaxDeferred = currentMonthlyContribution;
      } else if (accountType === "tax-free") {
        contributionTaxFree = currentMonthlyContribution;
      } else if (accountType === "taxable") {
        contributionTaxable = currentMonthlyContribution;
      } else if (accountType === "mixed") {
        contributionTaxDeferred =
          currentMonthlyContribution * (accountAllocation.taxDeferred / 100);
        contributionTaxFree =
          currentMonthlyContribution * (accountAllocation.taxFree / 100);
      }

      // Add contributions to respective accounts
      balanceTaxDeferred += contributionTaxDeferred;
      balanceTaxFree += contributionTaxFree;
      balanceTaxable += contributionTaxable;
      yearContributions += currentMonthlyContribution;

      // Calculate monthly return with volatility
      const monthlyReturn =
        monthlyRate +
        ((Math.random() - 0.5) * returnVolatility) / Math.sqrt(12) / 100;

      // Calculate earnings for each account type
      const earningsTaxDeferred = balanceTaxDeferred * monthlyReturn;
      const earningsTaxFree = balanceTaxFree * monthlyReturn;
      const earningsTaxable = balanceTaxable * monthlyReturn;

      yearEarningsTaxDeferred += earningsTaxDeferred;
      yearEarningsTaxFree += earningsTaxFree;
      yearEarningsTaxable += earningsTaxable;

      // Apply fees to each account
      const feeTaxDeferred =
        balanceTaxDeferred * (monthlyExpenseRatio + monthlyAdvisoryFee);
      const feeTaxFree =
        balanceTaxFree * (monthlyExpenseRatio + monthlyAdvisoryFee);
      const feeTaxable =
        balanceTaxable * (monthlyExpenseRatio + monthlyAdvisoryFee);

      yearFees += feeTaxDeferred + feeTaxFree + feeTaxable;
      balanceTaxDeferred -= feeTaxDeferred;
      balanceTaxFree -= feeTaxFree;
      balanceTaxable -= feeTaxable;

      // Apply taxes for taxable account
      if (balanceTaxable > 0) {
        const monthlyTaxes = earningsTaxable * (taxRate.dividends / 100);
        yearTaxes += monthlyTaxes;
        balanceTaxable -= monthlyTaxes;
      }

      // Apply monthly return to each account
      balanceTaxDeferred += earningsTaxDeferred;
      balanceTaxFree += earningsTaxFree;
      balanceTaxable += earningsTaxable;

      // Record monthly data for chart
      if (year === 0 && month === 1) {
        chartData.push({
          year: 0,
          balance: initialInvestment,
          contributions: 0,
          earnings: 0,
          inflationAdjustedValue: initialInvestment,
        });
      }
      if (month === 12) {
        const totalBalance =
          balanceTaxDeferred + balanceTaxFree + balanceTaxable;
        chartData.push({
          year: year + 1,
          balance: totalBalance,
          contributions: yearContributions,
          earnings:
            yearEarningsTaxDeferred + yearEarningsTaxFree + yearEarningsTaxable,
          inflationAdjustedValue:
            totalBalance / Math.pow(1 + inflationRate / 100, year + 1),
        });
      }
    }

    // Calculate combined values for the year
    const totalEndingBalance =
      balanceTaxDeferred + balanceTaxFree + balanceTaxable;
    const totalYearEarnings =
      yearEarningsTaxDeferred + yearEarningsTaxFree + yearEarningsTaxable;

    // Record year-end details
    yearByYearDetails.push({
      year,
      startingBalance: yearStartBalance,
      contributions: yearContributions,
      earnings: totalYearEarnings,
      fees: yearFees,
      taxes: yearTaxes,
      endingBalance: totalEndingBalance,
      inflationAdjustedValue:
        totalEndingBalance / Math.pow(1 + inflationRate / 100, year),
    });

    totalContributions += yearContributions;
  }

  // Calculate probability metrics using Monte Carlo simulation
  const simulations = 1000;
  const finalBalances: number[] = [];

  for (let i = 0; i < simulations; i++) {
    let simBalanceTaxDeferred =
      accountType === "tax-free"
        ? 0
        : initialInvestment *
          (accountType === "mixed" ? accountAllocation.taxDeferred / 100 : 1);
    let simBalanceTaxFree =
      accountType === "tax-deferred" || accountType === "taxable"
        ? 0
        : initialInvestment *
          (accountType === "mixed" ? accountAllocation.taxFree / 100 : 1);
    let simBalanceTaxable = accountType === "taxable" ? initialInvestment : 0;

    for (let year = 0; year < investmentHorizon; year++) {
      const annualReturn =
        expectedAnnualReturn / 100 +
        ((Math.random() - 0.5) * returnVolatility) / 100;
      const monthlyRate = annualReturn / 12;

      for (let month = 1; month <= 12; month++) {
        const currentMonthlyContribution =
          monthlyContribution *
          Math.pow(1 + annualContributionIncrease / 100, year);

        // Allocate contributions based on account type
        let contributionTaxDeferred = 0;
        let contributionTaxFree = 0;
        let contributionTaxable = 0;

        if (accountType === "tax-deferred") {
          contributionTaxDeferred = currentMonthlyContribution;
        } else if (accountType === "tax-free") {
          contributionTaxFree = currentMonthlyContribution;
        } else if (accountType === "taxable") {
          contributionTaxable = currentMonthlyContribution;
        } else if (accountType === "mixed") {
          contributionTaxDeferred =
            currentMonthlyContribution * (accountAllocation.taxDeferred / 100);
          contributionTaxFree =
            currentMonthlyContribution * (accountAllocation.taxFree / 100);
        }

        // Add contributions
        simBalanceTaxDeferred += contributionTaxDeferred;
        simBalanceTaxFree += contributionTaxFree;
        simBalanceTaxable += contributionTaxable;

        // Apply monthly growth
        simBalanceTaxDeferred *= 1 + monthlyRate;
        simBalanceTaxFree *= 1 + monthlyRate;
        simBalanceTaxable *= 1 + monthlyRate;

        // Apply taxes to taxable account
        if (simBalanceTaxable > 0) {
          const monthlyTaxDrag = monthlyRate * (taxRate.dividends / 100);
          simBalanceTaxable *= 1 - monthlyTaxDrag;
        }
      }
    }

    finalBalances.push(
      simBalanceTaxDeferred + simBalanceTaxFree + simBalanceTaxable
    );
  }

  finalBalances.sort((a, b) => a - b);
  const median = finalBalances[Math.floor(simulations / 2)];
  const upperBound = finalBalances[Math.floor(simulations * 0.9)];
  const lowerBound = finalBalances[Math.floor(simulations * 0.1)];
  const totalBalance = balanceTaxDeferred + balanceTaxFree + balanceTaxable;

  return {
    summary: {
      finalBalance: totalBalance,
      totalContributions,
      totalGrowth: totalBalance - totalContributions,
      inflationAdjustedValue:
        totalBalance / Math.pow(1 + inflationRate / 100, investmentHorizon),
    },
    probabilityMetrics: {
      median,
      upperBound,
      lowerBound,
      successProbability:
        finalBalances.filter((b) => b >= totalBalance).length / simulations,
    },
    yearByYearDetails,
  };
};
