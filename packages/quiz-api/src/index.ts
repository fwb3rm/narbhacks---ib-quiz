import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

import cors from "cors";
import express from "express";
import JSON5 from "json5";
import OpenAI from "openai";

console.log("DEBUG: OPENROUTER_API_KEY value:", process.env.OPENROUTER_API_KEY);

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function generateQuestion(requestedDifficulty?: string, requestedCategory?: string) {
  const topics = [
    "Accounting",
    "Accounting",
    "Accounting",
    "Accounting",
    "Accounting",
    "Accounting", // 6 = 30%
    "Valuation",
    "Valuation",
    "Valuation",
    "Valuation",
    "Valuation", // 5 = 25%
    "LBO",
    "LBO",
    "LBO",
    "LBO", // 4 = 20%
    "M&A",
    "M&A",
    "M&A",
    "M&A", // 4 = 20%
    "Capital Markets",
    "Capital Markets", // 2 = 10%
    "Corporate Finance",
    "Corporate Finance", // 2 = 10%
    "Technical Modeling",
    "Technical Modeling",
  ];
  
  // If a specific category is requested, use it; otherwise pick randomly
  const randomTopic = requestedCategory 
    ? requestedCategory.charAt(0).toUpperCase() + requestedCategory.slice(1).toLowerCase()
    : topics[Math.floor(Math.random() * topics.length)];

  // Define specific subcategories for each main topic
  const subcategories = {
    Accounting: [
      "income statement breakdown",
      "balance sheet breakdown",
      "cash flow statement breakdown",
      "3-statement linkages",
      "accrual vs cash accounting",
      "depreciation & amortization",
      "working capital",
      "inventory methods (FIFO, LIFO)",
      "lease accounting (operating vs capital)",
      "deferred taxes",
      "stock-based compensation",
      "asset write-downs & impairments",
      "shareholders' equity & retained earnings",
      "prepaid vs accrued expenses",
      "interest expense",
      "accounting for debt issuance",
    ],
    Valuation: [
      "DCF analysis",
      "comparable company analysis",
      "precedent transactions",
      "WACC calculation",
      "beta estimation",
      "terminal value",
      "multiples analysis (EV/EBITDA, P/E, etc.)",
      "enterprise value vs equity value",
      "dilution impact",
      "sensitivity analysis",
      "calendarization & LTM adjustments",
      "sum-of-the-parts (SOTP) valuation",
      "adjusting comparables",
      "equity value bridges",
      "control premiums & discounts",
    ],
    "M&A": [
      "deal structures (cash vs stock)",
      "merger model mechanics",
      "accretion/dilution analysis",
      "purchase price allocation (PPA)",
      "synergy analysis",
      "goodwill creation in M&A",
      "financing options in M&A",
      "due diligence process",
      "regulatory review & antitrust",
      "pro forma financial statements",
      "deal protection mechanisms",
      "earnouts & contingent payments",
      "target valuation in M&A context",
      "hostile takeovers & defense mechanisms",
      "shareholder approval & board dynamics",
    ],
    LBO: [
      "LBO capital structure",
      "sources & uses of funds",
      "types of debt financing",
      "cash flow modeling in LBOs",
      "working capital in LBOs",
      "IRR calculation & return drivers",
      "debt covenants & restrictions",
      "credit metrics (debt/EBITDA, interest coverage)",
      "dividend recapitalization",
      "refinancing strategies",
      "exit strategies (IPO, M&A, secondary)",
      "management incentives",
      "operational improvements",
      "roll-forward of debt",
    ],
    "Capital Markets": [
      "IPO process overview",
      "bookbuilding process",
      "underwriting & syndication",
      "equity vs debt offerings",
      "debt issuance mechanics",
      "pricing strategies for offerings",
      "roadshows & investor presentations",
      "regulatory filings (S-1, 10-K, etc.)",
      "market timing considerations",
      "convertible securities",
      "high-yield vs investment-grade debt",
      "private placements",
      "PIPE deals",
      "secondary offerings",
      "credit ratings impact",
      "investor relations strategy",
    ],
    "Corporate Finance": [
      "capital budgeting (NPV, IRR)",
      "internal rate of return (IRR)",
      "working capital management",
      "dividend policy decisions",
      "capital structure optimization",
      "cost of capital estimation",
      "financial planning & forecasting",
      "treasury operations",
      "risk management strategies",
      "scenario & sensitivity analysis",
      "restructuring & turnaround strategy",
      "strategic alternatives (M&A, dividends, buybacks)",
      "bankruptcy process & recovery",
      "basic financial modeling",
      "return on invested capital (ROIC)",
      "management reporting & KPIs",
    ],
    "Technical Modeling": [
      "modeling circular references",
      "building a debt schedule",
      "forecasting working capital",
      "modeling revolvers & minimum cash",
      "tracing model errors",
      "Excel modeling best practices",
    ],
  };

  const topicSubcategories =
    subcategories[randomTopic as keyof typeof subcategories] || [];
  const randomSubcategory =
    topicSubcategories[Math.floor(Math.random() * topicSubcategories.length)];

  const completion = await openrouter.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
You are an investment banking associate at a bulge bracket firm. You are creating one multiple-choice question for an entry-level investment banking interview.

Your job:
- Generate a unique, non-repetitive, and realistic IB interview question based on the given topic: ${randomTopic}
- Focus specifically on the subcategory: ${randomSubcategory}
- Match the tone, style, and difficulty of the real questions listed below.
- NEVER repeat question structure or phrasing from any prior question.
- Assume this is for a first-round interview — keep it practical and relevant.
${requestedDifficulty ? `- IMPORTANT: The requested difficulty level is "${requestedDifficulty}". Generate a question that matches this difficulty level.` : ""}

✅ FORMAT (must follow this exactly, and return only raw JSON — no markdown):

{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "answer": "string",
  "explanation": "string",
  "subcategory": "${randomSubcategory}",
  "difficulty": "easy|medium|hard",
  "points": number
}

🚫 DO NOT include markdown like \`\`\`json or any commentary outside the JSON block.

⚠️ Constraints:
- Must be entry-level appropriate.
- Do NOT require complex math — only use simple round numbers like $100, $10, etc.
- Do NOT repeat phrasing or ask the same conceptual question multiple times.
- Must test practical understanding of investment banking concepts.
- Must include 4 plausible answer choices.
- Clearly label the correct answer.
- Explanation must briefly justify the correct choice.
- ALWAYS include the subcategory field with the exact value: "${randomSubcategory}"
- ALWAYS include difficulty: "easy" (50 points), "medium" (100 points), or "hard" (150 points)
${requestedDifficulty ? `- CRITICAL: The difficulty MUST be "${requestedDifficulty}" - do not generate any other difficulty level.` : ""}
- Ensure you include some hard questions that would challenge even top candidates/interviewees.
- ALWAYS include points: 50 for easy, 100 for medium, 150 for hard

📌 Use the example bank below as inspiration for style, length, and content:

ACCOUNTING:
- "If Depreciation is a non-cash expense, why does it affect the cash balance?"
- "What happens when Accrued Compensation goes up by $10?"
- "Could you ever end up with negative shareholders’ equity? What does it mean?"
- "What is Working Capital? How is it used?"
- "Recently, banks have been writing down their assets and taking huge quarterly losses. Walk me through what happens on the 3 statements when there’s a write-down of $100."
- "When would a company collect cash from a customer and not record it as revenue?"
- "Walk me through what flows into Additional Paid-In Capital (APIC)."
- "What’s the difference between capital leases and operating leases?"

VALUATION:
- "Company has $100 in earnings and trades at a P/E of 20x. What's the stock price?"
- "Should Cost of Equity be higher for a $5 billion or $500 million market cap company?"
- "What’s the relationship between debt and Cost of Equity?"
- "How do you calculate fully diluted shares?"
- "Could a company have a negative Enterprise Value? What would that mean?"
- "A company has 1 million shares outstanding at a value of $100 per share. It also has $10 million of convertible bonds, with par value of $1,000 and a conversion price of $50. How do I calculate diluted shares outstanding?"
- "When would you use Sum of the Parts?"
- "Would an LBO or DCF give a higher valuation?"
- "What are the flaws with public company comparables?"
- "How do you calculate WACC?"
- "How do you get to Beta in the Cost of Equity calculation?"
- "Would you expect a manufacturing company or a technology company to have a higher Beta?"
- "Explain why we would use the mid-year convention in a DCF."

M&A:
- "What’s the difference between stock-for-stock and cash acquisitions?"
- "All else being equal, which method would a company prefer to use when acquiring another company – cash, stock, or debt?"
- "Could you get DTLs or DTAs in an asset purchase?"
- "Explain the complete formula for how to calculate Goodwill in an M&A deal."
- "What are the main 3 transaction structures you could use to acquire another company?"

LBO:
- "What’s the typical exit strategy in an LBO?"
- "What variables impact an LBO model the most?"
- "What is the difference between bank debt and high-yield debt?"
- "What is meant by the “tax shield” in an LBO?"
- "How is a Revolver is used in an LBO model?"

CAPITAL MARKETS:
- "If a company issues $100 debt at 5% interest, what is the annual interest cost?"
- "What happens if a convertible bond is converted into equity?"
- "What distinguishes a secondary offering from a primary offering?"

CORPORATE FINANCE:
- "What happens to retained earnings if a $20 dividend is paid?"
- "A project costs $100 and is expected to generate $120 in 1 year. If the discount rate is 10%, what is the NPV?"
- "A company is replacing equity with low-interest debt. What is the likely short-term effect?"

TECHNICAL MODELING:
- "What causes a circular reference in a 3-statement model involving interest expense?"
- "A model includes a revolver and a $10M minimum cash balance. If cash drops to $5M, what happens?"
- "Your balance sheet is off by $25 after adding depreciation. What’s the most likely issue?"
- "A company has $200M of debt at 5% interest. What is the interest expense and where does it appear?"

Only return raw JSON in the format above. Do not return any explanation or markdown.
        `.trim(),
      },
    ],
    model: "google/gemini-2.5-flash",
  });

  const rawContent = completion.choices[0].message.content || "";
  let questionContent = rawContent;

  // Clean up formatting
  if (questionContent.includes("```json")) {
    questionContent = questionContent
      .replace(/```json\s*/g, "")
      .replace(/```\s*$/g, "");
  } else if (questionContent.includes("```")) {
    questionContent = questionContent.replace(/```\s*/g, "");
  }

  questionContent = questionContent.trim();

  try {
    const aiQuestion = JSON5.parse(questionContent);
    return {
      ...aiQuestion,
      type: "ai-generated",
      category: randomTopic.charAt(0).toUpperCase() + randomTopic.slice(1),
      subcategory: (aiQuestion.subcategory || randomSubcategory)
        .split(" ")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      difficulty: aiQuestion.difficulty || "medium",
      points: aiQuestion.points || 100,
    };
  } catch (error) {
    console.error("Failed to parse AI response as JSON:", error);
    console.error("Raw content that failed to parse:", rawContent);
    console.error("Cleaned content that failed to parse:", questionContent);

    const fallbackQuestions = [
      {
        question: "What is the primary purpose of a P/E ratio in valuation?",
        options: [
          "To measure a company's debt levels",
          "To compare a company's stock price to its earnings",
          "To calculate a company's cash flow",
          "To determine a company's market share",
        ],
        answer: "To compare a company's stock price to its earnings",
        explanation:
          "The P/E ratio compares a company's stock price to its earnings per share, helping investors assess valuation.",
        difficulty: "easy",
        points: 50,
      },
      {
        question: "In an LBO, what is the primary source of financing?",
        options: [
          "Equity from the acquiring company",
          "Debt financing",
          "Government grants",
          "Customer deposits",
        ],
        answer: "Debt financing",
        explanation:
          "LBOs are typically funded through debt, with the acquired company’s cash flow used to pay it down.",
      },
      {
        question: "What is the main purpose of a fairness opinion in M&A?",
        options: [
          "To determine the final purchase price",
          "To provide an independent assessment of whether a deal is fair to shareholders",
          "To calculate the synergies",
          "To approve the transaction",
        ],
        answer:
          "To provide an independent assessment of whether a deal is fair to shareholders",
        explanation:
          "A fairness opinion ensures shareholders are getting reasonable value in a transaction.",
      },
    ];

    const randomIndex = Math.floor(Math.random() * fallbackQuestions.length);
    return {
      ...fallbackQuestions[randomIndex],
      type: "ai-generated",
      category: randomTopic.charAt(0).toUpperCase() + randomTopic.slice(1),
      subcategory: randomSubcategory
        .split(" ")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      difficulty: fallbackQuestions[randomIndex].difficulty || "medium",
      points: fallbackQuestions[randomIndex].points || 100,
    };
  }
}

async function generateLesson(
  subcategory: string,
  difficulty: string,
  _prompt: string
) {
  try {
    const completion = await openrouter.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `
You are an expert investment banking instructor creating a personalized, in-depth lesson for a student preparing for technical interviews. The topic is: "${subcategory}". The difficulty level is: "${difficulty}".

The student is an entry-level analyst candidate who struggles with this topic and wants to deeply understand the concepts, mechanics, real-world applications, and common interview questions.

**IMPORTANT: For ADVANCED/HARD difficulty levels, you MUST include:**
- Complex technical mechanics and calculations
- Advanced modeling concepts and assumptions
- Sophisticated real-world scenarios with detailed numbers
- Nuanced interview questions that test deep understanding
- Industry-specific terminology and best practices
- Common modeling pitfalls and edge cases
- Advanced Excel/modeling techniques where applicable

You must return only a single valid JSON object, with NO markdown formatting, NO code blocks, and NO \`\`\`json tags. Return ONLY the raw JSON like this:

{
  "title": "string",
  "summary": "string (6-8 sentence overview)",
  "keyConcepts": [
    {
      "title": "string",
      "explanation": "string (explaining the concept in depth)",
      "example": "string (clear real-world scenario using round numbers)"
    }
  ],
  "commonMistakes": ["string", "string", "string"] (explain the mistake and why it's wrong),
  "practiceQuestions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answer": "string (must exactly match one option)",
      "explanation": "string (why it's right + why others are wrong)"
    },
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answer": "string",
      "explanation": "string"
    }
  ],
  "estimatedTime": number (in minutes, typically between 15–25)
}

**Tone and Format Guidelines:**
- Avoid fluff and filler. Be direct, clear, and specific.
- Prioritize intuition + practical relevance over dense theory.
- Use whole numbers (e.g., $100 EBITDA, 5% interest rate) in examples.
- Include 4–6 key concepts that build up understanding progressively, each one can build on the last.
- Include key details that are important to know about the topic.
- Make the practice questions representative of common interview mistakes.
- Explanations must be detailed, helpful, and refer back to key concepts.

**CRITICAL FORMATTING REQUIREMENTS:**
- Keep explanations concise and well-structured (2-4 sentences per concept)
- Use bullet points and clear paragraph breaks
- Break complex topics into digestible sections
- Use clear headings and subheadings within explanations
- Avoid wall-of-text responses - use proper spacing and structure
- Make examples concrete and easy to follow

**For ADVANCED/HARD lessons specifically:**
- Include step-by-step calculations and formulas
- Provide complex scenarios with multiple variables
- Cover advanced modeling techniques and assumptions
- Include industry-specific terminology and methodologies
- Address common modeling errors and how to avoid them
- Provide Excel formulas or modeling approaches where relevant
- **IMPORTANT:** Structure complex explanations with clear sections, bullet points, and proper spacing

Your goal is to help the user go from "I kinda get it" to "I could confidently explain this in an interview."
`,
        },
      ],
      model: "google/gemini-2.5-flash",
      temperature: 0.7,
      max_tokens: 4000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    console.log("AI Response received:", response.substring(0, 200) + "...");

    // Clean up the response to handle markdown-wrapped JSON
    let cleanedResponse = response.trim();

    // Remove markdown code blocks if present
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    cleanedResponse = cleanedResponse.trim();

    // Try to parse the JSON response
    let lessonData;
    try {
      lessonData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw response:", response);
      console.error("Cleaned response:", cleanedResponse);
      throw new Error("Invalid JSON response from AI");
    }

    return lessonData;
  } catch (error) {
    console.error("Failed to generate lesson:", error);

    // Return a fallback lesson if AI generation fails
    const fallbackLesson = {
      title: `Understanding ${subcategory} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level`,
      summary: `This comprehensive lesson covers the fundamentals of ${subcategory} in investment banking, designed specifically for entry-level analysts preparing for technical interviews. We'll break down the key concepts, common pitfalls, and real-world applications that you need to master for interview success.`,
      keyConcepts: [
        {
          title: `Core Principles of ${subcategory}`,
          explanation: `Understanding the fundamental mechanics and purpose of ${subcategory} is crucial for investment banking analysis. This concept forms the foundation for more complex financial modeling and deal evaluation.`,
          example: `When analyzing a company with $100 million in revenue, understanding ${subcategory} helps determine how this affects their valuation and financial health.`,
        },
        {
          title: `Real-World Applications`,
          explanation: `Investment bankers use ${subcategory} analysis in various scenarios including M&A deals, IPOs, and financial modeling. This practical application is what interviewers want to see you understand.`,
          example: `In a $500 million acquisition, ${subcategory} analysis helps determine the target's true value and potential synergies.`,
        },
        {
          title: `Common Interview Focus Areas`,
          explanation: `Interviewers often test your understanding of ${subcategory} through specific scenarios and calculations. Being able to walk through these step-by-step demonstrates real comprehension.`,
          example: `You might be asked to calculate how a 10% change in ${subcategory} affects a company's enterprise value of $1 billion.`,
        },
      ],
      commonMistakes: [
        `Confusing ${subcategory} with related but different concepts`,
        `Not understanding the practical implications in real deals`,
        `Focusing too much on theory without connecting to business impact`,
      ],
      practiceQuestions: [
        {
          question: `What is the primary purpose of ${subcategory} in investment banking analysis?`,
          options: [
            "To increase company debt levels",
            "To improve financial analysis and decision-making",
            "To reduce company valuation",
            "To complicate deal structures unnecessarily",
          ],
          answer: "To improve financial analysis and decision-making",
          explanation: `${subcategory} helps investment bankers better understand and analyze companies, leading to more informed decisions and better deal outcomes. The other options are incorrect because they don't reflect the analytical and decision-support nature of this concept.`,
        },
        {
          question: `When analyzing a company's ${subcategory}, what should you prioritize?`,
          options: [
            "Complex mathematical formulas",
            "Practical business implications",
            "Theoretical academic concepts",
            "Historical data only",
          ],
          answer: "Practical business implications",
          explanation: `In investment banking, the focus should always be on practical business implications rather than pure theory. This helps you make actionable recommendations and understand real-world deal dynamics.`,
        },
      ],
      estimatedTime: 20,
    };

    return fallbackLesson;
  }
}

