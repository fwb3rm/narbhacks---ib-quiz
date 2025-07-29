import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { subcategory, difficulty } = await request.json();

    const issues: string[] = [];
    let isValid = true;

    // Check if subcategory is valid
    const validSubcategories = [
      "Income Statement Breakdown",
      "Balance Sheet Breakdown",
      "Cash Flow Statement Breakdown",
      "3-Statement Linkages",
      "Accrual vs Cash Accounting",
      "Depreciation & Amortization",
      "Working Capital",
      "Inventory Methods (FIFO, LIFO)",
      "Lease Accounting (Operating vs Capital)",
      "Deferred Taxes",
      "Stock-Based Compensation",
      "Asset Write-Downs & Impairments",
      "Shareholders' Equity & Retained Earnings",
      "Prepaid vs Accrued Expenses",
      "Interest Expense",
      "Accounting for Debt Issuance",
      "DCF Analysis",
      "Comparable Company Analysis",
      "Precedent Transactions",
      "WACC Calculation",
      "Beta Estimation",
      "Terminal Value",
      "Multiples Analysis (EV/EBITDA, P/E, etc.)",
      "Enterprise Value vs Equity Value",
      "Dilution Impact",
      "Sensitivity Analysis",
      "Calendarization & LTM Adjustments",
      "Sum-of-the-Parts (SOTP) Valuation",
      "Adjusting Comparables",
      "Equity Value Bridges",
      "Control Premiums & Discounts",
    ];

    if (!validSubcategories.includes(subcategory)) {
      issues.push(`Invalid subcategory: ${subcategory}`);
      isValid = false;
    }

    // Check if difficulty is valid
    if (!["easy", "hard"].includes(difficulty)) {
      issues.push(`Invalid difficulty: ${difficulty}`);
      isValid = false;
    }

    // Estimate token usage
    const basePromptTokens = 1500; // Approximate base prompt size
    const difficultyMultiplier = difficulty === "easy" ? 1 : 2;
    const estimatedTokens = basePromptTokens * difficultyMultiplier;

    // Estimate cost (using Gemini 2.5 Flash pricing)
    const inputCostPer1K = 0.000075;
    const outputCostPer1K = 0.0003;
    const estimatedInputCost = (estimatedTokens * inputCostPer1K) / 1000;
    const estimatedOutputCost =
      (estimatedTokens * 0.2 * outputCostPer1K) / 1000; // Assume 20% output ratio
    const estimatedCost = estimatedInputCost + estimatedOutputCost;

    return NextResponse.json({
      isValid,
      issues,
      estimatedTokens,
      estimatedCost,
    });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
