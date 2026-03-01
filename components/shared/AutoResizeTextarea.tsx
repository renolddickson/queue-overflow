"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
}

export const AutoResizeTextarea = ({
  value,
  className,
  ...props
}: AutoResizeTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      className={cn(
        "w-full resize-none overflow-hidden bg-transparent outline-none transition-[height] duration-200",
        className
      )}
      rows={1}
      {...props}
    />
  );
};