const app = express();
const port = process.env.PORT || 3003;

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3002",
      "http://localhost:3003",
      "http://localhost:3004",
    ],
  })
);

app.get("/generate-question", async (req, res) => {
  try {
    const { difficulty, category } = req.query;
    const question = await generateQuestion(difficulty as string, category as string);
    if (!question) {
      return res
        .status(500)
        .json({ error: "No question generated or failed to parse" });
    }
    res.json(question);
  } catch (error) {
    console.error("Failed to generate question in route handler:", error);
    res.status(500).json({ error: "Failed to generate question" });
  }
});

app.post("/generate-lesson", async (req, res) => {
  try {
    const { subcategory, difficulty, prompt } = req.body;

    console.log("Lesson generation request received:", {
      subcategory,
      difficulty,
    });

    if (!subcategory || !difficulty || !prompt) {
      console.error("Missing required fields:", {
        subcategory,
        difficulty,
        prompt,
      });
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Map frontend difficulty levels to API difficulty levels
    const difficultyMapping: { [key: string]: string } = {
      beginner: "easy",
      intermediate: "medium",
      advanced: "hard",
    };

    const mappedDifficulty = difficultyMapping[difficulty] || difficulty;
    console.log("Mapped difficulty:", {
      original: difficulty,
      mapped: mappedDifficulty,
    });

    const lesson = await generateLesson(subcategory, mappedDifficulty, prompt);
    console.log("Lesson generated successfully");
    res.json(lesson);
  } catch (error) {
    console.error("Error generating lesson:", error);
    res.status(500).json({ error: "Failed to generate lesson" });
  }
});

app.post("/generate-targeted-practice", async (req, res) => {
  try {
    const { subcategory, prompt, wrongAnswers } = req.body;

    console.log("Targeted practice generation request received:", {
      subcategory,
    });

    if (!subcategory || !prompt) {
      console.error("Missing required fields:", { subcategory, prompt });
      return res.status(400).json({ error: "Missing required fields" });
    }

    const completion = await openrouter.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "google/gemini-2.5-flash",
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    console.log(
      "AI Response received for targeted practice:",
      response.substring(0, 200) + "..."
    );

    // Clean up the response to handle markdown-wrapped JSON
    let cleanedResponse = response.trim();

    // Remove markdown code blocks if present
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    cleanedResponse = cleanedResponse.trim();

    // Try to parse the JSON response
    let practiceData;
    try {
      practiceData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw response:", response);
      console.error("Cleaned response:", cleanedResponse);
      throw new Error("Invalid JSON response from AI");
    }

    console.log("Targeted practice generated successfully");
    res.json(practiceData);
  } catch (error) {
    console.error("Error generating targeted practice:", error);
    res.status(500).json({ error: "Failed to generate targeted practice" });
  }
});

app.post("/generate-analysis", async (req, res) => {
  try {
    const { subcategory, performanceData, wrongAnswers, patterns } = req.body;

    console.log("Detailed analysis generation request received:", {
      subcategory,
    });
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    if (!subcategory) {
      console.error("Missing required fields:", { subcategory });
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate and sanitize the data
    const safePerformanceData = performanceData || {};
    const safeWrongAnswers = Array.isArray(wrongAnswers) ? wrongAnswers : [];
    const safePatterns = patterns || {};

    console.log("Sanitized data:", {
      subcategory,
      performanceData: safePerformanceData,
      wrongAnswersCount: safeWrongAnswers.length,
      patterns: safePatterns,
    });

    const analysisPrompt = `Analyze the performance data for "${subcategory}" and provide detailed insights.

PERFORMANCE DATA:
- Current accuracy: ${safePerformanceData?.currentAccuracy || 0}%
- Total questions: ${safePerformanceData?.totalQuestions || 0}
- Wrong answers: ${safePatterns?.totalWrongAnswers || 0}
- Average time on wrong answers: ${safePatterns?.averageTimeOnWrongAnswers || 0} seconds
- Improvement trend: ${safePatterns?.improvementTrend || "stable"}

WRONG ANSWER PATTERNS:
${safePatterns?.commonMistakes?.map((mistake: string, index: number) => `${index + 1}. ${mistake}`).join("\n") || "No patterns detected"}

RECENT WRONG ANSWERS:
${
  safeWrongAnswers
    ?.slice(0, 5)
    .map(
      (wrong: any, index: number) =>
        `${index + 1}. Question: "${(wrong.questionText || "").substring(0, 100)}..."
     Your answer: "${wrong.userAnswer || "N/A"}"
     Correct answer: "${wrong.correctAnswer || "N/A"}"
     Time taken: ${wrong.timeTaken || 0} seconds`
    )
    .join("\n") || "No recent wrong answers"
}

Provide a comprehensive analysis in the following JSON format:
{
  "summary": "A 2-3 sentence summary of the student's performance in this area",
  "keyWeaknesses": [
    "Specific weakness 1 based on the data",
    "Specific weakness 2 based on the data",
    "Specific weakness 3 based on the data"
  ],
  "improvementStrategies": [
    "Specific strategy 1 to improve",
    "Specific strategy 2 to improve", 
    "Specific strategy 3 to improve"
  ],
  "practiceFocusAreas": [
    "Focus area 1",
    "Focus area 2",
    "Focus area 3"
  ]
}

Focus on providing actionable, specific insights based on the actual performance data. Be concise but thorough.`;

    const completion = await openrouter.chat.completions.create({
      messages: [
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      model: "google/gemini-2.5-flash",
      temperature: 0.7,
      max_tokens: 1500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    console.log(
      "AI Response received for analysis:",
      response.substring(0, 200) + "..."
    );

    // Clean up the response to handle markdown-wrapped JSON
    let cleanedResponse = response.trim();

    // Remove markdown code blocks if present
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    cleanedResponse = cleanedResponse.trim();

    // Try to parse the JSON response
    let analysisData;
    try {
      analysisData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw response:", response);
      console.error("Cleaned response:", cleanedResponse);

      // Provide a fallback response if AI fails
      analysisData = {
        summary: `Based on your performance in ${subcategory}, you have an accuracy of ${safePerformanceData?.currentAccuracy || 0}% with ${safePerformanceData?.totalQuestions || 0} questions attempted.`,
        keyWeaknesses: [
          "Need more practice in this area",
          "Focus on understanding core concepts",
          "Review fundamental principles",
        ],
        improvementStrategies: [
          "Practice more questions in this topic",
          "Review the basic concepts thoroughly",
          "Focus on understanding the underlying principles",
        ],
        practiceFocusAreas: [
          "Core concepts",
          "Basic principles",
          "Fundamental understanding",
        ],
      };

      console.log("Using fallback analysis data");
    }

    console.log("Detailed analysis generated successfully");
    res.json(analysisData);
  } catch (error) {
    console.error("Error generating detailed analysis:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).json({
      error: "Failed to generate detailed analysis",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(port, () => {
  console.log(`Quiz API listening at http://localhost:${port}`);
});
