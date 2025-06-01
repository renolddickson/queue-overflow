import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import Editor from '@monaco-editor/react';

interface PadEditorProps {
  content: string; // JSON string input
  onChange: (value: string) => void; // Outputs JSON string
}

interface MarkdownSection {
  heading: string;
  content: Array<{
    type: 'heading2' | 'heading3' | 'paragraph' | 'codeBlock';
    content: {
      data: string;
      config?: { language: string };
    };
  }>;
}

// Convert JSON sections to Markdown
const sectionsToMarkdown = (sections: MarkdownSection[]): string => {
  let markdown = '';
  sections.forEach(section => {
    section.content.forEach(item => {
      switch (item.type) {
        case 'heading2':
          markdown += `## ${item.content.data}\n`;
          break;
        case 'heading3':
          markdown += `### ${item.content.data}\n`;
          break;
        case 'codeBlock':
          markdown += `\`\`\`${item.content.config?.language || 'javascript'}\n${item.content.data}\`\`\`\n`;
          break;
        case 'paragraph':
          markdown += `${item.content.data}\n`;
          break;
      }
    });
  });
  return markdown.trim();
};

// Parse Markdown to JSON sections
const parseMarkdownToSections = (markdown: string): MarkdownSection[] => {
  const lines = markdown.split('\n');
  const sections: MarkdownSection[] = [{ heading: 'Document', content: [] }];
  let inCode = false;
  let codeLang = 'javascript';
  let buffer = '';

  lines.forEach(line => {
    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeLang = line.replace(/```/, '').trim() || 'javascript';
        buffer = '';
      } else {
        sections[0].content.push({
          type: 'codeBlock',
          content: { config: { language: codeLang }, data: buffer }
        });
        inCode = false;
      }
    } else if (inCode) {
      buffer += line + '\n';
    } else if (line.startsWith('## ')) {
      sections[0].content.push({
        type: 'heading2',
        content: { data: line.replace('## ', '') }
      });
    } else if (line.startsWith('### ')) {
      sections[0].content.push({
        type: 'heading3',
        content: { data: line.replace('### ', '') }
      });
    } else if (line.trim()) {
      sections[0].content.push({
        type: 'paragraph',
        content: { data: line }
      });
    }
  });

  return sections;
};

export const PadEditor: React.FC<PadEditorProps> = ({ content, onChange }) => {
  const [mode, setMode] = useState<'text' | 'json'>('json');
  const [textValue, setTextValue] = useState(() => {
    try {
      const parsed = JSON.parse(content) as MarkdownSection[];
      return sectionsToMarkdown(parsed);
    } catch {
      return '';
    }
  });
  const [jsonValue, setJsonValue] = useState(content);

  useEffect(() => {
    if (mode === 'text') {
      try {
        const sections = parseMarkdownToSections(textValue);
        onChange(JSON.stringify(sections));
      } catch {
        onChange('{}');
      }
    } else {
      onChange(jsonValue);
    }
  }, [mode, textValue, jsonValue, onChange]);

  const handleTextChange = (value: string) => {
    setTextValue(value);
  };

  const handleJsonChange = (value: string | undefined) => {
    const newValue = value || '{}';
    setJsonValue(newValue);
    try {
      const parsed = JSON.parse(newValue) as MarkdownSection[];
      setTextValue(sectionsToMarkdown(parsed));
    } catch {
      setTextValue('');
    }
  };

  return (
    <div className="flex flex-col h-full border">
      <div className="mb-2 flex items-center space-x-2 p-2">
        <Label>Mode:</Label>
        <Select value={mode} onValueChange={(v) => setMode(v as 'text' | 'json')}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        {mode === 'text' ? (
          <textarea
            className="w-full h-full p-2 resize-none outline-none"
            value={textValue}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="## Start typing your markdown..."
          />
        ) : (
          <Editor
            height="100%"
            defaultLanguage="json"
            value={jsonValue}
            onChange={handleJsonChange}
            options={{ automaticLayout: true }}
          />
        )}
      </div>
    </div>
  );
};