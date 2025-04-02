# Testing Documentation for Enhanced Compound Interest Calculator

This document outlines the testing infrastructure, conventions, and best practices for the Enhanced Compound Interest Calculator project.

## Table of Contents

- [Testing Stack](#testing-stack)
- [Test Organization](#test-organization)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [Mocking Guidelines](#mocking-guidelines)
- [Performance Testing](#performance-testing)

## Testing Stack

The project uses the following testing technologies:

- **Jest**: Main test runner and assertion library
- **React Testing Library**: For testing React components
- **Jest DOM**: Additional DOM testing utilities
- **User Event**: For simulating user interactions

## Test Organization

Tests are organized following a similar structure to the source code:

```
src/
├── __tests__/               # Global tests, environment tests
├── components/
│   └── __tests__/           # Component tests
├── utils/
│   └── __tests__/           # Utility and calculation tests
└── setupTests.ts            # Test setup and configuration
```

## Running Tests

The following npm scripts are available for running tests:

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Writing Tests

### Component Tests

When testing components, focus on user-centric behaviors rather than implementation details:

```javascript
// Good example - testing what the user experiences
it("shows advanced parameters when toggle is clicked", async () => {
  render(<Calculator />);
  await userEvent.click(screen.getByText(/Show Advanced Parameters/i));
  expect(screen.getByText(/Return Volatility/i)).toBeInTheDocument();
});

// Avoid - testing implementation details
it("changes the showAdvanced state when clicked", async () => {
  const { result } = renderHook(() => useState(false));
  const [showAdvanced, setShowAdvanced] = result.current;
  // This is testing internal state, which is brittle
});
```

### Utility Tests

For utility functions like calculations, focus on testing:

1. Correctness of the calculation under different inputs
2. Edge cases (zero values, very large values, etc.)
3. Different account types and configurations
4. Performance for complex calculations

```javascript
it('handles compound growth with monthly contributions', () => {
  // Arrange - set up inputs
  const inputs = {...};

  // Act - call the function
  const result = calculateMonthlyCompoundInterest(inputs);

  // Assert - check key values
  expect(result.summary.finalBalance).toBeGreaterThan(expectedMinimum);
  expect(result.summary.totalContributions).toBeCloseTo(expectedContributions, 0);
});
```

## Test Coverage

The project aims to maintain high code coverage, especially for critical calculation functions. Coverage reports are generated with the `npm run test:coverage` command.

### Coverage Targets

- **Utils/Calculations**: 90%+ coverage
- **Components**: 80%+ coverage
- **Overall**: 85%+ coverage

## Mocking Guidelines

### External Libraries

External visualization libraries like Recharts should be mocked to simplify testing:

```javascript
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: () => <div data-testid="area-chart"></div>,
  // ... other components
}));
```

### Browser APIs

When testing functions that use browser APIs (like XLSX export), mock the required methods:

```javascript
jest.mock("xlsx", () => ({
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));
```

## Performance Testing

Performance tests help ensure the calculator remains responsive even with complex calculations:

```javascript
it("completes a standard calculation within a reasonable time", () => {
  const executionTime = measureExecutionTime(() => {
    calculateMonthlyCompoundInterest(inputs);
  });

  // This is a performance benchmark rather than a strict test
  expect(executionTime).toBeLessThan(5000); // milliseconds
});
```

These tests use more generous timeouts and act as benchmarks rather than strict assertions. They're particularly important when adding new features that might impact calculation performance.

---

## Best Practices

1. **Test in isolation**: Each test should be independent and not rely on the state created by other tests.
2. **Use realistic data**: Test inputs should reflect real-world usage.
3. **Name tests clearly**: Test names should describe the expected behavior, not implementation details.
4. **Clean up after tests**: Make sure tests clean up any global state they modify.
5. **Keep tests fast**: Slow tests discourage regular testing during development.
