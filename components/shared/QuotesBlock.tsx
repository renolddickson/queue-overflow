import { QuotesBlockContent } from '@/types';
import React from 'react';

interface QuotesBlockProps {
  content: QuotesBlockContent;
}

export default function QuotesBlock({ content }: QuotesBlockProps) {
  return (
    <div className="relative bg-gray-50 p-4 text-gray-700 italic c my-4 border-l-4 border-gray-500">
      <p className="mb-2">{content.data}</p>
      {content.config.author && (
        <span className="block text-right text-gray-900">— {content.config.author}</span>
      )}
    </div>
  );
}
