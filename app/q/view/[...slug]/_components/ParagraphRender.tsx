"use client";
import React, { useEffect, useState } from "react";

export const ParagraphRender = ({ html }: { html: string }) => {
  const [clientHtml, setClientHtml] = useState("");

  useEffect(() => {
    setClientHtml(html);
  }, [html]);

  return (
    <p
      className="mb-6 text-gray-600"
      dangerouslySetInnerHTML={{ __html: clientHtml }}
    ></p>
  );
};
