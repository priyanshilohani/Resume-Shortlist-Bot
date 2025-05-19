"use client";

import React, { useState, useMemo } from "react";
import axios from "axios";

type Result = {
  filename: string;
  score: number;
  good: string[];
  bad: string[];
};

export default function Page() {
  const [files, setFiles] = useState<File[]>([]);
  const [jd, setJd] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [history, setHistory] = useState<Result[][]>([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<keyof Result>("score");
  const [sortAsc, setSortAsc] = useState(false);

  const sortedResults = useMemo(() => {
    const sorted = [...results].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [results, sortKey, sortAsc]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSort = (key: keyof Result) => {
    if (key === sortKey) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleSubmit = async () => {
    if (!jd.trim() || files.length === 0) {
      alert("Please provide a job description and upload at least one resume.");
      return;
    }
    setLoading(true);
    setResults([]);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("jd", jd);

      const response = await axios.post("http://localhost:3000/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.results) {
        setResults(response.data.results);
      } else {
        alert("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Error analyzing resumes:", error);
      alert("Failed to analyze resumes. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get("http://localhost:3000/history");
      if (response.data?.history) {
        setHistory([response.data.history]); // Wrap in array to mimic multiple sets
      } else {
        alert("No history found.");
      }
    } catch (err) {
      console.error("Error fetching history:", err);
      alert("Failed to fetch history.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">AI Resume Shortlisting Bot</h1>

      <label className="block mb-2 font-semibold" htmlFor="jd">
        Paste Job Description:
      </label>
      <textarea
        id="jd"
        rows={6}
        className="w-full p-3 border border-gray-300 rounded mb-4"
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste the full job description here..."
      />

      <div className="mb-6">
        <label className="block mb-2 font-semibold">Upload Resumes (PDF or DOCX, multiple):</label>

        <label
          htmlFor="files"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded cursor-pointer hover:bg-blue-700 transition"
        >
          Choose Files
        </label>

        <input
          type="file"
          id="files"
          multiple
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        {files.length > 0 && (
          <p className="mt-2 text-sm text-gray-600">{files.length} file{files.length > 1 ? "s" : ""} selected</p>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Resumes"}
        </button>
        <button
          onClick={fetchHistory}
          className="bg-gray-600 text-white px-6 py-3 rounded font-semibold hover:bg-gray-700 transition"
        >
          View History
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Shortlisted Candidates</h2>

          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th
                  className="border border-gray-300 px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("filename")}
                >
                  Filename {sortKey === "filename" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th
                  className="border border-gray-300 px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("score")}
                >
                  Score {sortKey === "score" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th className="border border-gray-300 px-4 py-2">Good Points</th>
                <th className="border border-gray-300 px-4 py-2">Bad Points</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map(({ filename, score, good, bad }) => (
                <tr key={filename} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{filename}</td>
                  <td className="border border-gray-300 px-4 py-2">{score}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {good.length > 0 ? good.join(", ") : "—"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {bad.length > 0 ? bad.join(", ") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Previous Analyses</h2>
          {history.map((resultSet, index) => (
            <div key={index} className="mb-8">
              <h3 className="font-semibold mb-2">Analysis #{history.length - index}</h3>
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Filename</th>
                    <th className="border px-2 py-1">Score</th>
                    <th className="border px-2 py-1">Good Points</th>
                    <th className="border px-2 py-1">Bad Points</th>
                  </tr>
                </thead>
                <tbody>
                  {resultSet.map(({ filename, score, good, bad }) => (
                    <tr key={filename} className="hover:bg-gray-50">
                      <td className="border px-2 py-1">{filename}</td>
                      <td className="border px-2 py-1">{score}</td>
                      <td className="border px-2 py-1">{good.join(", ") || "—"}</td>
                      <td className="border px-2 py-1">{bad.join(", ") || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
