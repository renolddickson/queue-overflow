import React, { useState } from 'react';
import { createLowlight } from 'lowlight';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/atom-one-dark.css';
import { Check, Copy } from 'lucide-react';

interface CodeBlockContent {
  config: {
    language: string;
  };
  data: string;
}

interface CodeBlockProps {
  content: CodeBlockContent;
}

const lowlight = createLowlight();
lowlight.register('css', css);
lowlight.register('js', js);
lowlight.register('javascript', js);
lowlight.register('typescript', ts);
lowlight.register('python', python);
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
    <div className="flex flex-col rounded-lg overflow-hidden mb-8">
      <div className="flex justify-between p-2 items-center bg-[#3d3d3d]">
        <span className="text-sm text-gray-400">{content.config.language}</span>
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
