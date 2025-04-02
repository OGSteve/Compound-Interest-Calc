// Import necessary testing libraries for setup
import "@testing-library/jest-dom";

// Mock the next/router
jest.mock("next/router", () => ({
  useRouter: () => ({
    pathname: "/",
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Intl.NumberFormat to ensure consistent output in tests
const originalNumberFormat = Intl.NumberFormat;
global.Intl.NumberFormat = function (locale, options) {
  if (options?.style === "currency") {
    return {
      format: (value) =>
        `$${value.toFixed(options?.maximumFractionDigits || 0)}`,
    };
  }
  return new originalNumberFormat(locale, options);
};

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
