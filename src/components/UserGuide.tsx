import React from "react";

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserGuide({ isOpen, onClose }: UserGuideProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.3s_ease-in-out]">
      <div
        className="bg-background border border-border rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col relative animate-[slideUpFade_0.3s_ease-in-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-background/80 transition-colors"
          aria-label="Close guide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Guide header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold gradient-text">
            Enhanced Compound Interest Calculator: User Guide
          </h2>
        </div>

        {/* Guide content - scrollable */}
        <div className="p-6 overflow-y-auto flex-1 user-guide-content">
          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              Understanding Your Results
            </h3>
            <p className="mb-4">
              This guide explains what each number in your calculation results
              means and how it's determined.
            </p>

            <h4 className="text-lg font-medium mt-6 mb-3">
              Why Results Change Each Time You Calculate
            </h4>
            <p className="mb-2">
              You may notice that even with identical inputs, your results vary
              slightly each time you click "Calculate." This is intentional and
              reflects how real markets behave:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>
                Real investment returns fluctuate year-to-year, not growing at a
                steady rate
              </li>
              <li>
                The calculator simulates this market randomness using your
                "Return Volatility" setting
              </li>
              <li>
                Each calculation represents a different possible market scenario
              </li>
              <li>
                This approach is more realistic than assuming the same return
                every year
              </li>
            </ul>
            <p className="mb-4">
              The Final Balance and other main results show one possible path,
              while the Probability Analysis (Median, 90th, and 10th percentile
              values) shows the range of outcomes from running thousands of
              different scenarios.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              Your Input Parameters
            </h3>
            <p className="mb-4">
              The calculator uses these parameters to project your investment's
              growth:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>
                <strong>Initial Investment</strong>: Your starting amount
              </li>
              <li>
                <strong>Monthly Contribution</strong>: How much you add each
                month
              </li>
              <li>
                <strong>Annual Contribution Increase</strong>: How much your
                monthly contribution grows each year
              </li>
              <li>
                <strong>Investment Horizon</strong>: How many years you'll be
                investing
              </li>
              <li>
                <strong>Expected Annual Return</strong>: Average yearly
                investment return (before inflation)
              </li>
              <li>
                <strong>Return Volatility</strong>: How much returns might vary
                year-to-year
              </li>
              <li>
                <strong>Inflation Rate</strong>: Annual increase in prices that
                reduces purchasing power
              </li>
              <li>
                <strong>Fund Expense Ratio</strong>: The annual fee charged by
                funds to cover operating expenses
              </li>
              <li>
                <strong>Advisory Fee</strong>: The fee paid for a financial
                advisor for portfolio management
              </li>
              <li>
                <strong>Account Type</strong>: Tax treatment of your investment
                account
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              Main Results Explained
            </h3>

            <h4 className="text-lg font-medium mt-6 mb-3">Final Balance</h4>
            <p className="mb-4">
              This is the projected total value of your investment at the end of
              your investment horizon. It includes:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Your initial investment</li>
              <li>All contributions made over time</li>
              <li>Investment growth through compound returns</li>
              <li>Minus any fees</li>
            </ul>
            <p className="mb-4">
              This number shows the nominal future value, not adjusted for
              inflation.
            </p>

            <h4 className="text-lg font-medium mt-6 mb-3">
              Total Contributions
            </h4>
            <p className="mb-4">
              This represents all the money you personally invested:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Your initial investment</li>
              <li>
                All monthly contributions over the investment period (including
                annual increases)
              </li>
            </ul>
            <p className="mb-4">
              This helps you see how much of your final balance came from your
              own investments versus investment growth.
            </p>

            <h4 className="text-lg font-medium mt-6 mb-3">Total Growth</h4>
            <p className="mb-4">
              This shows how much your money grew from investment returns:
            </p>
            <p className="mb-4">
              Total Growth = Final Balance - Total Contributions - Fees
            </p>
            <p className="mb-4">
              This number demonstrates the power of compound interest, showing
              your investment earnings over time.
            </p>

            <h4 className="text-lg font-medium mt-6 mb-3">
              Inflation-Adjusted Value
            </h4>
            <p className="mb-4">
              This shows what your final balance would be worth in today's
              purchasing power:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>
                It accounts for how inflation reduces the value of money over
                time
              </li>
              <li>
                For example, $1,000,000 in 30 years might only buy what $550,000
                buys today
              </li>
            </ul>
            <p className="mb-4">
              This gives you a more realistic picture of your investment's
              future value.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Probability Analysis</h3>
            <p className="mb-4">
              These numbers come from running thousands of market simulations
              with your inputs:
            </p>

            <h4 className="text-lg font-medium mt-6 mb-3">Median Outcome</h4>
            <p className="mb-4">
              The middle result from all simulations - there's a 50% chance your
              actual result will be higher than this amount.
            </p>
            <p className="mb-4">
              This is typically lower than the Final Balance because the
              standard projection often uses a constant rate of return, while
              real markets have ups and downs.
            </p>

            <h4 className="text-lg font-medium mt-6 mb-3">90th Percentile</h4>
            <p className="mb-4">
              A very optimistic outcome - only 10% of simulations exceeded this
              amount.
            </p>
            <p className="mb-4">
              This shows what might happen if market conditions are particularly
              favorable during your investment period.
            </p>

            <h4 className="text-lg font-medium mt-6 mb-3">10th Percentile</h4>
            <p className="mb-4">
              A pessimistic outcome - 90% of simulations performed better than
              this.
            </p>
            <p className="mb-4">
              This helps you understand potential downside risk and plan
              accordingly.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              Investment Growth Chart
            </h3>
            <p className="mb-4">The chart visualizes:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>
                <strong>Balance</strong> (blue): Your projected investment value
                over time
              </li>
              <li>
                <strong>Inflation-Adjusted</strong> (teal): What that value is
                worth in today's purchasing power
              </li>
              <li>
                <strong>Initial Investment</strong> line: Your starting amount
                for reference
              </li>
            </ul>
            <p className="mb-4">
              This shows how your investment grows over time, with the steeper
              curve in later years demonstrating compound interest's exponential
              effect.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              Retirement Analysis (if enabled)
            </h3>
            <p className="mb-4">
              If you've enabled retirement withdrawal phase, you'll see
              additional information:
            </p>

            <h4 className="text-lg font-medium mt-6 mb-3">Retirement Chart</h4>
            <p className="mb-4">
              Shows your portfolio balance during the withdrawal phase:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>
                Starting with your ending balance from the investment growth
                phase
              </li>
              <li>Decreasing as you make withdrawals</li>
              <li>
                Still potentially growing from continued investment returns
              </li>
            </ul>

            <h4 className="text-lg font-medium mt-6 mb-3">
              Retirement Metrics
            </h4>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>
                <strong>Years of Income Required</strong>: Your specified
                retirement period
              </li>
              <li>
                <strong>Projected Longevity</strong>: How long your portfolio
                will actually last
              </li>
              <li>
                <strong>Success Rate</strong>: Likelihood your money will last
                through retirement
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Advanced Parameters</h3>

            <h4 className="text-lg font-medium mt-6 mb-3">Return Volatility</h4>
            <p className="mb-4">
              Return Volatility represents how much investment returns tend to
              fluctuate:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>
                With 15% volatility (default) and a 7% expected return, annual
                returns typically range from -7% to +23%
              </li>
              <li>
                Lower volatility (5-10%): Smoother returns, like a bond-heavy
                portfolio
              </li>
              <li>
                Medium volatility (15-20%): Moderate fluctuations, typical for a
                balanced portfolio
              </li>
              <li>
                Higher volatility (25%+): Larger swings, like an aggressive
                stock portfolio
              </li>
            </ul>
            <p className="mb-4">
              The calculator occasionally simulates larger market moves (both up
              and down) to reflect real-world market behavior.
            </p>

            <h4 className="text-lg font-medium mt-6 mb-3">Investment Fees</h4>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>
                <strong>Expense Ratio</strong>: Fees charged by investment funds
                (default: 0.1%)
              </li>
              <li>
                <strong>Advisory Fee</strong>: Fees charged by financial
                advisors (default: 0%, self-managed)
              </li>
            </ul>
            <p className="mb-4">
              These fees are deducted as monthly equivalents (e.g. 0.1%/12) from
              your investment and compound over time. Even small fee differences
              can significantly impact long-term results.
            </p>

            <h4 className="text-lg font-medium mt-6 mb-3">Inflation Rate</h4>
            <p className="mb-4">
              The calculator factors in how inflation reduces purchasing power:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>The historical average is around 2-3% annually</li>
              <li>
                This helps you understand what your money will actually be worth
              </li>
            </ul>

            <h4 className="text-lg font-medium mt-6 mb-3">Account Type</h4>
            <p className="mb-4">
              Different investment accounts have different tax treatments:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>
                <strong>Tax-Deferred</strong> (401k, Traditional IRA): No taxes
                on contributions or growth until withdrawal, then taxed as
                ordinary income
              </li>
              <li>
                <strong>Tax-Free</strong> (Roth accounts): Contributions are
                taxed, but growth and withdrawals are tax-free
              </li>
              <li>
                <strong>Taxable</strong>: Contributions are taxed, dividends
                taxed annually, and withdrawals may trigger capital gains tax
              </li>
              <li>
                <strong>Mixed</strong>: Combination of tax-deferred and tax-free
                accounts
              </li>
            </ul>
            <p className="mb-4">
              During retirement withdrawals, the calculator uses a tax-efficient
              strategy that withdraws from accounts in this order:
            </p>
            <ol className="list-decimal pl-6 mb-4 space-y-1">
              <li>Taxable accounts first (typically lower tax rates)</li>
              <li>Tax-free accounts next (no tax impact)</li>
              <li>Tax-deferred accounts last (typically higher tax rates)</li>
            </ol>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              Monte Carlo Simulation
            </h3>
            <p className="mb-4">
              The calculator uses Monte Carlo simulation to model thousands of
              possible market scenarios:
            </p>
            <ol className="list-decimal pl-6 mb-4 space-y-1">
              <li>
                Each simulation uses a random sequence of returns based on your
                Expected Annual Return and Return Volatility
              </li>
              <li>These sequences model the unpredictable nature of markets</li>
              <li>
                By running thousands of simulations, the calculator generates a
                range of possible outcomes rather than a single projection
              </li>
              <li>
                This provides a more realistic view of your investment's
                potential performance
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              Factors Affecting Your Results
            </h3>

            <h4 className="text-lg font-medium mt-6 mb-3">
              Most Impactful Factors
            </h4>
            <ol className="list-decimal pl-6 mb-4 space-y-1">
              <li>
                <strong>Investment Horizon</strong>: Longer time periods
                dramatically increase final balances due to compound growth
              </li>
              <li>
                <strong>Expected Annual Return</strong>: Higher returns compound
                over time, significantly affecting outcomes
              </li>
              <li>
                <strong>Monthly Contribution</strong>: Consistent contributions
                build substantial wealth over time
              </li>
            </ol>

            <h4 className="text-lg font-medium mt-6 mb-3">
              Other Important Factors
            </h4>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>
                <strong>Return Volatility</strong>: Impacts the range of
                potential outcomes
              </li>
              <li>
                <strong>Inflation Rate</strong>: Affects the real purchasing
                power of your final balance
              </li>
              <li>
                <strong>Tax Treatment</strong>: Different account types can lead
                to significant differences in after-tax returns
              </li>
              <li>
                <strong>Fees</strong>: Even small fees can substantially reduce
                returns over long periods
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
