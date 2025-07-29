import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get("difficulty");

  try {
    const response = await fetch(
      `http://localhost:3003/generate-question?difficulty=${difficulty}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Validate the response data
    if (!data.question || !data.options || !data.answer || !data.explanation) {
      throw new Error("Invalid question data received from quiz API");
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
