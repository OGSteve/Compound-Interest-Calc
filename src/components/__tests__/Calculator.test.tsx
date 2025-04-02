import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Calculator from "../Calculator";

// Mock the recharts library to avoid errors in testing
jest.mock("recharts", () => {
  const OriginalModule = jest.requireActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    AreaChart: () => <div data-testid="area-chart"></div>,
    Area: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
    Legend: () => <div />,
  };
});

// Mock the XLSX library
jest.mock("xlsx", () => ({
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

describe("Calculator Component", () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  it("renders with default values", () => {
    render(<Calculator />);

    // Check that the component renders with its title
    expect(
      screen.getByText(/Enhanced Compound Interest Calculator/i)
    ).toBeInTheDocument();

    // Check that initial investment input is present
    expect(screen.getByText(/Initial Investment/i)).toBeInTheDocument();

    // Check that the calculate button is present
    expect(
      screen.getByRole("button", { name: /calculate/i })
    ).toBeInTheDocument();
  });

  it("allows users to input values", async () => {
    render(<Calculator />);

    // Find the initial investment input
    const initialInvestmentInput = screen.getByLabelText(/Initial Investment/i);

    // Change the value
    await userEvent.clear(initialInvestmentInput);
    await userEvent.type(initialInvestmentInput, "25000");

    // Verify the value was changed
    expect(initialInvestmentInput).toHaveValue("25000");
  });

  it("shows advanced parameters when toggle is clicked", async () => {
    render(<Calculator />);

    // Advanced parameters are hidden by default
    const showAdvancedButton = screen.getByText(/Show Advanced Parameters/i);
    expect(showAdvancedButton).toBeInTheDocument();

    // Click to show advanced parameters
    await userEvent.click(showAdvancedButton);

    // Now we should see the advanced settings
    expect(screen.getByText(/Return Volatility/i)).toBeInTheDocument();
    expect(screen.getByText(/Inflation Rate/i)).toBeInTheDocument();
  });

  it("performs calculation when calculate button is clicked", async () => {
    render(<Calculator />);

    // Find and click the calculate button
    const calculateButton = screen.getByRole("button", { name: /calculate/i });
    await userEvent.click(calculateButton);

    // After calculation, results section should be visible
    await waitFor(() => {
      expect(screen.getByText(/Investment Growth/i)).toBeInTheDocument();
    });

    // Verify that the chart is rendered
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("displays account type options correctly", async () => {
    render(<Calculator />);

    // Show advanced parameters
    const showAdvancedButton = screen.getByText(/Show Advanced Parameters/i);
    await userEvent.click(showAdvancedButton);

    // Check that we can see the account type selector
    const accountTypeSelector = screen.getByLabelText(/Account Type/i);
    expect(accountTypeSelector).toBeInTheDocument();

    // Select a different account type
    await userEvent.selectOptions(accountTypeSelector, "tax-free");

    // Check that the selection was applied
    expect(accountTypeSelector).toHaveValue("tax-free");
  });

  it("handles mixed account type allocation", async () => {
    render(<Calculator />);

    // Show advanced parameters
    const showAdvancedButton = screen.getByText(/Show Advanced Parameters/i);
    await userEvent.click(showAdvancedButton);

    // Select mixed account type
    const accountTypeSelector = screen.getByLabelText(/Account Type/i);
    await userEvent.selectOptions(accountTypeSelector, "mixed");

    // Check that allocation controls are now shown
    await waitFor(() => {
      expect(screen.getByText(/Account Allocation/i)).toBeInTheDocument();
    });
  });
});
