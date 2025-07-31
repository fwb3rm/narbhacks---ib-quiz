"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Brain } from "lucide-react";

const CATEGORIES = {
  "accounting": "Accounting",
  "valuation": "Valuation", 
  "M&A": "M&A",
  "LBO": "LBO",
  "capital markets": "Capital Markets",
  "corporate finance": "Corporate Finance",
  "technical modeling": "Technical Modeling",
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("valuation");
  const [subcategory, setSubcategory] = useState("");
  const [trainingAI, setTrainingAI] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please select a valid PDF file");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleTrainAI = async () => {
    if (!result) return;

    setTrainingAI(true);
    setError(null);
    setAiResult(null);

    try {
      const response = await fetch("/api/train-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extractedText: result.preview + "...", // Use full text in production
          category: selectedCategory,
          subcategory: subcategory,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAiResult(data);
      } else {
        setError(data.error || "AI training failed");
      }
    } catch (err) {
      setError("AI training failed. Please try again.");
    } finally {
      setTrainingAI(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            AI Training Upload
          </h1>
          <p className="text-lg text-gray-300">
            Upload PDF documents to enhance the AI&apos;s knowledge for IB interviews
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/30 rounded-2xl p-8">
          <div className="space-y-6">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-600/50 rounded-xl p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-4">
                <div>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-white font-semibold">
                      Choose a PDF file
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-gray-400 text-sm">
                  Upload essential IB interview materials (max 10MB)
                </p>
              </div>
            </div>

            {/* File Info */}
            {file && (
              <div className="bg-gray-700/30 rounded-lg p-4 flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="text-white">{file.name}</span>
                <span className="text-gray-400 text-sm">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}

            {/* Category Selection */}
            {file && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Select Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    {Object.entries(CATEGORIES).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Subcategory (Optional)
                  </label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g., DCF Analysis, LBO Modeling"
                    className="w-full bg-gray-700/50 border border-gray-600/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            {file && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Upload & Process</span>
                  </>
                )}
              </button>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            )}

            {/* Success Result */}
            {result && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-semibold">
                    Upload Successful!
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong>Filename:</strong> {result.filename}</p>
                  <p><strong>Text Length:</strong> {result.textLength} characters</p>
                  <div>
                    <strong>Preview:</strong>
                    <p className="mt-1 text-gray-400">{result.preview}</p>
                  </div>
                </div>
                
                {/* AI Training Button */}
                <button
                  onClick={handleTrainAI}
                  disabled={trainingAI}
                  className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {trainingAI ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Training AI...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Train AI with This Content</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* AI Training Result */}
            {aiResult && (
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Brain className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-300 font-semibold">
                    AI Training Complete!
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong>Category:</strong> {CATEGORIES[aiResult.category as keyof typeof CATEGORIES]}</p>
                  <p><strong>Subcategory:</strong> {aiResult.subcategory || "General"}</p>
                  <div>
                    <strong>AI Analysis:</strong>
                    <div className="mt-2 p-3 bg-gray-800/50 rounded-lg text-gray-300 text-xs max-h-40 overflow-y-auto">
                      {aiResult.analyzedContent}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Recommended PDFs for IB Interview Training
          </h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Investment Banking Interview Guides</li>
            <li>• Technical Modeling Guides</li>
            <li>• Valuation Methodologies</li>
            <li>• M&A Process Documents</li>
            <li>• LBO Analysis Materials</li>
            <li>• Financial Statement Analysis</li>
            <li>• Capital Markets Overview</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 