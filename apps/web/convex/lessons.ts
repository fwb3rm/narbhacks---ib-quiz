import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { action, internalMutation, mutation, query } from "./_generated/server";

// Generate a lesson using AI
export const generateLesson = action({
  args: {
    subcategory: v.string(),
    difficulty: v.string(),
  },
  returns: v.object({
    title: v.string(),
    summary: v.string(),
    keyConcepts: v.array(
      v.object({
        title: v.string(),
        explanation: v.string(),
        example: v.string(),
      })
    ),
    commonMistakes: v.array(v.string()),
    practiceQuestions: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        answer: v.string(),
        explanation: v.string(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const openai = new (await import("openai")).default({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const prompt = `You are an expert investment banking instructor creating a comprehensive lesson for a student preparing for technical interviews. The topic is: "${args.subcategory}". The difficulty level is: "${args.difficulty}".

**CRITICAL: Focus ONLY on content that is commonly asked in real IB interviews. Every concept, example, and practice question should be interview-relevant.**

**Content Requirements:**
- Create a comprehensive lesson with 4-6 key concepts that are COMMONLY ASKED IN IB INTERVIEWS
- Include detailed explanations with real-world examples that interviewers actually use
- Provide step-by-step calculations where applicable (interviewers love to see your work)
- Include common mistakes that candidates make in interviews and how to avoid them
- Create 3 practice questions that mirror actual interview questions
- Use specific numbers and realistic scenarios that interviewers present
- Focus on concepts that separate strong candidates from weak ones in interviews

**CRITICAL FORMATTING RULES:**
- DO NOT use markdown code blocks
- DO NOT add any text before or after the JSON
- DO NOT use backticks or any markdown formatting
- Return ONLY the raw JSON object
- Start with { and end with }
- No extra characters, no formatting, just pure JSON

Return the response as a JSON object with this exact structure:
{
  "title": "Lesson title",
  "summary": "Brief summary of the lesson",
  "keyConcepts": [
    {
      "title": "Concept title",
      "explanation": "This is the first paragraph of the explanation.\\n\\nThis is the second paragraph with proper line breaks.\\n\\n* This is a bullet point\\n* This is another bullet point\\n\\nThis is the final paragraph.",
      "example": "Real-world example with numbers and proper formatting"
    }
  ],
  "commonMistakes": [
    "Common mistake 1",
    "Common mistake 2",
    "Common mistake 3"
  ],
  "practiceQuestions": [
    {
      "question": "Question text",
      "options": ["First option text", "Second option text", "Third option text", "Fourth option text"],
      "answer": "Correct answer text (without letter)",
      "explanation": "This explanation uses proper formatting.\\n\\n* First point with bullet\\n* Second point with bullet\\n\\nFinal paragraph with conclusion."
    }
  ]
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a JSON-only response generator. NEVER use markdown formatting, code blocks, or any text outside the JSON object. Return ONLY raw JSON starting with { and ending with }." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: args.difficulty === "easy" ? 4000 : 8000, // Shorter for beginner, longer for expert
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No content in response from AI");
      }

      // Check if response is too short (likely truncated)
      if (content.length < 100) {
        console.error("Response too short, likely truncated:", content);
        throw new Error("AI response was truncated - please try again");
      }

      console.log("AI Response length:", content.length);
      console.log("AI Response preview:", content.substring(0, 200) + "...");

      // Try to parse the JSON response
      let lessonData;
      try {
        lessonData = JSON.parse(content);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Raw content:", content);
        
        // Try to extract JSON from markdown code blocks or other formatting
        let jsonContent = content;
        
        // Remove markdown code blocks - handle both ```json and ``` formats
        jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Try to find JSON object between curly braces
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }
        
        // Clean up the JSON content
        // Remove any leading/trailing whitespace
        jsonContent = jsonContent.trim();
        
        // Handle escaped quotes properly - the AI sometimes returns double-escaped quotes
        // First, try to unescape the quotes - handle both \" and \\" patterns
        jsonContent = jsonContent.replace(/\\"/g, '"');
        jsonContent = jsonContent.replace(/\\\\"/g, '"');
        
        // Additional cleaning for common AI response issues
        // Remove any remaining backticks or markdown artifacts
        jsonContent = jsonContent.replace(/`/g, '');
        jsonContent = jsonContent.replace(/^\s*```\s*/, ''); // Remove leading ```
        jsonContent = jsonContent.replace(/\s*```\s*$/, ''); // Remove trailing ```
        
        // Try to fix common JSON issues
        // Remove trailing commas before closing braces/brackets
        jsonContent = jsonContent.replace(/,(\s*[}\]])/g, '$1');
        
        // Fix common JSON syntax errors
        jsonContent = jsonContent.replace(/,\s*}/g, '}'); // Remove trailing commas in objects
        jsonContent = jsonContent.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
        
        try {
          lessonData = JSON.parse(jsonContent);
          console.log("Successfully extracted JSON from formatted response");
        } catch (secondParseError) {
          console.error("Second JSON Parse Error:", secondParseError);
          console.error("Cleaned content:", jsonContent);
          
          // Try a more aggressive approach - find the JSON structure
          try {
            // Look for the complete JSON structure with all required fields
            const completeJsonMatch = jsonContent.match(/\{[\s\S]*"title"[\s\S]*"summary"[\s\S]*"keyConcepts"[\s\S]*"commonMistakes"[\s\S]*"practiceQuestions"[\s\S]*\}/);
            if (completeJsonMatch) {
              lessonData = JSON.parse(completeJsonMatch[0]);
              console.log("Successfully extracted complete JSON from response");
            } else {
              // Try to find just the basic structure
              const basicMatch = jsonContent.match(/\{[\s\S]*"title"[\s\S]*"summary"[\s\S]*\}/);
              if (basicMatch) {
                lessonData = JSON.parse(basicMatch[0]);
                console.log("Successfully extracted basic JSON structure");
              } else {
                // Last resort: try to extract JSON by finding the largest valid JSON object
                const jsonObjects = [];
                let braceCount = 0;
                let startIndex = -1;
                
                for (let i = 0; i < jsonContent.length; i++) {
                  if (jsonContent[i] === '{') {
                    if (braceCount === 0) {
                      startIndex = i;
                    }
                    braceCount++;
                  } else if (jsonContent[i] === '}') {
                    braceCount--;
                    if (braceCount === 0 && startIndex !== -1) {
                      const potentialJson = jsonContent.substring(startIndex, i + 1);
                      try {
                        const parsed = JSON.parse(potentialJson);
                        if (parsed.title && parsed.summary) {
                          jsonObjects.push(parsed);
                        }
                      } catch (e) {
                        // Ignore invalid JSON objects
                      }
                    }
                  }
                }
                
                if (jsonObjects.length > 0) {
                  // Use the largest JSON object (most complete)
                  lessonData = jsonObjects.reduce((largest, current) => 
                    JSON.stringify(current).length > JSON.stringify(largest).length ? current : largest
                  );
                  console.log("Successfully extracted JSON using fallback method");
                } else {
                  throw new Error("Could not find complete JSON structure");
                }
              }
            }
          } catch (finalParseError) {
            console.error("Final JSON Parse Error:", finalParseError);
            console.error("Raw content that failed all parsing attempts:", content);
            
            // Try to create a minimal valid lesson structure as fallback
            try {
              lessonData = {
                title: `Lesson on ${args.subcategory}`,
                summary: `A comprehensive lesson on ${args.subcategory} for ${args.difficulty} level.`,
                keyConcepts: [
                  {
                    title: "Key Concept 1",
                    explanation: "This concept will be covered in detail.",
                    example: "Example will be provided."
                  }
                ],
                commonMistakes: [
                  "Common mistake 1",
                  "Common mistake 2", 
                  "Common mistake 3"
                ],
                practiceQuestions: [
                  {
                    question: "Sample question about " + args.subcategory,
                    options: ["Option A", "Option B", "Option C", "Option D"],
                    answer: "Option A",
                    explanation: "This is a sample explanation."
                  }
                ]
              };
              console.log("Created fallback lesson structure due to parsing failure");
            } catch (fallbackError) {
              throw new Error("Invalid JSON response from AI - could not extract valid JSON or create fallback");
            }
          }
        }
      }

      // Validate the lesson data structure
      if (!lessonData.title || !lessonData.summary || !lessonData.keyConcepts || !lessonData.commonMistakes || !lessonData.practiceQuestions) {
        console.error("Invalid lesson data structure:", lessonData);
        throw new Error("Invalid lesson data structure from AI");
      }

      // Extract title and create content object without title
      const { title, ...contentWithoutTitle } = lessonData;

      // Save the lesson to the database
      const lessonId = await ctx.runMutation(
        internal.lessons.saveGeneratedLesson,
        {
          title: title,
          subcategory: args.subcategory,
          difficulty: args.difficulty,
          content: contentWithoutTitle,
          createdAt: Date.now(),
        }
      );

      return lessonData;
    } catch (error) {
      console.error("Error generating lesson:", error);
      console.error("Subcategory:", args.subcategory);
      console.error("Difficulty:", args.difficulty);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to generate lesson: ${errorMessage}`);
    }
  },
});

// Generate a personalized lesson based on user mistakes
export const generatePersonalizedLesson = action({
  args: {
    subcategory: v.string(),
    difficulty: v.string(),
  },
  returns: v.object({
    title: v.string(),
    summary: v.string(),
    keyConcepts: v.array(
      v.object({
        title: v.string(),
        explanation: v.string(),
        example: v.string(),
      })
    ),
    commonMistakes: v.array(v.string()),
    practiceQuestions: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        answer: v.string(),
        explanation: v.string(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    console.log("=== PERSONALIZED LESSON GENERATION STARTED ===");
    console.log("Subcategory:", args.subcategory);
    console.log("Difficulty:", args.difficulty);
    
    const openai = new (await import("openai")).default({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    // Get user's quiz results to analyze mistakes
    const quizResults = await ctx.runQuery(api.quiz.getAllQuizResults);
    console.log("=== QUIZ DATA ANALYSIS ===");
    console.log("Total quiz results found:", quizResults.length);
    
    // Add a temporary debug throw to see the data
    if (quizResults.length === 0) {
      console.log("NO QUIZ DATA FOUND - USING FALLBACK");
    } else {
      console.log("QUIZ DATA FOUND - ANALYZING MISTAKES");
      console.log("Quiz results sample:", quizResults.slice(0, 2));
    }

    // Filter results for the specific subcategory and get recent mistakes
    const relevantResults = quizResults.filter((result: any) => 
      result.questions.some((q: any) => q.subcategory === args.subcategory)
    );
    console.log("Relevant results for subcategory", args.subcategory + ":", relevantResults.length);

    // Extract mistakes from the last 10 quizzes for this subcategory
    const recentMistakes = relevantResults
      .slice(0, 10)
      .flatMap((result: any) => 
        result.questions
          .filter((q: any) => q.subcategory === args.subcategory && !q.isCorrect)
          .map((q: any) => ({
            question: q.question,
            userAnswer: q.userAnswer,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            date: result.date
          }))
      );
    console.log("Recent mistakes found:", recentMistakes.length);
    console.log("Sample mistakes:", recentMistakes.slice(0, 2));

    // Analyze common mistake patterns
    const mistakeAnalysis = analyzeMistakePatterns(recentMistakes, args.subcategory);
    console.log("Mistake analysis:", mistakeAnalysis);

    // If no quiz data is available, provide a fallback
    if (quizResults.length === 0) {
      console.log("No quiz results found - creating general lesson");
      const fallbackPrompt = `You are an expert investment banking instructor creating a lesson for a student preparing for technical interviews. The topic is: "${args.subcategory}". The difficulty level is: "${args.difficulty}".

Since this is the student's first lesson on this topic, create a comprehensive introduction that covers the fundamentals.

**CRITICAL: Focus ONLY on content that is commonly asked in real IB interviews. Every concept, example, and practice question should be interview-relevant.**

**Content Requirements:**
- Create a comprehensive lesson with 4-6 key concepts that are COMMONLY ASKED IN IB INTERVIEWS
- Include detailed explanations with real-world examples that interviewers actually use
- Provide step-by-step calculations where applicable (interviewers love to see your work)
- Include common mistakes that candidates make in interviews and how to avoid them
- Create 3 practice questions that mirror actual interview questions
- Use specific numbers and realistic scenarios that interviewers present
- Focus on concepts that separate strong candidates from weak ones in interviews

**CRITICAL FORMATTING RULES:**
- DO NOT use markdown code blocks
- DO NOT add any text before or after the JSON
- DO NOT use backticks or any markdown formatting
- Return ONLY the raw JSON object
- Start with { and end with }
- No extra characters, no formatting, just pure JSON

Return the response as a JSON object with this exact structure:
{
  "title": "Lesson title",
  "summary": "Brief summary of the lesson",
  "keyConcepts": [
    {
      "title": "Concept title",
      "explanation": "This is the first paragraph of the explanation.\\n\\nThis is the second paragraph with proper line breaks.\\n\\n* This is a bullet point\\n* This is another bullet point\\n\\nThis is the final paragraph.",
      "example": "Real-world example with numbers and proper formatting"
    }
  ],
  "commonMistakes": [
    "Common mistake 1",
    "Common mistake 2",
    "Common mistake 3"
  ],
  "practiceQuestions": [
    {
      "question": "Question text",
      "options": ["First option text", "Second option text", "Third option text", "Fourth option text"],
      "answer": "Correct answer text (without letter)",
      "explanation": "This explanation uses proper formatting.\\n\\n* First point with bullet\\n* Second point with bullet\\n\\nFinal paragraph with conclusion."
    }
  ]
}`;

      try {
        const completion = await openai.chat.completions.create({
          model: "google/gemini-2.5-flash",
          messages: [
            { 
              role: "system", 
              content: "You are a JSON-only response generator. NEVER use markdown formatting, code blocks, or any text outside the JSON object. Return ONLY raw JSON starting with { and ending with }." 
            },
            { role: "user", content: fallbackPrompt }
          ],
          temperature: 0.7,
          max_tokens: args.difficulty === "easy" ? 4000 : 8000,
        });

        const content = completion.choices[0].message.content;
        if (!content) {
          throw new Error("No content in response from AI");
        }

        console.log("AI Response length:", content.length);
        console.log("AI Response preview:", content.substring(0, 200) + "...");

        // Parse the response (same logic as below)
        let lessonData;
        try {
          lessonData = JSON.parse(content);
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          // Create fallback lesson structure
          lessonData = {
            title: `General Introduction to ${args.subcategory} (No Quiz Data Available)`,
            summary: `A comprehensive introduction to ${args.subcategory} for ${args.difficulty} level. Take some quizzes first to get personalized lessons!`,
            keyConcepts: [
              {
                title: "Key Concept 1",
                explanation: "This concept will be covered in detail.",
                example: "Example will be provided."
              }
            ],
            commonMistakes: [
              "Common mistake 1",
              "Common mistake 2", 
              "Common mistake 3"
            ],
            practiceQuestions: [
              {
                question: "Sample question about " + args.subcategory,
                options: ["Option A", "Option B", "Option C", "Option D"],
                answer: "Option A",
                explanation: "This is a sample explanation."
              }
            ]
          };
        }

        // Validate and save the lesson
        if (!lessonData.title || !lessonData.summary || !lessonData.keyConcepts || !lessonData.commonMistakes || !lessonData.practiceQuestions) {
          throw new Error("Invalid lesson data structure from AI");
        }

        const { title, ...contentWithoutTitle } = lessonData;
        const lessonId = await ctx.runMutation(
          internal.lessons.saveGeneratedLesson,
          {
            title: title,
            subcategory: args.subcategory,
            difficulty: args.difficulty,
            content: contentWithoutTitle,
            createdAt: Date.now(),
          }
        );

        return lessonData;
      } catch (error) {
        console.error("Error generating fallback lesson:", error);
        throw new Error(`Failed to generate lesson: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    const prompt = `You are an expert investment banking instructor creating a personalized, in-depth lesson for a student preparing for technical interviews. The topic is: "${args.subcategory}". The difficulty level is: "${args.difficulty}".

The student has been struggling with this topic and has made several mistakes in recent quizzes. Based on their performance, create a lesson that specifically addresses their weak areas.

**STUDENT'S RECENT MISTAKES ANALYSIS:**
${mistakeAnalysis.summary}

**COMMON MISTAKE PATTERNS IDENTIFIED:**
${mistakeAnalysis.patterns.map(pattern => `- ${pattern}`).join('\n')}

**SPECIFIC MISTAKES TO ADDRESS:**
${recentMistakes.slice(0, 5).map(mistake => 
  `- Question: "${mistake.question}"
   - Student's Answer: "${mistake.userAnswer}"
   - Correct Answer: "${mistake.correctAnswer}"
   - Explanation: "${mistake.explanation}"`
).join('\n\n')}

**CRITICAL: Focus ONLY on content that is commonly asked in real IB interviews. Every concept, example, and practice question should be interview-relevant.**

**PERSONALIZATION REQUIREMENTS:**
- Create explanations that directly address the student's specific mistakes
- Use examples that mirror the types of questions they got wrong
- Include step-by-step breakdowns of concepts they struggled with
- Provide clear explanations of why their answers were incorrect
- Focus on the underlying concepts they need to strengthen

**IMPORTANT: For ADVANCED/HARD difficulty levels, you MUST include:**
- Complex technical mechanics and calculations
- Sophisticated real-world scenarios with detailed numbers
- Industry-specific terminology and best practices
- Step-by-step calculations and formulas
- Complex scenarios with multiple variables
- Advanced modeling techniques and assumptions
- Common modeling errors and Excel approaches

**Content Requirements:**
- Create a comprehensive lesson with 4-6 key concepts that are COMMONLY ASKED IN IB INTERVIEWS
- Include detailed explanations with real-world examples that interviewers actually use
- Provide step-by-step calculations where applicable (interviewers love to see your work)
- Include common mistakes that candidates make in interviews and how to avoid them
- Create 3 practice questions that mirror actual interview questions
- Use specific numbers and realistic scenarios that interviewers present
- Focus on concepts that separate strong candidates from weak ones in interviews

**Tone and Format Guidelines:**
- Avoid fluff and filler. Be direct, clear, and specific.
- Prioritize intuition + practical relevance over dense theory.
- Use whole numbers (e.g., $100 EBITDA, 5% interest rate) in examples.
- Include 4–6 key concepts that build up understanding progressively, each one can build on the last.
- Include key details that are important to know about the topic.

**INTERVIEW FOCUS: Every concept should be something an interviewer would ask about. Examples of interview-style questions:**
- "Walk me through the 3 statements when..."
- "What happens to the balance sheet when..."
- "How would you value this company?"
- "What's the impact on cash flow if..."
- "Explain the mechanics of..."
        - Make the three practice questions representative of common interview mistakes.
        - **IMPORTANT: Include at least 3 common mistakes in the commonMistakes array.**
        - **INTERVIEW MISTAKES: Focus on mistakes that candidates commonly make in interviews, such as:**
          - Confusing cash flow vs. accounting treatment
          - Mixing up debt vs. equity impact
          - Forgetting to consider tax effects
          - Not understanding the mechanics behind formulas
          - Failing to explain the "why" behind calculations
        - **PRACTICE QUESTIONS: The options array should contain only the answer text (e.g., "$500", "Net Income increases"), NOT the letter options (A, B, C, D). The answer field should contain the full correct answer text. DO NOT include any additional fields like "isCorrect" in the practice questions.**
        - Explanations must be detailed, helpful, and refer back to key concepts.
        - **IMPORTANT: Provide ${args.difficulty === "easy" ? "concise, beginner-friendly explanations (2-3 sentences per concept)" : "detailed, comprehensive explanations with thorough coverage. Keep each explanation under 500 words to avoid JSON truncation."}**
        - **FORMATTING: Use proper line breaks and structure. Separate paragraphs with double line breaks. Use bullet points and clear sections.**
        - **CRITICAL FORMATTING: Each explanation must be properly formatted with clear paragraphs. Use double line breaks between paragraphs. Use bullet points (*) for lists. Do NOT create long unformatted text blocks.**
        - **AVOID UNFORMATTED BLOCKS: Never create long paragraphs without proper breaks. Always use bullet points for lists and double line breaks between paragraphs.**
        - **LENGTH LIMITS: Each explanation should be under 500 words. Each practice question explanation should be under 300 words.**
        
        **CRITICAL JSON FORMATTING REQUIREMENTS:**
        - **DO NOT use markdown code blocks**
        - **DO NOT add any text before or after the JSON object**
        - **DO NOT use backticks or any markdown formatting**
        - **Return ONLY the raw JSON object**
        - **Start with { and end with }**
        - **No extra characters, no formatting, just pure JSON**
        - **The response must be parseable JSON**
        - **Do NOT include any fields not specified in the structure below**
        - **IMPORTANT: Return ONLY the JSON object, no markdown, no code blocks, no extra text**
        - **CRITICAL: You MUST respond with ONLY valid JSON. Do not include any text before or after the JSON object. Do not use markdown formatting. The response must be parseable JSON. Do NOT include any fields not specified in the structure below.**
        - **FINAL WARNING: Return ONLY the JSON object, no markdown, no code blocks, no extra text. Start with { and end with }.**
        
        Return the response as a JSON object with this exact structure:
{
  "title": "Personalized Lesson title",
  "summary": "Brief summary of the lesson addressing the student's specific mistakes",
  "keyConcepts": [
    {
      "title": "Concept title",
      "explanation": "This is the first paragraph of the explanation.\\n\\nThis is the second paragraph with proper line breaks.\\n\\n* This is a bullet point\\n* This is another bullet point\\n\\nThis is the final paragraph.",
      "example": "Real-world example with numbers and proper formatting"
    }
  ],
  "commonMistakes": [
    "Common mistake 1",
    "Common mistake 2",
    "Common mistake 3"
  ],
  "practiceQuestions": [
    {
      "question": "Question text",
      "options": ["First option text", "Second option text", "Third option text", "Fourth option text"],
      "answer": "Correct answer text (without letter)",
      "explanation": "This explanation uses proper formatting.\\n\\n* First point with bullet\\n* Second point with bullet\\n\\nFinal paragraph with conclusion."
    }
  ]
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a JSON-only response generator. NEVER use markdown formatting, code blocks, or any text outside the JSON object. Return ONLY raw JSON starting with { and ending with }." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: args.difficulty === "easy" ? 4000 : 8000,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No content in response from AI");
      }

      // Check if response is too short (likely truncated)
      if (content.length < 100) {
        console.error("Response too short, likely truncated:", content);
        throw new Error("AI response was truncated - please try again");
      }

      console.log("AI Response length:", content.length);
      console.log("AI Response preview:", content.substring(0, 200) + "...");

      // Try to parse the JSON response
      let lessonData;
      try {
        lessonData = JSON.parse(content);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Raw content:", content);
        
        // Try to extract JSON from markdown code blocks or other formatting
        let jsonContent = content;
        
        // Remove markdown code blocks - handle both ```json and ``` formats
        jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Try to find JSON object between curly braces
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }
        
        // Clean up the JSON content
        // Remove any leading/trailing whitespace
        jsonContent = jsonContent.trim();
        
        // Handle escaped quotes properly - the AI sometimes returns double-escaped quotes
        // First, try to unescape the quotes - handle both \" and \\" patterns
        jsonContent = jsonContent.replace(/\\"/g, '"');
        jsonContent = jsonContent.replace(/\\\\"/g, '"');
        
        // Additional cleaning for common AI response issues
        // Remove any remaining backticks or markdown artifacts
        jsonContent = jsonContent.replace(/`/g, '');
        jsonContent = jsonContent.replace(/^\s*```\s*/, ''); // Remove leading ```
        jsonContent = jsonContent.replace(/\s*```\s*$/, ''); // Remove trailing ```
        
        // Try to fix common JSON issues
        // Remove trailing commas before closing braces/brackets
        jsonContent = jsonContent.replace(/,(\s*[}\]])/g, '$1');
        
        // Fix common JSON syntax errors
        jsonContent = jsonContent.replace(/,\s*}/g, '}'); // Remove trailing commas in objects
        jsonContent = jsonContent.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
        
        try {
          lessonData = JSON.parse(jsonContent);
          console.log("Successfully extracted JSON from formatted response");
        } catch (secondParseError) {
          console.error("Second JSON Parse Error:", secondParseError);
          console.error("Cleaned content:", jsonContent);
          
          // Try a more aggressive approach - find the JSON structure
          try {
            // Look for the complete JSON structure
            const completeJsonMatch = jsonContent.match(/\{[\s\S]*"practiceQuestions":\s*\[[\s\S]*?\][\s\S]*?\}/);
            if (completeJsonMatch) {
              lessonData = JSON.parse(completeJsonMatch[0]);
              console.log("Successfully extracted complete JSON from response");
            } else {
              // Try to find just the basic structure
              const basicMatch = jsonContent.match(/\{[\s\S]*"title"[\s\S]*"summary"[\s\S]*\}/);
              if (basicMatch) {
                lessonData = JSON.parse(basicMatch[0]);
                console.log("Successfully extracted basic JSON structure");
              } else {
                throw new Error("Could not find complete JSON structure");
              }
            }
          } catch (finalParseError) {
            console.error("Final JSON Parse Error:", finalParseError);
            console.error("Raw content that failed all parsing attempts:", content);
            
            // Try to create a minimal valid lesson structure as fallback
            try {
              lessonData = {
                title: `Personalized Lesson on ${args.subcategory} (Based on Your Mistakes)`,
                summary: `A personalized lesson on ${args.subcategory} for ${args.difficulty} level based on your quiz performance.`,
                keyConcepts: [
                  {
                    title: "Key Concept 1",
                    explanation: "This concept will be covered in detail.",
                    example: "Example will be provided."
                  }
                ],
                commonMistakes: [
                  "Common mistake 1",
                  "Common mistake 2", 
                  "Common mistake 3"
                ],
                practiceQuestions: [
                  {
                    question: "Sample question about " + args.subcategory,
                    options: ["Option A", "Option B", "Option C", "Option D"],
                    answer: "Option A",
                    explanation: "This is a sample explanation."
                  }
                ]
              };
              console.log("Created fallback lesson structure due to parsing failure");
            } catch (fallbackError) {
              throw new Error("Invalid JSON response from AI - could not extract valid JSON or create fallback");
            }
          }
        }
      }

      // Validate the lesson data structure
      if (!lessonData.title || !lessonData.summary || !lessonData.keyConcepts || !lessonData.commonMistakes || !lessonData.practiceQuestions) {
        console.error("Invalid lesson data structure:", lessonData);
        throw new Error("Invalid lesson data structure from AI");
      }

      // Extract title and create content object without title
      const { title, ...contentWithoutTitle } = lessonData;

      // Save the lesson to the database
      console.log("=== ABOUT TO SAVE LESSON ===");
      console.log("Lesson title:", title);
      console.log("Lesson subcategory:", args.subcategory);
      console.log("Lesson difficulty:", args.difficulty);
      
      const lessonId = await ctx.runMutation(
        internal.lessons.saveGeneratedLesson,
        {
          title: title,
          subcategory: args.subcategory,
          difficulty: args.difficulty,
          content: contentWithoutTitle,
          createdAt: Date.now(),
        }
      );
      
      console.log("Lesson saved with ID:", lessonId);

      return lessonData;
    } catch (error) {
      console.error("Error generating personalized lesson:", error);
      console.error("Subcategory:", args.subcategory);
      console.error("Difficulty:", args.difficulty);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to generate personalized lesson: ${errorMessage}`);
    }
  },
});

// Helper function to analyze mistake patterns
function analyzeMistakePatterns(mistakes: Array<{
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  date: string;
}>, subcategory: string) {
  if (mistakes.length === 0) {
    return {
      summary: "No recent mistakes found for this topic. Creating a general lesson.",
      patterns: ["No specific patterns identified"]
    };
  }

  // Analyze patterns in mistakes
  const patterns = [];
  
  // Check for calculation errors
  const calculationErrors = mistakes.filter((mistake: any) => 
    mistake.explanation.toLowerCase().includes('calculation') || 
    mistake.explanation.toLowerCase().includes('formula') ||
    mistake.explanation.toLowerCase().includes('math')
  );
  if (calculationErrors.length > 0) {
    patterns.push(`Struggles with calculations and formulas (${calculationErrors.length} mistakes)`);
  }

  // Check for conceptual misunderstandings
  const conceptualErrors = mistakes.filter((mistake: any) => 
    mistake.explanation.toLowerCase().includes('concept') || 
    mistake.explanation.toLowerCase().includes('understanding') ||
    mistake.explanation.toLowerCase().includes('fundamental')
  );
  if (conceptualErrors.length > 0) {
    patterns.push(`Has conceptual misunderstandings (${conceptualErrors.length} mistakes)`);
  }

  // Check for terminology confusion
  const terminologyErrors = mistakes.filter((mistake: any) => 
    mistake.explanation.toLowerCase().includes('terminology') || 
    mistake.explanation.toLowerCase().includes('definition') ||
    mistake.explanation.toLowerCase().includes('term')
  );
  if (terminologyErrors.length > 0) {
    patterns.push(`Confuses terminology and definitions (${terminologyErrors.length} mistakes)`);
  }

  // Check for application errors
  const applicationErrors = mistakes.filter((mistake: any) => 
    mistake.explanation.toLowerCase().includes('application') || 
    mistake.explanation.toLowerCase().includes('scenario') ||
    mistake.explanation.toLowerCase().includes('real-world')
  );
  if (applicationErrors.length > 0) {
    patterns.push(`Struggles with real-world applications (${applicationErrors.length} mistakes)`);
  }

  if (patterns.length === 0) {
    patterns.push("General knowledge gaps identified");
  }

  const summary = `The student has made ${mistakes.length} mistakes in recent quizzes on ${subcategory}. 
  Most common issues: ${patterns.slice(0, 3).join(', ')}. 
  Focus on addressing these specific weaknesses.`;

  return { summary, patterns };
}

// Validate lesson generation parameters before actually generating
export const validateLessonGeneration = query({
  args: {
    subcategory: v.string(),
    difficulty: v.string(),
  },
  returns: v.object({
    isValid: v.boolean(),
    issues: v.array(v.string()),
    estimatedTokens: v.number(),
    estimatedCost: v.number(),
  }),
  handler: async (ctx, args) => {
    const issues: string[] = [];
    let isValid = true;
    
    // Check if subcategory is valid
    const validSubcategories = [
      "Income Statement Breakdown", "Balance Sheet Breakdown", "Cash Flow Statement Breakdown",
      "3-Statement Linkages", "Accrual vs Cash Accounting", "Depreciation & Amortization",
      "Working Capital", "Inventory Methods (FIFO, LIFO)", "Lease Accounting (Operating vs Capital)",
      "Deferred Taxes", "Stock-Based Compensation", "Asset Write-Downs & Impairments",
      "Shareholders' Equity & Retained Earnings", "Prepaid vs Accrued Expenses",
      "Interest Expense", "Accounting for Debt Issuance", "DCF Analysis",
      "Comparable Company Analysis", "Precedent Transactions", "WACC Calculation",
      "Beta Estimation", "Terminal Value", "Multiples Analysis (EV/EBITDA, P/E, etc.)",
      "Enterprise Value vs Equity Value", "Dilution Impact", "Sensitivity Analysis",
      "Calendarization & LTM Adjustments", "Sum-of-the-Parts (SOTP) Valuation",
      "Adjusting Comparables", "Equity Value Bridges", "Control Premiums & Discounts"
    ];
    
    if (!validSubcategories.includes(args.subcategory)) {
      issues.push(`Invalid subcategory: ${args.subcategory}`);
      isValid = false;
    }
    
    // Check if difficulty is valid
    if (!["easy", "hard"].includes(args.difficulty)) {
      issues.push(`Invalid difficulty: ${args.difficulty}`);
      isValid = false;
    }
    
    // Estimate token usage
    const basePromptTokens = 1500; // Approximate base prompt size
    const difficultyMultiplier = args.difficulty === "easy" ? 1 : 2;
    const estimatedTokens = basePromptTokens * difficultyMultiplier;
    
    // Estimate cost (using Gemini 2.5 Flash pricing)
    const inputCostPer1K = 0.000075;
    const outputCostPer1K = 0.0003;
    const estimatedInputCost = (estimatedTokens * inputCostPer1K) / 1000;
    const estimatedOutputCost = (estimatedTokens * 0.2 * outputCostPer1K) / 1000; // Assume 20% output ratio
    const estimatedCost = estimatedInputCost + estimatedOutputCost;
    
    return {
      isValid,
      issues,
      estimatedTokens,
      estimatedCost,
    };
  },
});

// Save generated lesson to database
export const saveGeneratedLesson = internalMutation({
  args: {
    title: v.string(),
    subcategory: v.string(),
    difficulty: v.string(),
    content: v.object({
      summary: v.string(),
      keyConcepts: v.array(
        v.object({
          title: v.string(),
          explanation: v.string(),
          example: v.string(),
        })
      ),
      commonMistakes: v.array(v.string()),
      practiceQuestions: v.array(
        v.object({
          question: v.string(),
          options: v.array(v.string()),
          answer: v.string(),
          explanation: v.string(),
        })
      ),
    }),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    console.log("=== SAVING LESSON TO DATABASE ===");
    console.log("Title:", args.title);
    console.log("Subcategory:", args.subcategory);
    console.log("Difficulty:", args.difficulty);
    console.log("Content keys:", Object.keys(args.content));
    
    try {
      const lessonId = await ctx.db.insert("lessons", {
        userId: undefined, // Will be updated when we add user authentication
        ...args,
      });
      console.log("Lesson saved successfully with ID:", lessonId);
      return lessonId;
    } catch (error) {
      console.error("Error saving lesson to database:", error);
      throw error;
    }
  },
});

// Get all lessons
export const getAllLessons = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("lessons").order("desc").collect();
  },
});

// Get lessons by subcategory
export const getLessonsBySubcategory = query({
  args: { subcategory: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_subcategory", (q) => q.eq("subcategory", args.subcategory))
      .order("desc")
      .collect();
  },
});

// Get a specific lesson by ID
export const getLessonById = query({
  args: { lessonId: v.id("lessons") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lessonId);
  },
});
