"use client";
import { AlertTriangle, AlignLeft, Code, Heading2, Heading3, Plus, Quote } from "lucide-react";
import type React from "react";
import { useState, useRef, useEffect, JSX } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DocumentContent } from "@/types";

type Section = {
  heading: string | null;
  content: DocumentContent[];
};
export type ExtendedDocumentContent = { icon: JSX.Element; label: string } & DocumentContent;
const contentTemplates: Record<string, ExtendedDocumentContent> = {
  aragraph: { type: 'paragraph', content: { data: "New paragraph content..." }, icon: <AlignLeft />, label: 'Paragraph' },
  heading2: { type: 'heading2', content: { data: "New Heading 2" }, icon: <Heading2 />, label: 'Heading 2' },
  heading3: { type: 'heading3', content: { data: "New Heading 3" }, icon: <Heading3 />, label: 'Heading 3' },
  codeBlock: { type: 'codeBlock', content: { config: { language: 'javascript' }, data: "console.log('Hello World');" }, icon: <Code />, label: 'Code Block' },
  quote: { type: 'quote', content: { config: { author: "Unknown" }, data: 'Inspirational quote here.' }, icon: <Quote />, label: 'Quotes' },
  warningBox: { type: 'warningBox', content: { config: { type: 'warning', design: 1 }, data: '⚠️ Warning message here...' }, icon: <AlertTriangle />, label: 'Box' },
};


const ContentEditor = () => {
  const [sections, setSections] = useState<Section[]>([{ heading: null, content: [] }]);
  const [editingIndex, setEditingIndex] = useState<{ section: number; item: number | null } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingIndex !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingIndex]);

  const addSection = () => {
    setSections([...sections, { heading: null, content: [] }]);
  };

  const addContent = (sectionIndex: number, type: keyof typeof contentTemplates) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].content.push(contentTemplates[type]);
    if (!updatedSections[sectionIndex].heading) {
      updatedSections[sectionIndex].heading = "New Section Heading";
    }
    setSections(updatedSections);
  };

  const startEditing = (sectionIndex: number, itemIndex: number | null = null) => {
    setEditingIndex({ section: sectionIndex, item: itemIndex });
  };

  const handleEdit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && editingIndex !== null) {
      const { section, item } = editingIndex;
      const updatedSections = [...sections];
      if (item === null) {
        updatedSections[section].heading = e.currentTarget.value;
      } else {
        updatedSections[section].content[item].content.data = e.currentTarget.value;
      }
      setSections(updatedSections);
      setEditingIndex(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 m-4">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="flex flex-col min-h-[50vh] gap-2 p-4 border border-gray-200 rounded-lg shadow-sm">
          {editingIndex?.section === sectionIndex && editingIndex.item === null ? (
            <input
              ref={inputRef}
              defaultValue={section.heading || ""}
              onKeyDown={handleEdit}
              onBlur={() => setEditingIndex(null)}
              className="border rounded-sm px-2 py-1"
            />
          ) : (
            <h2 onDoubleClick={() => startEditing(sectionIndex)} className="text-2xl font-bold cursor-pointer hover:bg-gray-100 p-2 rounded-sm">
              {section.heading || "Add Heading"}
            </h2>
          )}
          {section.content.map((item, itemIndex) => (
            editingIndex?.section === sectionIndex && editingIndex.item === itemIndex ? (
              <input
                key={itemIndex}
                ref={inputRef}
                defaultValue={item.content.data}
                onKeyDown={handleEdit}
                onBlur={() => setEditingIndex(null)}
                className="border rounded-sm px-2 py-1"
              />
            ) : (
              <div key={itemIndex} onDoubleClick={() => startEditing(sectionIndex, itemIndex)} className="border border-gray-200 p-2 rounded-sm shadow-sm">
                {item.content.data}
              </div>
            )
          ))}
          <Popover>
            <PopoverTrigger className="w-full h-12 flex justify-center items-center border border-dashed border-gray-300 rounded-sm">
              <Plus className="h-4 w-4 mr-2" /> Add Content
            </PopoverTrigger>
            <PopoverContent className="grid grid-cols-2 gap-2 p-2">
            {Object.keys(contentTemplates).map((type) => (
                <button
                  key={type}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-sm transition-colors duration-200"
                  onClick={() => addContent(sectionIndex, type as keyof typeof contentTemplates)}
                >
                  <span className="flex items-center gap-1">
                    {contentTemplates[type].icon}
                    {contentTemplates[type].label}
                  </span>
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      ))}
      <button onClick={addSection} className="w-full h-16 flex justify-center items-center border-2 border-dashed border-gray-300 rounded-sm">
        <Plus className="h-6 w-6 mr-2" /> Add Section
      </button>
    </div>
  );
};

export default ContentEditor;