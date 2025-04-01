"use client";

import { useState, useEffect, useRef } from "react";
import { CalculatorInputs, CalculatorResults } from "@/types/calculator";
import {
  calculateMonthlyCompoundInterest,
  formatCurrency,
} from "@/utils/calculations";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import * as XLSX from "xlsx";

// Financial concept tooltips for educational purposes
const tooltips = {
  initialInvestment:
    "The amount you start investing with. This is your principal amount.",
  monthlyContribution:
    "The amount you plan to add to your investment each month.",
  annualContributionIncrease:
    "The percentage by which your monthly contribution will increase each year. This models salary growth.",
  investmentHorizon:
    "The number of years you plan to keep your money invested.",
  expectedAnnualReturn:
    "The average annual return you expect from your investment. The S&P 500 has historically returned about of 10% annually before inflation.",
  returnVolatility:
    "The degree of variation or fluctuation in the annual returns. Higher volatility means more uncertainty.",
  inflationRate:
    "The rate at which the general price level of goods and services rises, eroding purchasing power. The Fed targets approximately 2%.",
  accountType:
    "Tax treatment affects your real returns. Tax-deferred delays taxes until withdrawal, tax-free means no taxes on gains, taxable means you pay taxes on gains annually.",
  accountAllocation:
    "Specify what percentage of your investment should go into tax-deferred accounts (like traditional 401k/IRA) vs tax-free accounts (like Roth 401k/IRA).",
  finalBalance:
    "The total value of your investment at the end of your investment horizon.",
  totalContributions:
    "The sum of your initial investment and all contributions made over time.",
  totalGrowth:
    "The difference between your final balance and total contributions, representing investment earnings.",
  inflationAdjustedValue:
    "Your final balance adjusted for inflation, showing the real purchasing power in today's dollars.",
};

const defaultInputs: CalculatorInputs = {
  initialInvestment: 10000,
  monthlyContribution: 500,
  annualContributionIncrease: 2,
  investmentHorizon: 30,
  expectedAnnualReturn: 7,
  returnVolatility: 15,
  inflationRate: 2,
  taxRate: {
    income: 22,
    dividends: 15,
    capitalGains: 15,
  },
  fees: {
    expenseRatio: 0.5,
    advisoryFee: 0,
  },
  accountType: "tax-deferred",
  accountAllocation: {
    taxDeferred: 100,
    taxFree: 0,
  },
  assetAllocation: {
    stocks: 70,
    bonds: 20,
    cash: 10,
  },
};

