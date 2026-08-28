import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock fetch if not available
if (!globalThis.fetch) {
  globalThis.fetch = vi.fn();
}
