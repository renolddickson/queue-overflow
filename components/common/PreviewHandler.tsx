"use client";

import { useEffect, useState } from "react";
import { ContentRecord } from "@/types/api";

export default function PreviewHandler({ 
  onPreview 
}: { 
  onPreview: (data: ContentRecord) => void 
}) {
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#content=")) {
        const encoded = hash.substring(9);
        try {
          const decoded = atob(encoded);
          const utf8Decoded = decodeURIComponent(escape(decoded));
          const parsed = JSON.parse(utf8Decoded);
          
          // Construct a mock ContentRecord from the parsed sections
          const mockRecord: ContentRecord = {
            id: "preview",
            content_data: parsed,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          onPreview(mockRecord);
        } catch (e) {
          console.error("Failed to parse preview content from hash", e);
        }
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [onPreview]);

  return null;
}
