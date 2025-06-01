/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import MainContent from "@/components/common/Content";
import { ContentData } from "@/types/api";
import { AlertCircle } from "lucide-react";

export default function DocsPage() {
  const [contentData, setContentData] = useState<ContentData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // 1. Grab everything after the “#”:
      const hash = window.location.hash; // e.g. "#content=VGhpcyBpcyBhIHRlc3Q…"
      if (!hash.startsWith("#content=")) {
        throw new Error("No content in URL fragment.");
      }
      const b64 = hash.slice("#content=".length);

      // 2. Decode Base64 → UTF-8 → JSON
      const jsonString = decodeURIComponent(escape(atob(b64)));
      const parsed: unknown = JSON.parse(jsonString);

      // 3. (Optional) Validate that it's an array of { heading: string; content: any[] }
      if (
        !Array.isArray(parsed) ||
        parsed.some(
          (item) =>
            typeof item !== "object" ||
            typeof (item as any).heading !== "string" ||
            !Array.isArray((item as any).content)
        )
      ) {
        throw new Error("Invalid content structure.");
      }

      setContentData(parsed as ContentData[]);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading…</div>;
  }
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  if (!contentData) {
    return (
      <div className="text-center py-12 text-gray-500">No content to display.</div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <MainContent
        articleData={{
          id: "",
          content_data: contentData,
          created_at: "",
          updated_at: "",
          subtopic_id: "",
        }}
        type="blog"
        routeTopic={null as unknown as any}
      />
    </div>
  );
}
