"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CalculatorInputs, CalculatorResults } from "@/types/calculator";
import {
  calculateMonthlyCompoundInterest,
  formatCurrency,
} from "@/utils/calculations";
import {
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
  retirementPlanning:
    "Model your retirement withdrawals to see how long your money might last based on your planned annual spending.",
  sequenceRisk:
    "The impact of the order of investment returns, especially important during retirement when making withdrawals.",
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
    income: 25,
    dividends: 15,
    capitalGains: 15,
  },
  fees: {
    expenseRatio: 0.1,
    advisoryFee: 0,
  },
  accountType: "tax-deferred",
  accountAllocation: {
    taxDeferred: 70,
    taxFree: 30,
  },
  assetAllocation: {
    stocks: 80,
    bonds: 20,
    cash: 0,
  },
  retirementPhase: {
    enabled: false,
    annualWithdrawal: 40000,
    withdrawalAdjustForInflation: true,
    retirementYears: 30,
    retirementReturn: 5,
  },
};

export default function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [calculationComplete, setCalculationComplete] = useState(false);
  const [chartFullscreen, setChartFullscreen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Add refs for tooltip handling
  const tooltipContainerRef = useRef<HTMLDivElement>(null);
  const activeTooltipRef = useRef<HTMLDivElement | null>(null);

  const handleInputChange = (
    field: keyof CalculatorInputs,
    value: number | string | object
  ) => {
    // Store the raw value in state
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Helper function to handle retirement phase inputs
  const handleRetirementInputChange = (
    subfield: keyof typeof inputs.retirementPhase,
    value: string | number
  ) => {
    setInputs((prev) => ({
      ...prev,
      retirementPhase: {
        ...prev.retirementPhase,
        [subfield]: value,
      },
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
    const otherValue = 100 - value;

    setInputs((prev) => ({
      ...prev,
      accountAllocation: {
        taxDeferred: type === "taxDeferred" ? value : otherValue,
        taxFree: type === "taxFree" ? value : otherValue,
      },
    }));
  };

  const handleCalculate = useCallback(() => {
    setCalculationComplete(false);
    // Add a small delay to allow for animation effect on recalculation
    setTimeout(() => {
      // Convert any string values to numbers for calculation
      const calculationInputs = { ...inputs } as CalculatorInputs;

      // Convert the specific fields you know should be numbers
      const numericFields: Array<
        keyof Pick<
          CalculatorInputs,
          | "initialInvestment"
          | "monthlyContribution"
          | "annualContributionIncrease"
          | "investmentHorizon"
          | "expectedAnnualReturn"
          | "returnVolatility"
          | "inflationRate"
        >
      > = [
        "initialInvestment",
        "monthlyContribution",
        "annualContributionIncrease",
        "investmentHorizon",
        "expectedAnnualReturn",
        "returnVolatility",
        "inflationRate",
      ];

      numericFields.forEach((field) => {
        const value = calculationInputs[field];
        if (typeof value === "string") {
          calculationInputs[field] = value === "" ? 0 : Number(value);
        }
      });

      // Also handle retirement phase numeric fields
      if (
        typeof calculationInputs.retirementPhase.annualWithdrawal === "string"
      ) {
        calculationInputs.retirementPhase.annualWithdrawal =
          calculationInputs.retirementPhase.annualWithdrawal === ""
            ? 0
            : Number(calculationInputs.retirementPhase.annualWithdrawal);
      }

      if (
        typeof calculationInputs.retirementPhase.retirementYears === "string"
      ) {
        calculationInputs.retirementPhase.retirementYears =
          calculationInputs.retirementPhase.retirementYears === ""
            ? 1
            : Number(calculationInputs.retirementPhase.retirementYears);
      }

      if (
        typeof calculationInputs.retirementPhase.retirementReturn === "string"
      ) {
        calculationInputs.retirementPhase.retirementReturn =
          calculationInputs.retirementPhase.retirementReturn === ""
            ? 0
            : Number(calculationInputs.retirementPhase.retirementReturn);
      }

      const calculatedResults =
        calculateMonthlyCompoundInterest(calculationInputs);
      setResults(calculatedResults);
      setCalculationComplete(true);
    }, 300);
  }, [inputs]);

  const handleExportToExcel = (
    dataType: "investment" | "retirement" = "investment"
  ) => {
    if (!results) return;

    // Determine which data to export
    const data =
      dataType === "investment"
        ? results.yearByYearDetails
        : results.retirementPhaseResults?.yearByYearDetails || [];

    // Create worksheet with data
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    const worksheetName =
      dataType === "investment"
        ? "Investment Growth"
        : "Retirement Withdrawals";
    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);

    // Generate Excel file and trigger download
    const fileName =
      dataType === "investment"
        ? "investment_projection.xlsx"
        : "retirement_withdrawals.xlsx";
    XLSX.writeFile(workbook, fileName);
  };

  const toggleFullscreenChart = () => {
    setChartFullscreen(!chartFullscreen);
  };

  // Add tooltip positioning function
  const handleTooltipMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    tooltipText: string
  ) => {
    // Remove any existing tooltip
    if (activeTooltipRef.current) {
      document.body.removeChild(activeTooltipRef.current);
      activeTooltipRef.current = null;
    }

    // Create new tooltip element
    const tooltipEl = document.createElement("div");
    tooltipEl.className = "dynamic-tooltip";
    tooltipEl.innerHTML = tooltipText;
    document.body.appendChild(tooltipEl);
    activeTooltipRef.current = tooltipEl;

    // Position tooltip near the mouse but ensure it's visible
    const positionTooltip = (x: number, y: number) => {
      const rect = tooltipEl.getBoundingClientRect();
      // Keep tooltip within viewport bounds
      let tooltipX = x + 15;
      let tooltipY = y - rect.height - 10;

      // Adjust if too close to right edge
      if (tooltipX + rect.width > window.innerWidth) {
        tooltipX = window.innerWidth - rect.width - 10;
      }

      // Adjust if too close to top edge
      if (tooltipY < 10) {
        tooltipY = y + 25; // Position below the cursor instead
      }

      tooltipEl.style.left = `${tooltipX}px`;
      tooltipEl.style.top = `${tooltipY}px`;
    };

    // Initial positioning
    positionTooltip(e.clientX, e.clientY);
  };

  const handleTooltipMouseLeave = () => {
    if (activeTooltipRef.current) {
      document.body.removeChild(activeTooltipRef.current);
      activeTooltipRef.current = null;
    }
  };

  // Clean up any tooltips when component unmounts
  useEffect(() => {
    return () => {
      if (activeTooltipRef.current) {
        document.body.removeChild(activeTooltipRef.current);
      }
    };
  }, []);

  // Auto-calculate on initial load - commented out to prevent auto-calculation on every change
  // useEffect(() => {
  //   handleCalculate();
  // }, [handleCalculate]);

  return (
    <div
      className="space-y-12 py-6 md:py-8 animate-[slideUpFade_0.6s_ease-in-out]"
      ref={tooltipContainerRef}
    >
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
                    onMouseEnter={(e) =>
                      handleTooltipMouseEnter(e, tooltips.initialInvestment)
                    }
                    onMouseLeave={handleTooltipMouseLeave}
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
                      handleInputChange("initialInvestment", e.target.value)
                    }
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        handleInputChange("initialInvestment", 0);
                      }
                    }}
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
                    onMouseEnter={(e) =>
                      handleTooltipMouseEnter(e, tooltips.monthlyContribution)
                    }
                    onMouseLeave={handleTooltipMouseLeave}
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
                      handleInputChange("monthlyContribution", e.target.value)
                    }
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        handleInputChange("monthlyContribution", 0);
                      }
                    }}
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
                    onMouseEnter={(e) =>
                      handleTooltipMouseEnter(
                        e,
                        tooltips.annualContributionIncrease
                      )
                    }
                    onMouseLeave={handleTooltipMouseLeave}
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
                        e.target.value
                      )
                    }
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        handleInputChange("annualContributionIncrease", 0);
                      }
                    }}
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
                    onMouseEnter={(e) =>
                      handleTooltipMouseEnter(e, tooltips.investmentHorizon)
                    }
                    onMouseLeave={handleTooltipMouseLeave}
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
                      handleInputChange("investmentHorizon", e.target.value)
                    }
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        handleInputChange("investmentHorizon", 0);
                      }
                    }}
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
                    onMouseEnter={(e) =>
                      handleTooltipMouseEnter(e, tooltips.expectedAnnualReturn)
                    }
                    onMouseLeave={handleTooltipMouseLeave}
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
                      handleInputChange("expectedAnnualReturn", e.target.value)
                    }
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        handleInputChange("expectedAnnualReturn", 0);
                      }
                    }}
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
                        onMouseEnter={(e) =>
                          handleTooltipMouseEnter(e, tooltips.returnVolatility)
                        }
                        onMouseLeave={handleTooltipMouseLeave}
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
                          handleInputChange("returnVolatility", e.target.value)
                        }
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            handleInputChange("returnVolatility", 0);
                          }
                        }}
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
                        onMouseEnter={(e) =>
                          handleTooltipMouseEnter(e, tooltips.inflationRate)
                        }
                        onMouseLeave={handleTooltipMouseLeave}
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
                          handleInputChange("inflationRate", e.target.value)
                        }
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            handleInputChange("inflationRate", 0);
                          }
                        }}
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
                        onMouseEnter={(e) =>
                          handleTooltipMouseEnter(e, tooltips.accountType)
                        }
                        onMouseLeave={handleTooltipMouseLeave}
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
                          onMouseEnter={(e) =>
                            handleTooltipMouseEnter(
                              e,
                              tooltips.accountAllocation
                            )
                          }
                          onMouseLeave={handleTooltipMouseLeave}
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

                  {/* Retirement Phase Planning */}
                  <div className="group">
                    <div className="flex justify-between">
                      <label className="block text-sm font-medium mb-2 transition-colors">
                        Retirement Planning
                      </label>
                      <div
                        className="tooltip"
                        onMouseEnter={(e) =>
                          handleTooltipMouseEnter(
                            e,
                            tooltips.retirementPlanning
                          )
                        }
                        onMouseLeave={handleTooltipMouseLeave}
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

                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="enable-retirement"
                        checked={inputs.retirementPhase.enabled}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            retirementPhase: {
                              ...prev.retirementPhase,
                              enabled: e.target.checked,
                            },
                          }))
                        }
                        className="w-4 h-4 mr-2 accent-primary"
                      />
                      <label htmlFor="enable-retirement" className="text-sm">
                        Enable retirement withdrawal phase
                      </label>
                    </div>

                    {inputs.retirementPhase.enabled && (
                      <div className="space-y-4 pl-4 border-l-2 border-primary/20 animate-[slideUpFade_0.3s_ease-in-out]">
                        {/* Annual Withdrawal Amount */}
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Annual Withdrawal
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <input
                              type="number"
                              value={
                                typeof inputs.retirementPhase
                                  .annualWithdrawal === "string" &&
                                inputs.retirementPhase.annualWithdrawal === ""
                                  ? ""
                                  : inputs.retirementPhase.annualWithdrawal
                              }
                              onChange={(e) =>
                                handleRetirementInputChange(
                                  "annualWithdrawal",
                                  e.target.value
                                )
                              }
                              onBlur={(e) => {
                                if (e.target.value === "") {
                                  handleRetirementInputChange(
                                    "annualWithdrawal",
                                    0
                                  );
                                } else {
                                  handleRetirementInputChange(
                                    "annualWithdrawal",
                                    Number(e.target.value)
                                  );
                                }
                              }}
                              className="w-full pl-7 pr-3 py-2 bg-background/50 border border-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                              min="0"
                            />
                          </div>
                        </div>

                        {/* Retirement Years */}
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Retirement Years
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={
                                typeof inputs.retirementPhase
                                  .retirementYears === "string" &&
                                inputs.retirementPhase.retirementYears === ""
                                  ? ""
                                  : inputs.retirementPhase.retirementYears
                              }
                              onChange={(e) =>
                                handleRetirementInputChange(
                                  "retirementYears",
                                  e.target.value
                                )
                              }
                              onBlur={(e) => {
                                if (e.target.value === "") {
                                  handleRetirementInputChange(
                                    "retirementYears",
                                    1
                                  );
                                } else {
                                  handleRetirementInputChange(
                                    "retirementYears",
                                    Number(e.target.value)
                                  );
                                }
                              }}
                              className="w-full px-3 py-2 bg-background/50 border border-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                              min="1"
                              max="50"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">
                              years
                            </span>
                          </div>
                        </div>

                        {/* Return in Retirement */}
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Expected Return in Retirement
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={
                                typeof inputs.retirementPhase
                                  .retirementReturn === "string" &&
                                inputs.retirementPhase.retirementReturn === ""
                                  ? ""
                                  : inputs.retirementPhase.retirementReturn
                              }
                              onChange={(e) =>
                                handleRetirementInputChange(
                                  "retirementReturn",
                                  e.target.value
                                )
                              }
                              onBlur={(e) => {
                                if (e.target.value === "") {
                                  handleRetirementInputChange(
                                    "retirementReturn",
                                    0
                                  );
                                } else {
                                  handleRetirementInputChange(
                                    "retirementReturn",
                                    Number(e.target.value)
                                  );
                                }
                              }}
                              className="w-full pl-3 pr-9 py-2 bg-background/50 border border-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                              min="0"
                              step="0.1"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">
                              %
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Typically lower than accumulation phase (more
                            conservative)
                          </p>
                        </div>

                        {/* Adjust for Inflation */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="inflation-adjust"
                            checked={
                              inputs.retirementPhase
                                .withdrawalAdjustForInflation
                            }
                            onChange={(e) =>
                              setInputs((prev) => ({
                                ...prev,
                                retirementPhase: {
                                  ...prev.retirementPhase,
                                  withdrawalAdjustForInflation:
                                    e.target.checked,
                                },
                              }))
                            }
                            className="w-4 h-4 mr-2 accent-primary"
                          />
                          <label htmlFor="inflation-adjust" className="text-xs">
                            Adjust withdrawals for inflation
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
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
                  <div
                    className="tooltip"
                    onMouseEnter={(e) =>
                      handleTooltipMouseEnter(e, tooltips.finalBalance)
                    }
                    onMouseLeave={handleTooltipMouseLeave}
                  >
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
                    onMouseEnter={(e) =>
                      handleTooltipMouseEnter(e, tooltips.totalContributions)
                    }
                    onMouseLeave={handleTooltipMouseLeave}
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
                  <div
                    className="tooltip"
                    onMouseEnter={(e) =>
                      handleTooltipMouseEnter(e, tooltips.totalGrowth)
                    }
                    onMouseLeave={handleTooltipMouseLeave}
                  >
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
                    onMouseEnter={(e) =>
                      handleTooltipMouseEnter(
                        e,
                        tooltips.inflationAdjustedValue
                      )
                    }
                    onMouseLeave={handleTooltipMouseLeave}
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
                      onClick={() => handleExportToExcel("investment")}
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
                            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 0 2 2v3" />
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
                        formatter={(value: number, name: string) => {
                          // Create more user-friendly labels based on the dataKey name
                          const labels = {
                            endingBalance: "Portfolio Balance",
                            inflationAdjustedValue: "Inflation-Adjusted Value",
                          };

                          // Use the mapping to get a friendly label, or fall back to the original name
                          const label =
                            labels[name as keyof typeof labels] || name;

                          return [formatCurrency(value), label];
                        }}
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
                          position: "top",
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
                  <p className="mt-1">
                    Note: The chart displays the investment horizon with year 0
                    representing your initial investment and years 1-X showing
                    years of growth.
                  </p>
                </div>
              </div>

              {/* Retirement Chart */}
              {inputs.retirementPhase.enabled &&
                results?.retirementPhaseResults && (
                  <div className="glass-card p-4 md:p-6 transition-all duration-300 hover:shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6">
                      <h2 className="text-xl md:text-2xl font-bold gradient-text mb-2 sm:mb-0">
                        Retirement Withdrawals
                      </h2>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleExportToExcel("retirement")}
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
                      </div>
                    </div>
                    <div className="h-[350px] md:h-[400px] lg:h-[450px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={
                            results.retirementPhaseResults?.yearByYearDetails ||
                            []
                          }
                          margin={{ top: 20, right: 20, left: 60, bottom: 30 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorRetirementBalance"
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
                              id="colorRetirementInflation"
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
                            <linearGradient
                              id="colorCumulativeWithdrawals"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="rgba(220, 53, 69, 0.8)" // This is a bright red with 80% opacity
                                stopOpacity={1}
                              />
                              <stop
                                offset="95%"
                                stopColor="rgba(220, 53, 69, 0.1)" // Faded version of the same red
                                stopOpacity={1}
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
                            tickLine={{
                              stroke: "hsl(var(--muted-foreground))",
                            }}
                            axisLine={{
                              stroke: "hsl(var(--muted-foreground))",
                            }}
                            label={{
                              value: "Retirement Years",
                              position: "insideBottomRight",
                              offset: -10,
                              fill: "hsl(var(--foreground))",
                            }}
                          />
                          <YAxis
                            tickFormatter={(value) => formatCurrency(value)}
                            tick={{ fill: "hsl(var(--foreground))" }}
                            tickLine={{
                              stroke: "hsl(var(--muted-foreground))",
                            }}
                            axisLine={{
                              stroke: "hsl(var(--muted-foreground))",
                            }}
                            width={60}
                          />
                          <Tooltip
                            formatter={(value: number, name: string) => {
                              // Create more user-friendly labels based on the dataKey name
                              const labels = {
                                endingBalance: "Portfolio Balance",
                                inflationAdjustedValue:
                                  "Inflation-Adjusted Value",
                                cumulativeWithdrawals: "Total Withdrawals",
                              };

                              // Use the mapping to get a friendly label, or fall back to the original name
                              const label =
                                labels[name as keyof typeof labels] || name;

                              return [formatCurrency(value), label];
                            }}
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
                            y={
                              results.retirementPhaseResults?.summary
                                .startingBalance || 0
                            }
                            stroke="hsl(var(--muted-foreground))"
                            strokeDasharray="3 3"
                            label={{
                              position: "middle",
                              value: "Starting Balance",
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
                            fill="url(#colorRetirementBalance)"
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
                            fill="url(#colorRetirementInflation)"
                            activeDot={{ r: 8, strokeWidth: 2 }}
                            animationDuration={2000}
                            animationEasing="ease-in-out"
                          />
                          <Area
                            type="monotone"
                            dataKey="cumulativeWithdrawals"
                            name="Total Withdrawals"
                            stroke="#dc3545" // Match the stroke to the same red color
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorCumulativeWithdrawals)"
                            activeDot={{ r: 8, strokeWidth: 2 }}
                            animationDuration={2000}
                            animationEasing="ease-in-out"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>
                        The retirement chart shows your portfolio balance during
                        the withdrawal phase, starting with your ending balance
                        from the investment growth phase.
                      </p>
                      <p className="mt-1">
                        Note: Year 0 represents the start of retirement, and the
                        chart shows the full number of retirement years that you
                        specified.
                      </p>
                    </div>
                  </div>
                )}

              {/* Probability Metrics */}
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
                    Monte Carlo simulation was used to generate 5,000 possible
                    future scenarios based on your inputs, accounting for market
                    volatility.
                  </p>
                </div>
              </div>

              {/* Retirement Analysis */}
              {inputs.retirementPhase.enabled && results && (
                <div className="glass-card p-4 md:p-6 transition-all duration-300 hover:shadow-lg">
                  <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 gradient-text">
                    Retirement Analysis
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <div className="bg-background/40 rounded-lg p-4 border border-border/50">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Years of Income Required
                      </h3>
                      <p className="text-xl font-bold">
                        {results.retirementPhaseResults?.summary
                          .yearsOfIncome || 0}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Your specified retirement period.
                      </p>
                    </div>
                    <div className="bg-background/40 rounded-lg p-4 border border-border/50">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Projected Longevity
                      </h3>
                      <p className="text-xl font-bold">
                        {results.retirementPhaseResults?.summary
                          .projectedLongevity || 0}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        How long your portfolio will actually last.
                      </p>
                    </div>
                    <div className="bg-background/40 rounded-lg p-4 border border-border/50">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Success Rate
                      </h3>
                      <p className="text-xl font-bold">
                        {Math.round(
                          (results.retirementPhaseResults?.probabilityMetrics
                            .successRate || 0) * 100
                        )}
                        %
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Likelihood your money will last through retirement.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 text-sm text-muted-foreground">
                    <p>
                      This analysis models your retirement withdrawals starting
                      with a portfolio value of{" "}
                      {formatCurrency(
                        results.retirementPhaseResults?.summary
                          .startingBalance || 0
                      )}{" "}
                      and simulates {inputs.retirementPhase.retirementYears}{" "}
                      years of retirement with annual withdrawals of{" "}
                      {formatCurrency(inputs.retirementPhase.annualWithdrawal)}
                      {inputs.retirementPhase.withdrawalAdjustForInflation &&
                        " (adjusted for inflation annually)"}
                      .
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Educational Section */}
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
                more you invest, the more you&apos;ll have, but consistency
                matters more than amount.
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
            <h3 className="text-lg font-semibold mb-3 mt-6">
              Understanding Sequence Risk
            </h3>
            <p className="text-muted-foreground">
              Sequence of returns risk refers to the danger that the order of
              investment returns will adversely impact retirees who are making
              withdrawals. Poor returns in the early years of retirement,
              combined with withdrawals, can deplete a portfolio prematurely,
              even if long-term average returns are positive.
            </p>

            <h3 className="text-lg font-semibold mb-3 mt-6">
              Retirement Planning
            </h3>
            <p className="text-muted-foreground mb-4">
              Retirement planning involves determining how much you need to save
              and how to withdraw those savings to maintain your desired
              lifestyle after you stop working. Key considerations include:
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>
                <span className="font-medium">Withdrawal Rate</span>: The 4%
                rule suggests withdrawing 4% of your portfolio in the first year
                of retirement, then adjusting for inflation in subsequent years.
              </li>
              <li>
                <span className="font-medium">
                  Required Minimum Distributions (RMDs)
                </span>
                : After age 73, tax-deferred accounts like traditional IRAs
                require minimum withdrawals based on IRS life expectancy tables.
              </li>
              <li>
                <span className="font-medium">Tax Efficiency</span>: The order
                in which you withdraw from different account types can
                significantly impact your tax burden in retirement.
              </li>
              <li>
                <span className="font-medium">Conservative Returns</span>: Most
                retirees shift to more conservative investments as they age,
                typically resulting in lower but more stable returns.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="mt-8 text-xs text-muted-foreground">
        <p className="text-center">
          <strong>Disclaimer</strong>: This calculator is provided for
          educational and illustrative purposes only. It is not financial advice
          and does not guarantee future investment performance. Investment
          returns are subject to market risk, and you may lose money. Consult
          with a qualified financial professional before making investment
          decisions.
        </p>
      </div>
    </div>
  );
}
