import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { difficulty = "medium", category, subcategory } = await request.json();

    // First, get stored training data for this category/subcategory
    const trainingDataResponse = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/query/training/getTrainingData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CONVEX_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        category,
        subcategory,
      }),
    });

    let trainingContext = "";
    if (trainingDataResponse.ok) {
      const trainingData = await trainingDataResponse.json();
      if (trainingData.length > 0) {
        const latestTraining = trainingData[0]; // Most recent training data
        trainingContext = `
        
        Based on the following training data for ${category}${subcategory ? ` - ${subcategory}` : ''}:
        
        Key Concepts: ${latestTraining.keyConcepts.join(', ')}
        Important Formulas: ${latestTraining.formulas.join(', ')}
        Common Interview Questions: ${latestTraining.interviewQuestions.join(', ')}
        Best Practices: ${latestTraining.bestPractices.join(', ')}
        Potential Pitfalls: ${latestTraining.pitfalls.join(', ')}
        
        Please use this knowledge to generate a more accurate and relevant question.
        `;
      }
    }

    // Generate question using the training data
    const prompt = `Generate a ${difficulty} difficulty investment banking interview question about ${category}${subcategory ? ` specifically focusing on ${subcategory}` : ''}.

${trainingContext}

The question should:
1. Be specific to investment banking interviews
2. Test practical knowledge and application
3. Include 4 multiple choice options (A, B, C, D)
4. Have a clear, correct answer
5. Include a detailed explanation of why the answer is correct
6. Be appropriate for ${difficulty} level

Please format the response as JSON:
{
  "question": "The question text",
  "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
  "answer": "The correct option letter",
  "explanation": "Detailed explanation of the answer"
}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://investiq.com",
        "X-Title": "InvestIQ Enhanced Question Generation"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert investment banking interviewer. Generate high-quality, practical questions that test real-world knowledge and application."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`AI service responded with status: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;

    // Parse the JSON response
    let questionData;
    try {
      questionData = JSON.parse(content);
    } catch (error) {
      // Fallback if JSON parsing fails
      questionData = {
        question: "Error parsing AI response",
        options: ["A. Error", "B. Error", "C. Error", "D. Error"],
        answer: "A",
        explanation: "There was an error generating this question."
      };
    }

    return NextResponse.json({
      success: true,
      question: questionData.question,
      options: questionData.options,
      answer: questionData.answer,
      explanation: questionData.explanation,
      category,
      subcategory,
      difficulty,
      usedTrainingData: trainingContext.length > 0
    });

  } catch (error) {
    console.error("Error generating enhanced question:", error);
    return NextResponse.json(
      { error: "Failed to generate enhanced question" },
      { status: 500 }
    );
  }
} 