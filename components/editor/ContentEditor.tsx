"use client";
import { AlertTriangle, AlignLeft, Code, Heading2, Heading3, Plus, Quote, X } from "lucide-react";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  DocumentContent, 
  ContentType,
  CodeBlockContent,
  QuotesBlockContent,
  WarningBoxContent
} from "@/types";
import CodeBlock from "@/components/shared/CodeBlock";
import QuotesBlock from "@/components/shared/QuotesBlock";
import WarningBox from "@/components/shared/WarningBox";
import RichTextEditor, { RichTextEditorRef } from "./RichTextEditor";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// API functions for fetching, inserting, and updating content.
import { fetchBySubTopicId, submitData, updateData } from "@/actions/document";
import { ContentDataType, ContentRecord } from "@/types/api";

// Section type for our editor – a heading and a list of DocumentContent items.
type Section = {
  heading: string | null;
  content: DocumentContent[];
};

export type ExtendedDocumentContent = { icon: React.ReactElement; label: string; type: ContentType };

const contentTemplates: Record<ContentType, ExtendedDocumentContent & { defaultContent: DocumentContent['content'] }> = {
  paragraph: { 
    type: 'paragraph', 
    defaultContent: { data: "New paragraph content..." }, 
    icon: <AlignLeft />, 
    label: 'Paragraph' 
  },
  heading2: { 
    type: 'heading2', 
    defaultContent: { data: "New Heading 2" }, 
    icon: <Heading2 />, 
    label: 'Heading 2' 
  },
  heading3: { 
    type: 'heading3', 
    defaultContent: { data: "New Heading 3" }, 
    icon: <Heading3 />, 
    label: 'Heading 3' 
  },
  codeBlock: { 
    type: 'codeBlock', 
    defaultContent: { 
      config: { language: 'javascript' }, 
      data: "console.log('Hello World');" 
    } as CodeBlockContent, 
    icon: <Code />, 
    label: 'Code Block' 
  },
  quote: { 
    type: 'quote', 
    defaultContent: { 
      config: { author: '' }, 
      data: 'Inspirational quote here.' 
    } as QuotesBlockContent, 
    icon: <Quote />, 
    label: 'Quotes' 
  },
  warningBox: { 
    type: 'warningBox', 
    defaultContent: { 
      config: { type: 'warning', design: 2 }, 
      data: 'Warning message here...' 
    } as WarningBoxContent, 
    icon: <AlertTriangle />, 
    label: 'Box' 
  },
  // Placeholders for additional types
  table: { 
    type: 'table', 
    defaultContent: { data: "Table content placeholder" }, 
    icon: <AlignLeft />, 
    label: 'Table' 
  },
  graph: { 
    type: 'graph', 
    defaultContent: { data: "Graph content placeholder" }, 
    icon: <AlignLeft />, 
    label: 'Graph' 
  },
  accordion: { 
    type: 'accordion', 
    defaultContent: { data: "Accordion content placeholder" }, 
    icon: <AlignLeft />, 
    label: 'Accordion' 
  },
  tab: { 
    type: 'tab', 
    defaultContent: { data: "Tab content placeholder" }, 
    icon: <AlignLeft />, 
    label: 'Tab' 
  }
};

const codeLanguages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'shell', label: 'Shell/Bash' },
];

const warningTypes = [
  { value: 'info', label: 'Information' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'note', label: 'Note' },
  { value: 'tip', label: 'Tip' },
];

const warningDesigns = [
  { value: 1, label: 'Design 1' },
  { value: 2, label: 'Design 2' },
];

