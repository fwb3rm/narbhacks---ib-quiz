import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // Save the PDF temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = join(process.cwd(), "uploads");
    const filePath = join(uploadDir, file.name);
    
    await writeFile(filePath, buffer);

    // Simulate extracted text (in production, use pdf-parse or similar)
    const simulatedText = `This is a simulated extraction from ${file.name}. 
    In a production environment, you would use a proper PDF parsing library 
    like pdf-parse or pdf2pic to extract the actual text content from the PDF file.
    
    The extracted text would then be sent to your AI service for training and analysis.
    This allows the AI to learn from your specific IB interview materials and improve
    its ability to generate relevant questions and provide accurate answers.`;

    return NextResponse.json({ 
      success: true, 
      filename: file.name,
      textLength: simulatedText.length,
      preview: simulatedText.substring(0, 500) + "...",
      fullText: simulatedText
    });

  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
  }
} 