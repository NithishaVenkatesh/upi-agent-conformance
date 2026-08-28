import { describe, it, expect } from "vitest";
import {
  STATUS_COLORS,
  STATUS_TEXT,
  CONFORMANCE_COLORS,
  GATE_DECISION_CODES,
  CONFORMANCE_CODES,
  DEMO_CATALOG,
  ITEMS_PER_PAGE,
  LEDGER_VIRTUALIZATION_HEIGHT,
} from "../../lib/constants";

describe("Constants", () => {
  describe("Status Colors", () => {
    it("should have correct color values", () => {
      expect(STATUS_COLORS.ALLOWED).toBe("#10b981"); // green
      expect(STATUS_COLORS.REFUSED).toBe("#ef4444"); // red
      expect(STATUS_COLORS.UNDETERMINED).toBe("#f97316"); // orange
      expect(STATUS_COLORS.PENDING).toBe("#3b82f6"); // blue
      expect(STATUS_COLORS.CAPTURE_FAILED).toBe("#f97316"); // orange
    });
  });

  describe("Status Text", () => {
    it("should have all required status texts", () => {
      expect(STATUS_TEXT.ALLOWED).toBe("✓ ALLOWED");
      expect(STATUS_TEXT.REFUSED).toBe("✗ REFUSED");
      expect(STATUS_TEXT.UNDETERMINED).toBe("? UNDETERMINED");
      expect(STATUS_TEXT.PENDING).toBe("⧗ PENDING");
    });
  });

  describe("Conformance Colors", () => {
    it("should map conformance results to colors", () => {
      expect(CONFORMANCE_COLORS.PASS).toBe("#10b981");
      expect(CONFORMANCE_COLORS.FAIL).toBe("#ef4444");
      expect(CONFORMANCE_COLORS.UNDETERMINED).toBe("#f97316");
    });
  });

  describe("Gate Decision Codes", () => {
    it("should have descriptions for all decision codes", () => {
      expect(GATE_DECISION_CODES.authorised).toBe("Payment authorized");
      expect(GATE_DECISION_CODES.cap_exceeds_authority).toContain("Cap exceeds");
      expect(GATE_DECISION_CODES.retry_not_permitted).toBeDefined();
      expect(GATE_DECISION_CODES.block_expired).toBeDefined();
    });

    it("should cover all known gate decision codes", () => {
      const requiredCodes = [
        "authorised",
        "cap_exceeds_authority",
        "insufficient_block_balance",
        "validity_exceeds_authority",
        "block_expired",
        "duplicate_block_for_merchant",
        "retry_not_permitted",
        "retry_budget_exhausted",
        "idempotency_replay",
        "counterparty_not_conformant",
        "capture_failed",
      ];

      requiredCodes.forEach((code) => {
        expect(GATE_DECISION_CODES[code as keyof typeof GATE_DECISION_CODES]).toBeDefined();
      });
    });
  });

  describe("Demo Catalog", () => {
    it("should have three products", () => {
      expect(Object.keys(DEMO_CATALOG)).toHaveLength(3);
    });

    it("should have valid product data", () => {
      expect(DEMO_CATALOG.sku1.name).toBe("Cotton tote");
      expect(DEMO_CATALOG.sku1.price_minor).toBe(249900);

      expect(DEMO_CATALOG.sku2.name).toBe("Canvas backpack");
      expect(DEMO_CATALOG.sku2.price_minor).toBe(389900);

      expect(DEMO_CATALOG.sku3.name).toBe("Laptop sleeve");
      expect(DEMO_CATALOG.sku3.price_minor).toBe(149900);
    });

    it("should have all prices in paise (₹ * 100)", () => {
      Object.values(DEMO_CATALOG).forEach((product) => {
        expect(product.price_minor).toBeGreaterThan(0);
        expect(product.price_minor).toBe(Math.round(product.price_minor));
      });
    });
  });

  describe("Pagination Constants", () => {
    it("should have reasonable pagination settings", () => {
      expect(ITEMS_PER_PAGE).toBe(25);
      expect(LEDGER_VIRTUALIZATION_HEIGHT).toBe(600);
    });
  });

  describe("Conformance Codes", () => {
    it("should have all required conformance codes", () => {
      const requiredCodes = [
        "conformant",
        "value_exceeds_authority",
        "scope_mismatch",
        "omitted",
        "predicate_contradiction",
        "low_confidence",
        "no_authority_found",
        "unit_mismatch",
      ];

      requiredCodes.forEach((code) => {
        expect(CONFORMANCE_CODES[code as keyof typeof CONFORMANCE_CODES]).toBeDefined();
      });
    });
  });
});
