import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { extractedText, category, subcategory } = await request.json();

    if (!extractedText) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Send the extracted text to your AI service for training
    const trainingPrompt = `
    Please analyze the following IB interview material and extract key concepts, formulas, and important information:

    Category: ${category || 'General IB'}
    Subcategory: ${subcategory || 'Interview Preparation'}
    
    Content:
    ${extractedText}

    Please provide:
    1. Key concepts and definitions
    2. Important formulas and calculations
    3. Common interview questions related to this material
    4. Best practices and tips
    5. Potential pitfalls to avoid
    `;

    // Call your existing AI service (OpenRouter/OpenAI)
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://investiq.com",
        "X-Title": "InvestIQ AI Training"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert investment banking trainer. Analyze the provided material and extract the most important information for IB interviews."
          },
          {
            role: "user",
            content: trainingPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`AI service responded with status: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analyzedContent = aiResponse.choices[0].message.content;

    // Parse the AI response to extract structured data
    const lines = analyzedContent.split('\n');
    const keyConcepts: string[] = [];
    const formulas: string[] = [];
    const interviewQuestions: string[] = [];
    const bestPractices: string[] = [];
    const pitfalls: string[] = [];

    let currentSection = '';
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.includes('Key concepts')) currentSection = 'concepts';
      else if (trimmedLine.includes('Important formulas')) currentSection = 'formulas';
      else if (trimmedLine.includes('Common interview questions')) currentSection = 'questions';
      else if (trimmedLine.includes('Best practices')) currentSection = 'practices';
      else if (trimmedLine.includes('Potential pitfalls')) currentSection = 'pitfalls';
      else if (trimmedLine && trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        const item = trimmedLine.replace(/^[•-]\s*/, '').trim();
        if (item) {
          switch (currentSection) {
            case 'concepts': keyConcepts.push(item); break;
            case 'formulas': formulas.push(item); break;
            case 'questions': interviewQuestions.push(item); break;
            case 'practices': bestPractices.push(item); break;
            case 'pitfalls': pitfalls.push(item); break;
          }
        }
      }
    }

    // Store in Convex database
    const convexResponse = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/mutation/training/storeTrainingData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CONVEX_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        category,
        subcategory: subcategory || '',
        content: extractedText,
        keyConcepts,
        formulas,
        interviewQuestions,
        bestPractices,
        pitfalls,
        sourceFile: 'uploaded-pdf',
      }),
    });

    if (!convexResponse.ok) {
      console.error('Failed to store training data in Convex');
    }

    return NextResponse.json({
      success: true,
      analyzedContent,
      originalLength: extractedText.length,
      category,
      subcategory,
      storedInDatabase: convexResponse.ok,
      extractedData: {
        keyConcepts: keyConcepts.length,
        formulas: formulas.length,
        interviewQuestions: interviewQuestions.length,
        bestPractices: bestPractices.length,
        pitfalls: pitfalls.length,
      }
    });

  } catch (error) {
    console.error("Error training AI:", error);
    return NextResponse.json(
      { error: "Failed to train AI with the provided content" },
      { status: 500 }
    );
  }
} 