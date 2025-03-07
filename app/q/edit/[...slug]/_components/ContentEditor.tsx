"use client";
import { 
  AlertTriangle, AlignLeft, Code, Heading2, Heading3, Plus, Quote, 
  RotateCcw, Save, X, Trash
} from "lucide-react";
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
import RichTextEditor, { RichTextEditorRef } from "@/components/shared/RichTextEditor";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// API functions for fetching, inserting, and updating content.
import { fetchBySubTopicId, submitData, updateData } from "@/actions/document";
import { ContentRecord } from "@/types/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// A Section now represents a group with its own heading and content.
export type Section = {
  heading: string;
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
  // Additional types if needed.
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
  // initialContent is assumed to belong to the first section if provided.
  initialContent?: DocumentContent[];
  onChange?: (content: Section[]) => void;
  setIsDirty: (isDirty: boolean) => void;
  subTopicId: string;
}

type EditingIndex = { section: number; item: number | null };

const ContentEditor: React.FC<ContentEditorProps> = ({ initialContent = [], subTopicId, onChange, setIsDirty }) => {
  // Initialize sections: if initialContent exists, use it for the first section.
  const safeInitialContent = Array.isArray(initialContent) ? initialContent : [];
  const initialSections: Section[] = safeInitialContent.length > 0 
    ? [{ heading: "Add Heading", content: safeInitialContent }]
    : [{ heading: "Add Heading", content: [] }];
    
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [loading, setLoading] = useState<boolean>(safeInitialContent.length === 0);
  const [editingIndex, setEditingIndex] = useState<EditingIndex | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  // Deep clone for resetting.
  const [originalSections, setOriginalSections] = useState<Section[]>(JSON.parse(JSON.stringify(initialSections)));
  
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const richTextEditorRef = useRef<RichTextEditorRef | null>(null);
  const [tempCodeLanguage, setTempCodeLanguage] = useState<string>('javascript');
  const [tempQuoteAuthor, setTempQuoteAuthor] = useState<string>('');
  const [tempWarningType, setTempWarningType] = useState<'info' | 'warning' | 'error' | 'note' | 'tip'>('warning');
  const [tempWarningDesign, setTempWarningDesign] = useState<1 | 2>(1);

  // State for handling section deletion confirmation dialog.
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);

  // Check if any change exists.
  const isDirty = JSON.stringify(sections) !== JSON.stringify(originalSections);

  // Function to check if a section is dirty (edited)
  const isSectionDirty = (index: number) => {
    const originalSection = originalSections[index];
    const currentSection = sections[index];
    if (!originalSection) return true;
    return JSON.stringify(originalSection) !== JSON.stringify(currentSection);
  };

  // Function to delete a section
  const deleteSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
  };

  // Handle delete button click for a section.
  const handleDeleteSection = (index: number) => {
    if (isSectionDirty(index)) {
      setSectionToDelete(index);
    } else {
      deleteSection(index);
    }
  };

  // Fetch sections from the API if no initial content was provided.
  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetchBySubTopicId<ContentRecord>('contents', 'subtopic_id', subTopicId);
        if (response.success && response.data) {
          const record = Array.isArray(response.data) ? response.data[0] : response.data;
          setRecordId(record.id);
          let data = record.content_data;
          if (typeof data === "string") {
            try {
              data = JSON.parse(data);
            } catch {
              data = [];
            }
          }
          // Expect data to be an array of sections.
          const fetchedSections: Section[] = Array.isArray(data) ? data : [];
          setSections(fetchedSections);
          setOriginalSections(JSON.parse(JSON.stringify(fetchedSections)));
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    }
    if (safeInitialContent.length === 0) {
      fetchContent();
    } else {
      const initSections: Section[] = [{ heading: "Add Heading", content: safeInitialContent }];
      setSections(initSections);
      setOriginalSections(JSON.parse(JSON.stringify(initSections)));
    }
  }, [subTopicId]);

  // Notify parent on every change.
  useEffect(() => {
    if (onChange) {
      onChange(sections);
    }
  }, [sections, onChange]);

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
      const item = sections[editingIndex.section].content[editingIndex.item];
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

  // Add a new section.
  const addSection = () => {
    const newSection: Section = { heading: "Add Heading", content: [] };
    setSections([...sections, newSection]);
  };

  // Add new content to a specific section.
  const addContent = (sectionIndex: number, type: ContentType) => {
    const template = contentTemplates[type];
    const newContent = { 
      type, 
      content: JSON.parse(JSON.stringify(template.defaultContent))
    } as DocumentContent;
    const newSections = [...sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      content: [...newSections[sectionIndex].content, newContent]
    };
    setSections(newSections);
  };

  // Start editing a section's heading or a content item.
  const startEditing = (sectionIndex: number, itemIndex: number | null = null) => {
    if (editingIndex !== null) {
      saveCurrentEdit();
    }
    setEditingIndex({ section: sectionIndex, item: itemIndex });
  };

  const handleEdit = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveCurrentEdit();
    }
  };

  // Save the current edit.
  const saveCurrentEdit = () => {
    if (!editingIndex) return;
    const { section, item } = editingIndex;
    const newSections = [...sections];
    if (item === null && inputRef.current) {
      newSections[section] = { ...newSections[section], heading: inputRef.current.value };
    } else if (item !== null) {
      const contentItems = [...newSections[section].content];
      const contentItem = { ...contentItems[item] };
      if (contentItem.type === 'paragraph' && richTextEditorRef.current) {
        contentItem.content = { data: richTextEditorRef.current.getHTML() };
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
        contentItem.content = { data: inputRef.current.value };
      }
      contentItems[item] = contentItem;
      newSections[section] = { ...newSections[section], content: contentItems };
    }
    setSections(newSections);
    setEditingIndex(null);
  };

  // Delete a content item from a specific section.
  const deleteContent = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...sections];
    const contentItems = newSections[sectionIndex].content.filter((_, i) => i !== itemIndex);
    newSections[sectionIndex] = { ...newSections[sectionIndex], content: contentItems };
    setSections(newSections);
  };

  const handleReset = () => {
    setSections(JSON.parse(JSON.stringify(originalSections)));
  };

  const handleSave = async () => {
    try {
      if (recordId) {
        const response = await updateData<ContentRecord>('contents', recordId, { subtopic_id: subTopicId, content_data: sections });
        console.log(response);
        
      } else {
        const response = await submitData<ContentRecord>('contents', { subtopic_id: subTopicId, content_data: sections });
        if (response.success && response.data && response.data.length > 0) {
          setRecordId(response.data[0].id);
        }
      }
      setOriginalSections(JSON.parse(JSON.stringify(sections)));
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
      <div className="flex justify-end gap-2 mb-4">
      <Button 
        onClick={handleReset} 
        disabled={!isDirty}
        variant="outline"
        size="sm"
        className={`border ${!isDirty ? "bg-gray-200 text-gray-500" : "bg-gray-300 text-black hover:bg-gray-400"}`}
      >
        <RotateCcw size={14} />
        Reset
      </Button>

      <Button 
        onClick={handleSave} 
        disabled={!isDirty}
        size="sm"
        className={`border ${!isDirty ? "bg-gray-200 text-gray-500" : "bg-blue-600 text-white hover:bg-blue-700"}`}
      >
        <Save size={14} />
        Save
      </Button>
      </div>
      
      {/* Render all sections */}
      {sections.map((section, sIndex) => (
        <Card key={`section-${sIndex}`} className="group-one flex flex-col min-h-[50vh] mb-6 relative">
          <CardHeader className="pb-0">
            {editingIndex && editingIndex.section === sIndex && editingIndex.item === null ? (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                defaultValue={section.heading || ""}
                onKeyDown={handleEdit}
                onBlur={saveCurrentEdit}
                className="border rounded-sm p-2 text-2xl font-bold w-full"
              />
            ) : (
              <CardTitle 
                onClick={() => startEditing(sIndex, null)}
                className="cursor-pointer hover:ring-2 hover:ring-orange-500 p-2 rounded-sm text-2xl font-bold"
              >
                {section.heading || "Add Heading"}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-4">
            {section && section.content.length > 0 && section?.content?.map((item, i) => (
              <div key={`content-${sIndex}-${i}`} className="relative">
                {editingIndex && editingIndex.section === sIndex && editingIndex.item === i ? (
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
                    onClick={() => startEditing(sIndex, i)}
                    className="group cursor-pointer"
                  >
                    {(() => {
                      switch (item.type) {
                        case 'heading2':
                        case 'heading3':
                          return (
                            <div 
                              onDoubleClick={() => startEditing(sIndex, i)} 
                              className={`p-2 editor-ring ${item.type === 'heading2' ? 'text-xl font-semibold' : 'text-lg font-medium'}`}
                            >
                              {item.content.data}
                            </div>
                          );
                        case 'paragraph':
                          return (
                            <div 
                              onDoubleClick={() => startEditing(sIndex, i)} 
                              className="p-2 editor-ring" 
                              dangerouslySetInnerHTML={{ __html: item.content.data }}
                            ></div>
                          );
                        case 'codeBlock':
                          return (
                            <div 
                              className="editor-ring p-2" 
                              onDoubleClick={() => startEditing(sIndex, i)}
                            >
                              <CodeBlock content={item.content} />
                            </div>
                          );
                        case 'quote':
                          return (
                            <div 
                              className="editor-ring p-2" 
                              onDoubleClick={() => startEditing(sIndex, i)}
                            >
                              <QuotesBlock content={item.content} />
                            </div>
                          );
                        case 'warningBox':
                          return (
                            <div 
                              className="editor-ring p-2" 
                              onDoubleClick={() => startEditing(sIndex, i)}
                            >
                              <WarningBox content={item.content} />
                            </div>
                          );
                        default:
                          return null;
                      }
                    })()}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteContent(sIndex, i); }}
                      className="absolute -top-3 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete content"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            <Popover>
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
                      onClick={() => { addContent(sIndex, key as ContentType); }}
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
          {/* Trash icon delete button for the entire section */}
          <div className="absolute bottom-2 right-2 opacity-0 group-one-hover transition-opacity">
            <button 
              onClick={() => handleDeleteSection(sIndex)}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
              aria-label="Delete section"
            >
              <Trash size={16} />
            </button>
          </div>
        </Card>
      ))}
      
      {/* Bottom Add Section Button */}
      <button 
        onClick={addSection}
        className="w-full h-16 flex justify-center items-center border-2 border-dashed border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
      >
        <Plus className="h-6 w-6 mr-2" /> Add Section
      </button>

      {/* Confirmation Dialog for deleting a section */}
      {sectionToDelete !== null && (
        <Dialog open={true} onOpenChange={(open) => { if (!open) setSectionToDelete(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete Section</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this section? All unsaved changes will be lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <button 
                onClick={() => setSectionToDelete(null)} 
                className="px-4 py-2 bg-gray-300 rounded mr-2"
              >
                Cancel
              </button>
              <button 
                onClick={() => { if (sectionToDelete !== null) { deleteSection(sectionToDelete); setSectionToDelete(null); } }} 
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContentEditor;
