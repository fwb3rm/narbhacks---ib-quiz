"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Eye, Download, Trash2, Search, Filter } from "lucide-react";

export default function DataViewerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const trainingData = useQuery(api.training.getAllTrainingData);

  const categories = [
    "all",
    "accounting",
    "valuation", 
    "M&A",
    "LBO",
    "capital markets",
    "corporate finance",
    "technical modeling",
  ];

  const filteredData = trainingData?.filter((item: any) => {
    const matchesSearch = item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!trainingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading training data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            AI Training Data Viewer
          </h1>
          <p className="text-lg text-gray-300">
            View and manage stored AI training knowledge
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-400">{trainingData.length}</div>
            <div className="text-blue-300">Total Training Records</div>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-400">
              {new Set(trainingData.map(item => item.category)).size}
            </div>
            <div className="text-green-300">Categories</div>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6">
                      <div className="text-3xl font-bold text-purple-400">
            {trainingData.reduce((sum: number, item: any) => sum + item.keyConcepts.length, 0)}
          </div>
            <div className="text-purple-300">Key Concepts</div>
          </div>
          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-xl p-6">
                      <div className="text-3xl font-bold text-orange-400">
            {trainingData.reduce((sum: number, item: any) => sum + item.interviewQuestions.length, 0)}
          </div>
            <div className="text-orange-300">Interview Questions</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/30 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search training data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600/30 text-white px-10 py-3 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-700/50 border border-gray-600/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/30 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-semibold">Category</th>
                  <th className="text-left p-4 text-gray-300 font-semibold">Subcategory</th>
                  <th className="text-left p-4 text-gray-300 font-semibold">Source File</th>
                  <th className="text-left p-4 text-gray-300 font-semibold">Key Concepts</th>
                  <th className="text-left p-4 text-gray-300 font-semibold">Formulas</th>
                  <th className="text-left p-4 text-gray-300 font-semibold">Questions</th>
                  <th className="text-left p-4 text-gray-300 font-semibold">Created</th>
                  <th className="text-left p-4 text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredData?.map((item: any) => (
                  <tr key={item._id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 text-white">
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-sm">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">
                      {item.subcategory || "General"}
                    </td>
                    <td className="p-4 text-gray-300 text-sm">
                      {item.sourceFile}
                    </td>
                    <td className="p-4 text-gray-300">
                      <div className="text-sm">
                        {item.keyConcepts.length} concepts
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      <div className="text-sm">
                        {item.formulas.length} formulas
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      <div className="text-sm">
                        {item.interviewQuestions.length} questions
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 text-sm">
                      {formatDate(item._creationTime)}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button className="p-2 bg-blue-600/20 text-blue-300 rounded hover:bg-blue-600/30 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-green-600/20 text-green-300 rounded hover:bg-green-600/30 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredData?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No training data found</div>
            <div className="text-gray-500 text-sm mt-2">
              Upload some PDFs to see training data here
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 