interface ContentEditorProps {
  initialContent?: DocumentContent[];
  onChange?: (content: DocumentContent[]) => void;
  setIsDirty: (isDirty: boolean) => void;
  subTopicId: string;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ initialContent = [], subTopicId, onChange, setIsDirty }) => {
  // If initialContent is provided, we assume it’s new; otherwise load via fetch.
  const [sections, setSections] = useState<Section>(
    initialContent.length > 0 ? { heading: "Add Heading", content: initialContent } : { heading: "Add Heading", content: [] }
  );
  const [loading, setLoading] = useState<boolean>(initialContent.length === 0);
  const [editingIndex, setEditingIndex] = useState<{ section: number; item: number | null } | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  // Keep a copy of the original sections for reset.
  const [originalSections, setOriginalSections] = useState<Section>(sections);
  
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const richTextEditorRef = useRef<RichTextEditorRef | null>(null);
  const [tempCodeLanguage, setTempCodeLanguage] = useState<string>('javascript');
  const [tempQuoteAuthor, setTempQuoteAuthor] = useState<string>('');
  const [tempWarningType, setTempWarningType] = useState<'info' | 'warning' | 'error' | 'note' | 'tip'>('warning');
  const [tempWarningDesign, setTempWarningDesign] = useState<1 | 2>(1);
  const [open, setOpen] = useState(false);

  // Determine if content has changed compared to the original
  const isDirty = JSON.stringify(sections) !== JSON.stringify(originalSections);

  // Fetch content from the database if no initialContent is provided.
  useEffect(() => {
    async function fetchContent() {
      try {
        // Call your fetch function. Expecting a record from the "contents" table.
        const response = await fetchBySubTopicId<ContentRecord>('contents', 'subtopic_id', subTopicId);
        console.log(response.data);
        if (response.success && response.data) {
          // If your API returns an array, take the first record.
          const record = Array.isArray(response.data) ? response.data[0] : response.data;
          setRecordId(record.id);
          // Assume content_data holds an array of DocumentContent.
          const fetchedSections: Section = { heading: "Add Heading", content: record.content_data };
          setSections(fetchedSections);
          setOriginalSections(fetchedSections);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    }
    if (initialContent.length === 0) {
      fetchContent();
    } else {
      // If initialContent is provided, initialize originalSections from it.
      const initSections: Section = { heading: "Add Heading", content: initialContent };
      setSections(initSections);
      setOriginalSections(initSections);
    }
  }, [subTopicId, initialContent]);

  // Call onChange whenever sections change.
  useEffect(() => {
    if (onChange) {
      const allContent: DocumentContent[] = [];
      // For each section, include the heading as a DocumentContent item.
      allContent.push({ type: 'heading2', content: { data: sections.heading || "" } });
      allContent.push(...sections.content);
      onChange(allContent);
    }
  }, [sections, onChange]);

  // Mark the document as dirty when sections change.
  useEffect(() => {
    setIsDirty(true);
  }, [sections]);

  useEffect(() => {
    if (editingIndex !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingIndex]);

  useEffect(() => {
    if (editingIndex?.item !== null && editingIndex?.item !== undefined) {
      const item = sections.content[editingIndex.item];
      if (item.type === 'codeBlock') {
        setTempCodeLanguage(item.content.config.language || 'javascript');
      } else if (item.type === 'quote') {
        setTempQuoteAuthor(item.content.config.author || '');
      } else if (item.type === 'warningBox') {
        setTempWarningType(item.content.config.type);
        setTempWarningDesign(item.content.config.design);
      }
    }
  }, [editingIndex, sections]);

  const addSection = () => {
    setSections({ ...sections, content: [...sections.content, { type: 'paragraph', content: { data: "New paragraph content..." } }] });
  };

  const addContent = (type: ContentType) => {
    const template = contentTemplates[type];
    const newContent = { 
      type, 
      content: JSON.parse(JSON.stringify(template.defaultContent))
    } as DocumentContent;
    
    setSections({ ...sections, content: [...sections.content, newContent] });
  };

  const startEditing = (itemIndex: number | null = null) => {
    if (editingIndex !== null) {
      // Save any current edits before switching.
      saveCurrentEdit();
    }
    // Since we only have one section in this example, we pass section index 0.
    setEditingIndex({ section: 0, item: itemIndex });
  };

  const handleEdit = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveCurrentEdit();
    }
  };

  const saveCurrentEdit = () => {
    if (!editingIndex) return;
    const { section, item } = editingIndex;
    let updatedSections = { ...sections };
    
    if (item === null && inputRef.current) {
      // Save section heading.
      updatedSections = { ...updatedSections, heading: inputRef.current.value };
    } else if (item !== null) {
      const updatedContent = [...updatedSections.content];
      const contentItem = updatedContent[item];
      
      if (contentItem.type === 'paragraph' && richTextEditorRef.current) {
        (contentItem.content as { data: string }).data = richTextEditorRef.current.getHTML();
      } else if (contentItem.type === 'codeBlock') {
        if (inputRef.current) {
          (contentItem.content as CodeBlockContent).data = inputRef.current.value;
        }
        (contentItem.content as CodeBlockContent).config.language = tempCodeLanguage;
      } else if (contentItem.type === 'quote') {
        if (inputRef.current) {
          (contentItem.content as QuotesBlockContent).data = inputRef.current.value;
        }
        (contentItem.content as QuotesBlockContent).config.author = tempQuoteAuthor;
      } else if (contentItem.type === 'warningBox') {
        if (inputRef.current) {
          (contentItem.content as WarningBoxContent).data = inputRef.current.value;
        }
        (contentItem.content as WarningBoxContent).config.type = tempWarningType;
        (contentItem.content as WarningBoxContent).config.design = tempWarningDesign;
      } else if (inputRef.current) {
        (contentItem.content as { data: string }).data = inputRef.current.value;
      }
      updatedSections = { ...updatedSections, content: updatedContent };
    }
    
    setSections(updatedSections);
    setEditingIndex(null);
  };

  // Render content based on its type.
  const renderContent = (item: DocumentContent, itemIndex: number) => {
    switch (item.type) {
      case 'heading2':
      case 'heading3':
        return (
          <div 
            onDoubleClick={() => startEditing(itemIndex)} 
            className={`p-2 editor-ring ${item.type === 'heading2' ? 'text-xl font-semibold' : 'text-lg font-medium'}`}
          >
            {item.content.data}
          </div>
        );
      case 'paragraph':
        return (
          <div 
            onDoubleClick={() => startEditing(itemIndex)} 
            className="p-2 editor-ring" 
            dangerouslySetInnerHTML={{ __html: item.content.data }}
          ></div>
        );
      case 'codeBlock':
        return (
          <div 
            className="editor-ring p-2" 
            onDoubleClick={() => startEditing(itemIndex)}
          >
            <CodeBlock content={item.content} />
          </div>
        );
      case 'quote':
        return (
          <div 
            className="editor-ring p-2" 
            onDoubleClick={() => startEditing(itemIndex)}
          >
            <QuotesBlock content={item.content} />
          </div>
        );
      case 'warningBox':
        return (
          <div 
            className="editor-ring p-2" 
            onDoubleClick={() => startEditing(itemIndex)}
          >
            <WarningBox content={item.content} />
          </div>
        );
      default:
        return null;
    }
  };

  // Delete a content item.
  const deleteContent = (itemIndex: number) => {
    const updatedContent = sections.content.filter((_, idx) => idx !== itemIndex);
    setSections({ ...sections, content: updatedContent });
  };

  // Handler for resetting the content to the original state.
  const handleReset = () => {
    setSections(originalSections);
  };

  // Handler for saving the current content.
  const handleSave = async () => {
    // First, merge the section heading and content into a single array.
    const combinedContent: DocumentContent[] = [];
    if (sections.heading) {
      combinedContent.push({ type: 'heading2', content: { data: sections.heading } });
    }
    combinedContent.push(...sections.content);
    
    try {
      if (recordId) {
        // Update existing record.
        const response = await updateData<DocumentContent>('contents', recordId, { subtopic_id: subTopicId, content_data: combinedContent });
        console.log("Update response:", response);
      } else {
        // First-time save (insert new record).
        const response = await submitData<ContentDataType>('contents', { subtopic_id: subTopicId, content_data: combinedContent });
        console.log("Submit response:", response);
        // Assuming the insert returns the new record with an id:
        if (response.success && response.data && response.data.length > 0) {
          setRecordId(response.data[0].id);
        }
      }
      // After saving, update the original state to match current.
      setOriginalSections(sections);
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  if (loading) {
    return <div>Loading content...</div>;
  }

  return (
    <div className="flex-1 flex flex-col gap-4 m-4">
      {/* Top control buttons */}
      <div className="flex justify-end gap-4 mb-4">
        <button 
          onClick={handleReset} 
          disabled={!isDirty}
          className={`px-4 py-2 rounded-md border ${!isDirty ? "bg-gray-200 text-gray-500" : "bg-red-500 text-white hover:bg-red-600"}`}
        >
          Reset
        </button>
        <button 
          onClick={handleSave} 
          disabled={!isDirty}
          className={`px-4 py-2 rounded-md border ${!isDirty ? "bg-gray-200 text-gray-500" : "bg-green-500 text-white hover:bg-green-600"}`}
        >
          Save
        </button>
      </div>
      
      {/* Render section heading and content items */}
      <Card className="flex flex-col min-h-[50vh]">
        <CardHeader className="pb-0">
          {editingIndex && editingIndex.section === 0 && editingIndex.item === null ? (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              defaultValue={sections.heading || ""}
              onKeyDown={handleEdit}
              onBlur={saveCurrentEdit}
              className="border rounded-sm p-2 text-2xl font-bold w-full"
            />
          ) : (
            <CardTitle 
              onClick={() => startEditing(null)}
              className="cursor-pointer hover:ring-2 hover:ring-orange-500 p-2 rounded-sm text-2xl font-bold"
            >
              {sections.heading || "Add Heading"}
            </CardTitle>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-4">
          {sections.content.map((item, index) => (
            <div key={`content-${index}`} className="relative group">
              {editingIndex && editingIndex.item === index ? (
                (() => {
                  switch (item.type) {
                    case 'paragraph':
                      return (
                        <div className="editor-container">
                          <RichTextEditor
                            ref={richTextEditorRef}
                            defaultValue={item.content.data}
                            placeholder="Start typing..."
                            className="border"
                          />
                          <div className="flex justify-end mt-2 gap-2">
                            <button 
                              onClick={() => setEditingIndex(null)}
                              className="px-3 py-1 bg-gray-300 rounded-sm text-sm"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={saveCurrentEdit}
                              className="px-3 py-1 bg-blue-600 text-white rounded-sm text-sm"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      );
                    case 'codeBlock':
                      return (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="code-language">Programming Language</Label>
                            <Select value={tempCodeLanguage} onValueChange={setTempCodeLanguage}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Language" />
                              </SelectTrigger>
                              <SelectContent>
                                {codeLanguages.map((lang) => (
                                  <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <textarea
                            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                            defaultValue={(item.content as CodeBlockContent).data}
                            onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) saveCurrentEdit(); }}
                            className="w-full h-40 font-mono text-sm p-2 border rounded-sm"
                          />
                          <div className="flex justify-end mt-2 gap-2">
                            <button 
                              onClick={() => setEditingIndex(null)}
                              className="px-3 py-1 bg-gray-300 rounded-sm text-sm"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={saveCurrentEdit}
                              className="px-3 py-1 bg-blue-600 text-white rounded-sm text-sm"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      );
                    case 'quote':
                      return (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="quote-author">Author</Label>
                            <input
                              id="quote-author"
                              value={tempQuoteAuthor}
                              onChange={(e) => setTempQuoteAuthor(e.target.value)}
                              className="w-full p-2 border rounded-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="quote-content">Quote Content</Label>
                            <textarea
                              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                              id="quote-content"
                              defaultValue={(item.content as QuotesBlockContent).data}
                              className="w-full h-20 p-2 border rounded-sm"
                            />
                          </div>
                          <div className="flex justify-end mt-2 gap-2">
                            <button 
                              onClick={() => setEditingIndex(null)}
                              className="px-3 py-1 bg-gray-300 rounded-sm text-sm"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={saveCurrentEdit}
                              className="px-3 py-1 bg-blue-600 text-white rounded-sm text-sm"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      );
                    case 'warningBox':
                      return (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="warning-type">Box Type</Label>
                              <Select 
                                value={tempWarningType} 
                                onValueChange={(value) => setTempWarningType(value as 'info' | 'warning' | 'error' | 'note' | 'tip')}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {warningTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="warning-design">Design Style</Label>
                              <Select 
                                value={tempWarningDesign.toString()} 
                                onValueChange={(value) => setTempWarningDesign(parseInt(value) as 1 | 2)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Design" />
                                </SelectTrigger>
                                <SelectContent>
                                  {warningDesigns.map((design) => (
                                    <SelectItem key={design.value} value={design.value.toString()}>
                                      {design.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="warning-content">Content</Label>
                            <textarea
                              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                              id="warning-content"
                              defaultValue={(item.content as WarningBoxContent).data}
                              className="w-full h-20 p-2 border rounded-sm"
                            />
                          </div>
                          <div className="flex justify-end mt-2 gap-2">
                            <button 
                              onClick={() => setEditingIndex(null)}
                              className="px-3 py-1 bg-gray-300 rounded-sm text-sm"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={saveCurrentEdit}
                              className="px-3 py-1 bg-blue-600 text-white rounded-sm text-sm"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      );
                    default:
                      return (
                        <div>
                          <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            defaultValue={(item.content as { data: string }).data}
                            onKeyDown={handleEdit}
                            className={`w-full border rounded-sm p-2 ${item.type === 'heading2' ? 'text-xl font-semibold' : 'text-lg font-medium'}`}
                          />
                          <div className="flex justify-end mt-2 gap-2">
                            <button 
                              onClick={() => setEditingIndex(null)}
                              className="px-3 py-1 bg-gray-300 rounded-sm text-sm"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={saveCurrentEdit}
                              className="px-3 py-1 bg-blue-600 text-white rounded-sm text-sm"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      );
                  }
                })()
              ) : (
                <div 
                  onClick={() => startEditing(index)}
                  className="cursor-pointer"
                >
                  {renderContent(item, index)}
                  {/* Delete button (visible on hover) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteContent(index); }}
                    className="absolute -top-3 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete content"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
          
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button className="w-full h-12 flex justify-center items-center border border-dashed border-gray-300 rounded-sm hover:bg-gray-50 transition-colors">
                <Plus className="h-4 w-4 mr-2" /> Add Content
              </button>
            </PopoverTrigger>
            <PopoverContent className="grid grid-cols-2 gap-2 p-2">
              {Object.entries(contentTemplates)
                .filter(([key]) => ['paragraph', 'heading2', 'heading3', 'codeBlock', 'quote', 'warningBox'].includes(key))
                .map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => { addContent(key as ContentType); setOpen(false); }}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-sm transition-colors duration-200"
                  >
                    <span className="flex items-center gap-1">
                      {template.icon}
                      <span>{template.label}</span>
                    </span>
                  </button>
                ))}
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>
      
      <button 
        onClick={addSection}
        className="w-full h-16 flex justify-center items-center border-2 border-dashed border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
      >
        <Plus className="h-6 w-6 mr-2" /> Add Section
      </button>
    </div>
  );
};

export default ContentEditor;
