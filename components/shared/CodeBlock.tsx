"use client";

import React, { useState } from 'react';
import { createLowlight } from 'lowlight';
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import json from 'highlight.js/lib/languages/json'
import java from 'highlight.js/lib/languages/java'
import csharp from 'highlight.js/lib/languages/csharp'
import cpp from 'highlight.js/lib/languages/cpp'
import php from 'highlight.js/lib/languages/php'
import ruby from 'highlight.js/lib/languages/ruby'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import html from 'highlight.js/lib/languages/xml' // XML includes HTML
import sql from 'highlight.js/lib/languages/sql'
import bash from 'highlight.js/lib/languages/bash'
import 'highlight.js/styles/atom-one-dark.css';
import { Check, Copy } from 'lucide-react';
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content.data);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const isLanguageRegistered = lowlight.listLanguages().includes(content.config.language);
  const highlighted = isLanguageRegistered
    ? lowlight.highlight(content.config.language, content.data)
    : { children: [{ type: 'text', value: content.data }] };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderHighlighted = (nodes: any[]) =>
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
    <div className="flex flex-col rounded-lg overflow-hidden my-4">
      <div className="flex justify-between p-2 items-center bg-[#3d3d3d]">
        <span className="text-sm text-gray-400 capi">{content.config.language}</span>
      </div>
      <div className='relative p-4 bg-[#1e1e1e] text-white'>
      <button
          onClick={handleCopy}
          className="bg-gray-700 px-2 py-1 rounded h-8 w-8 hover:bg-gray-600 transition-colors absolute top-2 right-2 flex items-center justify-center"
        >
          {copySuccess ? <Check size={16} /> : <Copy size={16} /> }
        </button>
      <pre className="overflow-x-auto">
        <code>{renderHighlighted(highlighted.children)}</code>
      </pre>
      </div>
    </div>
  );
}