export default function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [calculationComplete, setCalculationComplete] = useState(false);
  const [chartFullscreen, setChartFullscreen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (
    field: keyof CalculatorInputs,
    value: number | string | object
  ) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAccountTypeChange = (
    type: "mixed" | "taxable" | "tax-deferred" | "tax-free"
  ) => {
    if (type === "mixed") {
      setInputs((prev) => ({
        ...prev,
        accountType: type,
        accountAllocation: {
          taxDeferred: 50,
          taxFree: 50,
        },
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        accountType: type,
        accountAllocation: {
          taxDeferred: type === "tax-deferred" ? 100 : 0,
          taxFree: type === "tax-free" ? 100 : 0,
        },
      }));
    }
  };

  const handleAccountAllocationChange = (
    type: "taxDeferred" | "taxFree",
    value: number
  ) => {
    const otherType = type === "taxDeferred" ? "taxFree" : "taxDeferred";
    const otherValue = 100 - value;

    setInputs((prev) => ({
      ...prev,
      accountAllocation: {
        taxDeferred: type === "taxDeferred" ? value : otherValue,
        taxFree: type === "taxFree" ? value : otherValue,
      },
    }));
  };

  const handleCalculate = () => {
    setCalculationComplete(false);
    // Add a small delay to allow for animation effect on recalculation
    setTimeout(() => {
      const calculatedResults = calculateMonthlyCompoundInterest(inputs);
      setResults(calculatedResults);
      setCalculationComplete(true);
    }, 300);
  };

  const handleExportToExcel = () => {
    if (!results) return;

    // Create worksheet with data
    const worksheet = XLSX.utils.json_to_sheet(results.yearByYearDetails);

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Investment Growth");

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, "investment_projection.xlsx");
  };

  const toggleFullscreenChart = () => {
    setChartFullscreen(!chartFullscreen);
  };

  // Auto-calculate on initial load
  useEffect(() => {
    handleCalculate();
  }, []);

  return (
    <div className="space-y-12 py-6 md:py-8 animate-[slideUpFade_0.6s_ease-in-out]">
      {/* Header Section */}
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6 gradient-text">
          Enhanced Compound Interest Calculator
        </h1>
        <p className="text-base md:text-lg text-muted-foreground">
          Calculate your investment growth with advanced features like inflation
          adjustment, tax considerations, and market volatility.
        </p>
      </div>

      {/* Main Content Grid - Improved responsive layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
        {/* Input Section - Adjusted column spans for better proportions */}
        <div className="xl:col-span-5 2xl:col-span-4">
          <div className="glass-card p-6 md:p-8 transition-all duration-300">
            <h2 className="text-xl md:text-2xl font-semibold mb-6 md:mb-8 gradient-text">
              Investment Parameters
            </h2>

            <div className="space-y-6">
              {/* Initial Investment */}
              <div className="group">
                <div className="flex justify-between">
                  <label className="block text-sm font-medium mb-2 transition-colors">
                    Initial Investment
                  </label>
                  <div
                    className="tooltip"
                    data-tooltip={tooltips.initialInvestment}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-muted-foreground"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4M12 8h.01"></path>
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    value={inputs.initialInvestment}
                    onChange={(e) =>
                      handleInputChange(
                        "initialInvestment",
                        Number(e.target.value)
                      )
                    }
                    className="w-full pl-7 pr-3 py-3 bg-background/50 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    min="0"
                  />
                </div>
              </div>

              {/* Monthly Contribution */}
              <div className="group">
                <div className="flex justify-between">
                  <label className="block text-sm font-medium mb-2 transition-colors">
                    Monthly Contribution
                  </label>
                  <div
                    className="tooltip"
                    data-tooltip={tooltips.monthlyContribution}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-muted-foreground"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4M12 8h.01"></path>
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    value={inputs.monthlyContribution}
                    onChange={(e) =>
                      handleInputChange(
                        "monthlyContribution",
                        Number(e.target.value)
                      )
                    }
                    className="w-full pl-7 pr-3 py-3 bg-background/50 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    min="0"
                  />
                </div>
              </div>

              {/* Annual Contribution Increase */}
              <div className="group">
                <div className="flex justify-between">
                  <label className="block text-sm font-medium mb-2 transition-colors">
                    Annual Contribution Increase
                  </label>
                  <div
                    className="tooltip"
                    data-tooltip={tooltips.annualContributionIncrease}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-muted-foreground"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4M12 8h.01"></path>
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.annualContributionIncrease}
                    onChange={(e) =>
                      handleInputChange(
                        "annualContributionIncrease",
                        Number(e.target.value)
                      )
                    }
                    className="w-full pl-3 pr-9 py-3 bg-background/50 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    min="0"
                    step="0.1"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>

              {/* Investment Horizon */}
              <div className="group">
                <div className="flex justify-between">
                  <label className="block text-sm font-medium mb-2 transition-colors">
                    Investment Horizon
                  </label>
                  <div
                    className="tooltip"
                    data-tooltip={tooltips.investmentHorizon}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-muted-foreground"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4M12 8h.01"></path>
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.investmentHorizon}
                    onChange={(e) =>
                      handleInputChange(
                        "investmentHorizon",
                        Number(e.target.value)
                      )
                    }
                    className="w-full pl-3 pr-14 py-3 bg-background/50 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    min="1"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    Years
                  </span>
                </div>
              </div>

              {/* Expected Annual Return */}
              <div className="group">
                <div className="flex justify-between">
                  <label className="block text-sm font-medium mb-2 transition-colors">
                    Expected Annual Return
                  </label>
                  <div
                    className="tooltip"
                    data-tooltip={tooltips.expectedAnnualReturn}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-muted-foreground"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4M12 8h.01"></path>
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.expectedAnnualReturn}
                    onChange={(e) =>
                      handleInputChange(
                        "expectedAnnualReturn",
                        Number(e.target.value)
                      )
                    }
                    className="w-full pl-3 pr-9 py-3 bg-background/50 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    min="0"
                    step="0.1"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>

              {/* Show/Hide Advanced Parameters */}
              <div className="pt-2">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-accent-foreground flex items-center hover:underline transition-colors"
                >
                  {showAdvanced ? "Hide" : "Show"} Advanced Parameters
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`ml-1 w-4 h-4 transition-transform duration-200 ${
                      showAdvanced ? "transform rotate-180" : ""
                    }`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </div>

              {/* Advanced Parameters */}
              {showAdvanced && (
                <div className="space-y-6 animate-[slideUpFade_0.3s_ease-in-out]">
                  {/* Return Volatility */}
                  <div className="group">
                    <div className="flex justify-between">
                      <label className="block text-sm font-medium mb-2 transition-colors">
                        Return Volatility
                      </label>
                      <div
                        className="tooltip"
                        data-tooltip={tooltips.returnVolatility}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 text-muted-foreground"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 16v-4M12 8h.01"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.returnVolatility}
                        onChange={(e) =>
                          handleInputChange(
                            "returnVolatility",
                            Number(e.target.value)
                          )
                        }
                        className="w-full pl-3 pr-9 py-3 bg-background/50 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        min="0"
                        step="0.1"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Inflation Rate */}
                  <div className="group">
                    <div className="flex justify-between">
                      <label className="block text-sm font-medium mb-2 transition-colors">
                        Inflation Rate
                      </label>
                      <div
                        className="tooltip"
                        data-tooltip={tooltips.inflationRate}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 text-muted-foreground"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 16v-4M12 8h.01"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.inflationRate}
                        onChange={(e) =>
                          handleInputChange(
                            "inflationRate",
                            Number(e.target.value)
                          )
                        }
                        className="w-full pl-3 pr-9 py-3 bg-background/50 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        min="0"
                        step="0.1"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Account Type */}
                  <div className="group">
                    <div className="flex justify-between">
                      <label className="block text-sm font-medium mb-2 transition-colors">
                        Account Type
                      </label>
                      <div
                        className="tooltip"
                        data-tooltip={tooltips.accountType}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 text-muted-foreground"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 16v-4M12 8h.01"></path>
                        </svg>
                      </div>
                    </div>
                    <select
                      value={inputs.accountType}
                      onChange={(e) =>
                        handleAccountTypeChange(
                          e.target.value as
                            | "mixed"
                            | "taxable"
                            | "tax-deferred"
                            | "tax-free"
                        )
                      }
                      className="w-full px-3 py-3 bg-background/50 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    >
                      <option value="tax-deferred">
                        Tax-Deferred (401k, Traditional IRA)
                      </option>
                      <option value="tax-free">
                        Tax-Free (Roth 401k, Roth IRA)
                      </option>
                      <option value="taxable">Taxable Account</option>
                      <option value="mixed">
                        Mixed (Tax-Deferred & Tax-Free)
                      </option>
                    </select>
                  </div>

                  {/* Account Allocation (only show if "mixed" is selected) */}
                  {inputs.accountType === "mixed" && (
                    <div className="group">
                      <div className="flex justify-between">
                        <label className="block text-sm font-medium mb-2 transition-colors">
                          Account Allocation
                        </label>
                        <div
                          className="tooltip"
                          data-tooltip={tooltips.accountAllocation}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 text-muted-foreground"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 16v-4M12 8h.01"></path>
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>
                              Tax-Deferred:{" "}
                              {inputs.accountAllocation.taxDeferred}%
                            </span>
                            <span>
                              Tax-Free: {inputs.accountAllocation.taxFree}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={inputs.accountAllocation.taxDeferred}
                            onChange={(e) =>
                              handleAccountAllocationChange(
                                "taxDeferred",
                                Number(e.target.value)
                              )
                            }
                            className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="glass-card p-2 rounded">
                            <p className="text-center font-medium">
                              Tax-Deferred
                            </p>
                            <p className="text-center text-muted-foreground mt-1">
                              Pay taxes on withdrawal
                            </p>
                          </div>
                          <div className="glass-card p-2 rounded">
                            <p className="text-center font-medium">Tax-Free</p>
                            <p className="text-center text-muted-foreground mt-1">
                              No taxes on growth
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleCalculate}
                className="w-full mt-4 bg-gradient-to-r from-primary to-accent text-white py-4 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-medium text-lg shadow-lg hover:shadow-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">Calculate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Section - Improved column spans for XL and 2XL screens */}
        <div className="xl:col-span-7 2xl:col-span-8">
          {results && (
            <div className="space-y-8">
              {/* Summary Cards - Improved responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="glass-card p-4 md:p-6 transition-all duration-300 hover:shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="tooltip" data-tooltip={tooltips.finalBalance}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                      Final Balance
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-1 w-3 h-3"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4M12 8h.01"></path>
                      </svg>
                    </h3>
                  </div>
                  <p
                    className={`text-lg md:text-xl lg:text-2xl font-bold break-words ${
                      calculationComplete
                        ? "animate-[slideUpFade_0.5s_ease-in-out]"
                        : "opacity-50"
                    }`}
                  >
                    {formatCurrency(results.summary.finalBalance)}
                  </p>
                </div>
                <div className="glass-card p-4 md:p-6 transition-all duration-300 hover:shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div
                    className="tooltip"
                    data-tooltip={tooltips.totalContributions}
                  >
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                      Total Contributions
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-1 w-3 h-3"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4M12 8h.01"></path>
                      </svg>
                    </h3>
                  </div>
                  <p
                    className={`text-lg md:text-xl lg:text-2xl font-bold break-words ${
                      calculationComplete
                        ? "animate-[slideUpFade_0.5s_ease-in-out]"
                        : "opacity-50"
                    }`}
                  >
                    {formatCurrency(results.summary.totalContributions)}
                  </p>
                </div>
                <div className="glass-card p-4 md:p-6 transition-all duration-300 hover:shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="tooltip" data-tooltip={tooltips.totalGrowth}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                      Total Growth
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-1 w-3 h-3"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4M12 8h.01"></path>
                      </svg>
                    </h3>
                  </div>
                  <p
                    className={`text-lg md:text-xl lg:text-2xl font-bold break-words ${
                      calculationComplete
                        ? "animate-[slideUpFade_0.5s_ease-in-out]"
                        : "opacity-50"
                    }`}
                  >
                    {formatCurrency(results.summary.totalGrowth)}
                  </p>
                </div>
                <div className="glass-card p-4 md:p-6 transition-all duration-300 hover:shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div
                    className="tooltip"
                    data-tooltip={tooltips.inflationAdjustedValue}
                  >
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                      Inflation-Adjusted
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-1 w-3 h-3"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4M12 8h.01"></path>
                      </svg>
                    </h3>
                  </div>
                  <p
                    className={`text-lg md:text-xl lg:text-2xl font-bold break-words ${
                      calculationComplete
                        ? "animate-[slideUpFade_0.5s_ease-in-out]"
                        : "opacity-50"
                    }`}
                  >
                    {formatCurrency(results.summary.inflationAdjustedValue)}
                  </p>
                </div>
              </div>

              {/* Growth Chart */}
              <div
                className={`glass-card p-4 md:p-6 transition-all duration-300 hover:shadow-lg ${
                  chartFullscreen ? "fixed inset-0 z-50 p-8 flex flex-col" : ""
                }`}
                ref={chartRef}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold gradient-text mb-2 sm:mb-0">
                    Investment Growth
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleExportToExcel}
                      className="px-3 py-1 bg-primary/10 hover:bg-primary/20 rounded-md flex items-center text-sm font-medium transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 mr-1"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Export
                    </button>
                    <button
                      onClick={toggleFullscreenChart}
                      className="px-3 py-1 bg-primary/10 hover:bg-primary/20 rounded-md flex items-center text-sm font-medium transition-colors"
                    >
                      {chartFullscreen ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 mr-1"
                          >
                            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                          </svg>
                          Close
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 mr-1"
                          >
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                          </svg>
                          Enlarge
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div
                  className={`${
                    chartFullscreen
                      ? "flex-1"
                      : "h-[350px] md:h-[400px] lg:h-[450px]"
                  }`}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={results.yearByYearDetails}
                      margin={{ top: 20, right: 20, left: 60, bottom: 30 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorBalance"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorInflation"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--secondary))"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--secondary))"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--muted-foreground))"
                        opacity={0.2}
                      />
                      <XAxis
                        dataKey="year"
                        tick={{ fill: "hsl(var(--foreground))" }}
                        tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                        axisLine={{ stroke: "hsl(var(--muted-foreground))" }}
                        label={{
                          value: "Years",
                          position: "insideBottomRight",
                          offset: -10,
                          fill: "hsl(var(--foreground))",
                        }}
                      />
                      <YAxis
                        tickFormatter={(value) => formatCurrency(value)}
                        tick={{ fill: "hsl(var(--foreground))" }}
                        tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                        axisLine={{ stroke: "hsl(var(--muted-foreground))" }}
                        width={60}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          formatCurrency(value),
                          "",
                        ]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderRadius: "var(--radius)",
                          border: "1px solid hsl(var(--border))",
                          boxShadow: "0 4px 12px hsl(var(--muted))",
                          padding: "0.75rem",
                          color: "hsl(var(--card-foreground))",
                        }}
                        labelStyle={{
                          color: "hsl(var(--foreground))",
                          fontWeight: 600,
                        }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                        animationDuration={300}
                      />
                      <Legend
                        formatter={(value) => (
                          <span className="text-sm">{value}</span>
                        )}
                        wrapperStyle={{
                          paddingTop: "1.5rem",
                        }}
                      />
                      <ReferenceLine
                        y={inputs.initialInvestment}
                        stroke="hsl(var(--muted-foreground))"
                        strokeDasharray="3 3"
                        label={{
                          position: "right",
                          value: "Initial Investment",
                          fill: "hsl(var(--muted-foreground))",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="endingBalance"
                        name="Balance"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                        activeDot={{ r: 8, strokeWidth: 2 }}
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                      />
                      <Area
                        type="monotone"
                        dataKey="inflationAdjustedValue"
                        name="Inflation-Adjusted"
                        stroke="hsl(var(--secondary))"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorInflation)"
                        activeDot={{ r: 8, strokeWidth: 2 }}
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>
                    The growth chart shows your investment balance over time,
                    with inflation-adjusted values representing the real
                    purchasing power.
                  </p>
                </div>
              </div>

              {/* Probability Metrics - Updated for better mobile responsiveness */}
              <div className="glass-card p-4 md:p-6 transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 gradient-text">
                  Probability Analysis
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-background/40 rounded-lg p-4 border border-border/50">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Median Outcome
                    </h3>
                    <p className="text-xl font-bold">
                      {formatCurrency(results.probabilityMetrics.median)}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      50% chance your final balance will be higher than this
                      amount.
                    </p>
                  </div>
                  <div className="bg-background/40 rounded-lg p-4 border border-border/50">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      90th Percentile
                    </h3>
                    <p className="text-xl font-bold">
                      {formatCurrency(results.probabilityMetrics.upperBound)}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      10% chance your final balance will exceed this amount.
                    </p>
                  </div>
                  <div className="bg-background/40 rounded-lg p-4 border border-border/50">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      10th Percentile
                    </h3>
                    <p className="text-xl font-bold">
                      {formatCurrency(results.probabilityMetrics.lowerBound)}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      90% chance your final balance will be higher than this
                      amount.
                    </p>
                  </div>
                </div>
                <div className="mt-6 text-sm text-muted-foreground">
                  <p>
                    Monte Carlo simulation was used to generate 1,000 possible
                    future scenarios based on your inputs, accounting for market
                    volatility.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Educational Section - Better mobile spacing */}
      <div className="mt-12 md:mt-16 glass-card p-6 md:p-8 transition-all duration-300">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 gradient-text">
          Understanding Compound Interest
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">
              The Power of Compound Interest
            </h3>
            <p className="text-muted-foreground mb-4">
              Compound interest is the addition of interest to the principal sum
              of a loan or deposit, resulting in interest earned on previously
              accumulated interest. This effect can dramatically increase the
              growth of your investments over time.
            </p>
            <h3 className="text-lg font-semibold mb-3">The Impact of Time</h3>
            <p className="text-muted-foreground">
              The earlier you start investing, the more time your money has to
              grow. Even small amounts invested early can outperform larger
              amounts invested later due to the exponential nature of compound
              growth.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Key Factors Affecting Your Returns
            </h3>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>
                <span className="font-medium">Contribution Amount</span>: The
                more you invest, the more you'll have, but consistency matters
                more than amount.
              </li>
              <li>
                <span className="font-medium">Rate of Return</span>: Higher
                returns lead to faster growth, but often come with increased
                risk.
              </li>
              <li>
                <span className="font-medium">Time Horizon</span>: Longer
                investment periods allow more time for compounding to work its
                magic.
              </li>
              <li>
                <span className="font-medium">Fees and Taxes</span>: These can
                significantly reduce your effective returns over time.
              </li>
              <li>
                <span className="font-medium">Inflation</span>: Reduces the
                purchasing power of your future money.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
