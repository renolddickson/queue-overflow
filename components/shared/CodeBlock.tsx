"use client";

import React, { useLayoutEffect, useRef, useState } from 'react';
import { createLowlight } from 'lowlight';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import cpp from 'highlight.js/lib/languages/cpp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import html from 'highlight.js/lib/languages/xml'; // XML includes HTML
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import 'highlight.js/styles/atom-one-dark.css';
import { Check, ChevronDown, Copy } from 'lucide-react';
import { CodeBlockContent } from '@/types';

interface CodeBlockProps {
  content: CodeBlockContent;
}

const lowlight = createLowlight();
lowlight.register('css', css);
lowlight.register('javascript', js);
lowlight.register('js', js); // Alias
lowlight.register('typescript', ts);
lowlight.register('python', python);
lowlight.register('java', java);
lowlight.register('csharp', csharp);
lowlight.register('cpp', cpp);
lowlight.register('php', php);
lowlight.register('ruby', ruby);
lowlight.register('go', go);
lowlight.register('rust', rust);
lowlight.register('html', html);
lowlight.register('sql', sql);
lowlight.register('shell', bash);
lowlight.register('bash', bash); // Alias
lowlight.register('json', json);

export default function CodeBlock({ content }: CodeBlockProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(content.config.activeFile || 0);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasFiles = content.files && content.files.length > 0;
  const activeFile = hasFiles ? content.files![activeFileIndex] : null;
  const displayLanguage = activeFile?.language || content.config.language || "javascript";
  const displayCode = activeFile?.content || "";

  // On mount, detect if content overflows the collapsed height
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el && el.scrollHeight > el.clientHeight) {
      setShowToggle(true);
    }
  }, [displayCode, expanded]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const isLanguageRegistered = lowlight
    .listLanguages()
    .includes(displayLanguage);
    
  const highlighted = isLanguageRegistered
    ? lowlight.highlight(displayLanguage, displayCode)
    : { children: [{ type: 'text', value: displayCode }] };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderHighlighted = (nodes: any[]): React.ReactNode[] =>
    nodes.map((node, index) =>
      node.type === 'element' ? (
        <span key={index} className={node.properties.className?.join(' ')}>
          {renderHighlighted(node.children)}
        </span>
      ) : (
        node.value
      )
    );

  return (
    <div className="flex flex-col rounded-lg overflow-hidden my-4 w-full min-w-0 max-w-full border border-gray-700/50 shadow-xl bg-[#1e1e1e]">
      {/* Tab Header for multiple files */}
      <div className="flex items-center bg-[#2d2d2d] border-b border-gray-800 overflow-x-auto no-scrollbar">
        {content.files?.map((file, idx) => (
          <button
            key={idx}
            onClick={() => setActiveFileIndex(idx)}
            className={`px-4 py-2 text-xs font-medium transition-colors border-r border-gray-800/50 flex items-center gap-2 ${
              activeFileIndex === idx 
              ? 'bg-[#1e1e1e] text-blue-400 border-b-2 border-b-blue-500' 
              : 'text-gray-400 hover:bg-[#353535] hover:text-gray-200'
            }`}
          >
            <span className="truncate max-w-[120px]">{file.name || 'index'}</span>
          </button>
        ))}
        {(!content.files || content.files.length === 0) && (
            <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-widest font-bold">
                {content.config.language || 'code'}
            </div>
        )}
        <div className="flex-1" />
      </div>

      {/* Code container: collapses when not expanded */}
      <div
        ref={containerRef}
        className={`
          relative p-4 text-white w-full min-w-0
          ${expanded ? '' : 'max-h-80 overflow-hidden'}
        `}
      >
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-gray-400 px-2 py-1 rounded h-8 w-8 hover:bg-gray-700 hover:text-white transition-all flex items-center justify-center z-20 flex-shrink-0 active:scale-95 shadow-md"
          title="Copy code"
        >
          {copySuccess ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>

        {/* Actual code - Fixed for mobile overflow */}
        <div className="overflow-x-auto w-full">
          <pre className="text-sm sm:text-base whitespace-pre-wrap sm:whitespace-pre font-mono leading-relaxed">
            <code className="whitespace-pre">
              {renderHighlighted(highlighted.children)}
            </code>
          </pre>
        </div>

        {/* Gradient fade + View more button when collapsed */}
        {!expanded && showToggle && (
          <>
            <div className="pointer-events-none absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#1e1e1e] via-[#1e1e1e]/80 to-transparent" />
            <button
              onClick={() => setExpanded(true)}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-xs font-bold shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 z-10 border border-blue-400/30"
            >
              <span>View Full Code</span>
              <ChevronDown size={14} />
            </button>
          </>
        )}
      </div>

      {/* View less button when expanded */}
      {expanded && showToggle && (
        <div className="flex justify-center p-2 bg-[#1e1e1e] border-t border-gray-800/50">
          <button
            onClick={() => setExpanded(false)}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider py-1 px-4"
          >
            Collapse Code
          </button>
        </div>
      )}
    </div>
  );
}
