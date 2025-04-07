/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  AlertTriangle,
  AlignLeft,
  Code,
  Heading2,
  Heading3,
  Plus,
  Quote,
  RotateCcw,
  Save,
  X,
  Trash,
  GripVertical,
  Loader2,
  Youtube,
  ChevronDown,
  ChevronUp,
  Undo,
  Redo,
  Image as ImageIcon
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
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
import { fetchBySubTopicId, submitData, updateData } from "@/actions/document";
import { ContentRecord } from "@/types/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Loader from "@/components/common/Loader";
import YouTubeIframe from "@/components/shared/youtubeIframe";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { arrayMove } from "@dnd-kit/sortable";
import ImageBlock from "@/components/shared/ImageBlock";

// Extend allowed keys with extra types.
type ExtendedContentType = ContentType;

// Section type.
export interface Section {
  heading: string;
  content: (DocumentContent & { id: string })[];
  id: string;
}

// Extended template.
export interface ExtendedDocumentContent {
  icon: React.ReactElement;
  label: string;
  type: ExtendedContentType;
}

// ContentEditor props.
interface ContentEditorProps {
  initialContent?: DocumentContent[];
  onChange?: (content: Section[]) => void;
  setIsDirty: (isDirty: boolean) => void;
  type: 'blog' | 'doc'
  subTopicId: string;
}

// EditingIndex type.
interface EditingIndex {
  section: number;
  item: number | null;
}

// Content item type.
type ContentItem = DocumentContent & { id: string };

// Content templates.
const contentTemplates: Record<ExtendedContentType, ExtendedDocumentContent & { defaultContent: DocumentContent["content"] }> = {
  paragraph: {
    type: "paragraph",
    defaultContent: { data: "New paragraph content..." },
    icon: <AlignLeft />,
    label: "Paragraph"
  },
  heading2: {
    type: "heading2",
    defaultContent: { data: "New Heading 2" },
    icon: <Heading2 />,
    label: "Heading 2"
  },
  heading3: {
    type: "heading3",
    defaultContent: { data: "New Heading 3" },
    icon: <Heading3 />,
    label: "Heading 3"
  },
  codeBlock: {
    type: "codeBlock",
    defaultContent: {
      config: { language: "javascript" },
      data: "console.log('Hello World');"
    } as CodeBlockContent,
    icon: <Code />,
    label: "Code Block"
  },
  quote: {
    type: "quote",
    defaultContent: {
      config: { author: "" },
      data: "Inspirational quote here."
    } as QuotesBlockContent,
    icon: <Quote />,
    label: "Quotes"
  },
  warningBox: {
    type: "warningBox",
    defaultContent: {
      config: { type: "warning", design: 2 },
      data: "Warning message here..."
    } as WarningBoxContent,
    icon: <AlertTriangle />,
    label: "Box"
  },
  iframe: {
    type: "iframe",
    defaultContent: { data: "https://youtu.be/tzWQQov2zNk?si=l0VH67c3v_daBOqJ" },
    icon: <Youtube />,
    label: "Iframe"
  },
  image: {
    type: "image",
    defaultContent: { data: null },
    icon: <ImageIcon />,
    label: "Image"
  }
};

// Code languages.
interface CodeLanguage {
  value: string;
  label: string;
}
const codeLanguages: CodeLanguage[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
  { value: "shell", label: "Shell/Bash" }
];

// Warning types.
interface WarningType {
  value: "info" | "warning" | "error" | "note" | "tip";
  label: string;
}
const warningTypes: WarningType[] = [
  { value: "info", label: "Information" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
  { value: "note", label: "Note" },
  { value: "tip", label: "Tip" }
];

// Warning designs.
interface WarningDesign {
  value: 1 | 2;
  label: string;
}
const warningDesigns: WarningDesign[] = [
  { value: 1, label: "Design 1" },
  { value: 2, label: "Design 2" }
];

// ------------------------
// Common EditingActions component
// ------------------------
interface EditingActionsProps {
  onDelete: () => void;
  onCancel: () => void;
  onSave: () => void;
}
const EditingActions: React.FC<EditingActionsProps> = ({ onDelete, onCancel, onSave }) => (
  <div className="flex justify-between mt-2">
    <button
      onClick={onDelete}
      className="p-1 bg-red-500 text-white rounded-full"
      aria-label="Delete content"
    >
      <Trash size={18} />
    </button>
    <div className="flex gap-2">
      <button
        onClick={onCancel}
        className="px-3 py-1 bg-gray-300 rounded-sm text-sm"
        aria-label="Cancel editing"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        className="px-3 py-1 bg-blue-600 text-white rounded-sm text-sm"
        aria-label="Save changes"
      >
        Save
      </button>
    </div>
  </div>
);

// ------------------------
// SortableContentItem component
// ------------------------
interface SortableContentItemProps {
  section?: Section;
  index: number;
  item: ContentItem;
  startEditing: (sectionIndex: number, itemIndex: number | null) => void;
  sectionIndex: number;
  onDeleteClick: (sectionIndex: number, itemIndex: number) => void;
  isEditing: boolean;
}
const SortableContentItem: React.FC<SortableContentItemProps> = ({
  index,
  item,
  startEditing,
  sectionIndex,
  onDeleteClick,
  isEditing
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group box-border hover:border hover:border-dashed hover:border-blue-500"
    >
      {/* Floating button group: drag and delete buttons */} 
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <div {...attributes} {...listeners} className="cursor-move">
          <GripVertical size={18} className="text-gray-600 bg-white p-1 rounded-full shadow-md" />
        </div>
        {isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(sectionIndex, index);
            }}
            className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600"
            aria-label="Delete content"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div onClick={() => startEditing(sectionIndex, index)} className="cursor-pointer p-2 hover:bg-blue-50">
        {(() => {
          switch (item.type) {
            case "heading2":
            case "heading3":
              return (
                <div className={`p-2 ${item.type === "heading2" ? "text-xl font-semibold" : "text-lg font-medium"}`}>
                  <div className="relative">{item.content.data}</div>
                </div>
              );
            case "paragraph":
              return (
                <div className="p-2">
                  <div className="relative" dangerouslySetInnerHTML={{ __html: item.content.data }}></div>
                </div>
              );
            case "codeBlock":
              return (
                <div className="p-2">
                  <div className="relative"><CodeBlock content={item.content} /></div>
                </div>
              );
            case "quote":
              return (
                <div className="p-2">
                  <div className="relative"><QuotesBlock content={item.content} /></div>
                </div>
              );
            case "warningBox":
              return (
                <div className="p-2">
                  <div className="relative"><WarningBox content={item.content} /></div>
                </div>
              );
            case "iframe":
              return (
                <div className="p-2">
                  <div className="relative"><YouTubeIframe link={item.content.data} /></div>
                </div>
              );
            case "image":
              return (
                <div className="p-2">
                  <div className="relative"><ImageBlock content={item.content.data} /></div>
                </div>
              );
            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
};

// ------------------------
// SortableSection component with collapse/expand
// ------------------------
interface SortableSectionProps {
  section: Section;
  index: number;
  startEditing: (sectionIndex: number, itemIndex: number | null) => void;
  addContent: (sectionIndex: number, type: ExtendedContentType) => void;
  onDeleteClick: (sectionIndex: number) => void;
  onContentDelete: (sectionIndex: number, itemIndex: number) => void;
  contentItems: ContentItem[];
  handleContentDragEnd: (event: DragEndEvent, sectionIndex: number) => void;
  editingIndex: EditingIndex | null;
  saveCurrentEdit: () => void;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  richTextEditorRef: React.RefObject<RichTextEditorRef | null>;
  tempCodeLanguage: string;
  setTempCodeLanguage: (lang: string) => void;
  tempQuoteAuthor: string;
  setTempQuoteAuthor: (author: string) => void;
  tempWarningType: "info" | "warning" | "error" | "note" | "tip";
  setTempWarningType: (type: "info" | "warning" | "error" | "note" | "tip") => void;
  tempWarningDesign: 1 | 2;
  setTempWarningDesign: (design: 1 | 2) => void;
  collapsed: Record<string, boolean>;
  setCollapsed: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}
const SortableSection: React.FC<SortableSectionProps> = ({
  section,
  index,
  startEditing,
  addContent,
  onDeleteClick,
  onContentDelete,
  contentItems,
  handleContentDragEnd,
  editingIndex,
  saveCurrentEdit,
  inputRef,
  richTextEditorRef,
  tempCodeLanguage,
  setTempCodeLanguage,
  tempQuoteAuthor,
  setTempQuoteAuthor,
  tempWarningType,
  setTempWarningType,
  tempWarningDesign,
  setTempWarningDesign,
  collapsed,
  setCollapsed
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  const contentItemIds: string[] = contentItems.map((item) => item.id);
  return (
    <div ref={setNodeRef} style={style} className="editor-styles relative box-border">
      <Card className="group flex flex-col mb-6 relative w-full box-border hover:border hover:border-dashed hover:border-blue-500">
        <CardHeader className="pb-0 relative flex items-center justify-between">
          {editingIndex && editingIndex.section === index && editingIndex.item === null ? (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              defaultValue={section.heading || ""}
              onKeyDown={(e) => { if (e.key === "Enter") saveCurrentEdit(); }}
              onBlur={saveCurrentEdit}
              className="border rounded-sm p-2 text-2xl font-bold w-full hover:border hover:border-dashed hover:border-orange-500 box-border"
              aria-label="Edit section heading"
            />
          ) : (
            <CardTitle
              onClick={() => startEditing(index, null)}
              className="cursor-pointer p-2 rounded-sm text-2xl font-bold w-full hover:bg-orange-50 hover:border hover:border-dashed hover:border-orange-500 box-border"
            >
              {section.heading || "Add Heading"}
            </CardTitle>
          )}
          <button
            onClick={() =>
              setCollapsed((prev) => ({
                ...prev,
                [section.id]: !prev[section.id]
              }))
            }
            className="ml-2 p-1"
            aria-label="Toggle collapse"
          >
            {collapsed[section.id] ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </CardHeader>
        {!collapsed[section.id] && (
          <CardContent className="flex flex-col gap-2 pt-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => handleContentDragEnd(event, index)}>
              <SortableContext items={contentItemIds} strategy={verticalListSortingStrategy}>
                {contentItems.map((item, i) => {
                  const isEditing = editingIndex && editingIndex.section === index && editingIndex.item === i;
                  return (
                    <div key={item.id} className="rounded-sm relative mb-2 box-border hover:border hover:border-dashed hover:border-blue-500">
                      {isEditing ? (
                        <div className="border border-dashed border-blue-500 p-2 box-border">
                          {(() => {
                            switch (item.type) {
                              case "paragraph":
                                return (
                                  <div className="editor-container">
                                    <RichTextEditor
                                      ref={richTextEditorRef}
                                      defaultValue={item.content.data}
                                      placeholder="Start typing..."
                                      className="border box-border"
                                    />
                                    <EditingActions
                                      onDelete={() => onContentDelete(index, i)}
                                      onCancel={() => startEditing(index, null)}
                                      onSave={saveCurrentEdit}
                                    />
                                  </div>
                                );
                              case "codeBlock":
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
                                      onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) saveCurrentEdit(); }}
                                      className="w-full h-40 font-mono text-sm p-2 border rounded-sm box-border"
                                    />
                                    <EditingActions
                                      onDelete={() => onContentDelete(index, i)}
                                      onCancel={() => startEditing(index, null)}
                                      onSave={saveCurrentEdit}
                                    />
                                  </div>
                                );
                              case "quote":
                                return (
                                  <div className="space-y-3">
                                    <div className="space-y-2">
                                      <Label htmlFor="quote-author">Author</Label>
                                      <input
                                        id="quote-author"
                                        value={tempQuoteAuthor}
                                        onChange={(e) => setTempQuoteAuthor(e.target.value)}
                                        className="w-full p-2 border rounded-sm box-border"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="quote-content">Quote Content</Label>
                                      <textarea
                                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                                        id="quote-content"
                                        defaultValue={(item.content as QuotesBlockContent).data}
                                        className="w-full h-20 p-2 border rounded-sm box-border"
                                      />
                                    </div>
                                    <EditingActions
                                      onDelete={() => onContentDelete(index, i)}
                                      onCancel={() => startEditing(index, null)}
                                      onSave={saveCurrentEdit}
                                    />
                                  </div>
                                );
                              case "warningBox":
                                return (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-2">
                                        <Label htmlFor="warning-type">Box Type</Label>
                                        <Select value={tempWarningType} onValueChange={(value) => setTempWarningType(value as "info" | "warning" | "error" | "note" | "tip")}>
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
                                        <Select value={tempWarningDesign.toString()} onValueChange={(value) => setTempWarningDesign(parseInt(value) as 1 | 2)}>
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
                                        className="w-full h-20 p-2 border rounded-sm box-border"
                                      />
                                    </div>
                                    <EditingActions
                                      onDelete={() => onContentDelete(index, i)}
                                      onCancel={() => startEditing(index, null)}
                                      onSave={saveCurrentEdit}
                                    />
                                  </div>
                                );
                              default:
                                return (
                                  <div>
                                    <input
                                      ref={inputRef as React.RefObject<HTMLInputElement>}
                                      defaultValue={(item.content as { data: string }).data}
                                      onKeyDown={(e) => { if (e.key === "Enter") saveCurrentEdit(); }}
                                      className="w-full border rounded-sm p-2 box-border"
                                    />
                                    <EditingActions
                                      onDelete={() => onContentDelete(index, i)}
                                      onCancel={() => startEditing(index, null)}
                                      onSave={saveCurrentEdit}
                                    />
                                  </div>
                                );
                            }
                          })()}
                        </div>
                      ) : (
                        <SortableContentItem
                          section={section}
                          index={i}
                          item={item}
                          startEditing={startEditing}
                          sectionIndex={index}
                          onDeleteClick={onContentDelete}
                          isEditing={false}
                        />
                      )}
                    </div>
                  );
                })}
              </SortableContext>
            </DndContext>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full h-12 flex justify-center items-center border border-dashed border-gray-300 rounded-sm hover:bg-gray-100 transition-colors" aria-label="Add content">
                  <Plus className="h-4 w-4 mr-2" /> Add Content
                </button>
              </PopoverTrigger>
              <PopoverContent className="grid grid-cols-2 gap-2 p-2">
                {Object.entries(contentTemplates)
                  .filter(([key]) => ["paragraph", "heading2", "heading3", "codeBlock", "quote", "warningBox", "iframe","image"].includes(key))
                  .map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => {
                        addContent(index, key as ExtendedContentType);
                      }}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-sm transition-colors duration-200"
                      aria-label={`Add ${template.label}`}
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
        )}
        <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 pr-2 z-20">
          <div {...attributes} {...listeners} className="cursor-grab">
            <GripVertical size={20} className="text-gray-600" />
          </div>
          <button
            onClick={() => onDeleteClick(index)}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md"
            aria-label="Delete section"
          >
            <Trash size={20} />
          </button>
        </div>
      </Card>
    </div>
  );
};

// ------------------------
// Main ContentEditor component with Undo/Redo and collapse/expand
// ------------------------
const ContentEditor: React.FC<ContentEditorProps> = ({ initialContent = [], subTopicId, type, onChange, setIsDirty }) => {
  const safeInitialContent: DocumentContent[] = Array.isArray(initialContent) ? initialContent : [];
  const generateId = (): string => `id-${Math.random().toString(36).substring(2, 9)}`;
  const initialSections = safeInitialContent.length > 0
    ? [{ heading: "Add Heading", content: safeInitialContent.map(item => ({ ...item, id: generateId() })), id: generateId() }]
    : [{ heading: "Add Heading", content: [], id: generateId() }];

  // History for undo/redo.
  const [history, setHistory] = useState<Section[][]>([initialSections]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [loading, setLoading] = useState<boolean>(safeInitialContent.length === 0);
  const [editingIndex, setEditingIndex] = useState<EditingIndex | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [originalSections, setOriginalSections] = useState<Section[]>(JSON.parse(JSON.stringify(initialSections)));
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const richTextEditorRef = useRef<RichTextEditorRef | null>(null);
  const [tempCodeLanguage, setTempCodeLanguage] = useState<string>("javascript");
  const [tempQuoteAuthor, setTempQuoteAuthor] = useState<string>("");
  const [tempWarningType, setTempWarningType] = useState<"info" | "warning" | "error" | "note" | "tip">("warning");
  const [tempWarningDesign, setTempWarningDesign] = useState<1 | 2>(1);
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);
  const [contentToDelete, setContentToDelete] = useState<{ sectionIndex: number; itemIndex: number } | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const isDirty: boolean = JSON.stringify(sections) !== JSON.stringify(originalSections);
  const isSectionDirty = (index: number): boolean => {
    const originalSection = originalSections[index];
    const currentSection = sections[index];
    if (!originalSection) return true;
    return JSON.stringify(originalSection) !== JSON.stringify(currentSection);
  };
  const isUndoRedoRef = useRef(false);
  useEffect(() => {
    if (!isUndoRedoRef.current) {
      setHistory((prev) => {
        const last = prev[prev.length - 1];
        if (JSON.stringify(last) !== JSON.stringify(sections)) {
          const newHistory = [...prev.slice(0, historyIndex + 1), sections];
          setHistoryIndex(newHistory.length - 1);
          return newHistory;
        }
        return prev;
      });
    } else {
      isUndoRedoRef.current = false;
    }
  }, [sections]);
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      isUndoRedoRef.current = true;
      setHistoryIndex(newIndex);
      setSections(history[newIndex]);
    }
  };
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      isUndoRedoRef.current = true;
      setHistoryIndex(newIndex);
      setSections(history[newIndex]);
    }
  };
  const deleteSection = (index: number): void => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
    setSectionToDelete(null);
  };
  const deleteContent = (sectionIndex: number, itemIndex: number): void => {
    const newSections = [...sections];
    const contentItems = newSections[sectionIndex].content.filter((_, i) => i !== itemIndex);
    newSections[sectionIndex] = { ...newSections[sectionIndex], content: contentItems };
    setSections(newSections);
    setContentToDelete(null);
  };
  const handleDeleteSection = (index: number): void => {
    setSectionToDelete(index);
  };
  const handleDeleteContent = (sectionIndex: number, itemIndex: number): void => {
    setContentToDelete({ sectionIndex, itemIndex });
  };
  useEffect(() => {
    const fetchContent = async (): Promise<void> => {
      try {
        const response = await fetchBySubTopicId<ContentRecord>("contents", "ref_id", subTopicId);
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
          const processedSections: Section[] = Array.isArray(data)
            ? data.map((section: any) => ({
              ...section,
              id: section.id || generateId(),
              content: Array.isArray(section.content)
                ? section.content.map((item: any) => ({
                  ...item,
                  id: item.id || generateId()
                }))
                : []
            }))
            : [];
          setSections(processedSections);
          setOriginalSections(JSON.parse(JSON.stringify(processedSections)));
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };
    if (safeInitialContent.length === 0) {
      fetchContent();
    }
  }, [subTopicId, safeInitialContent.length]);
  useEffect(() => {
    if (onChange) {
      onChange(sections);
    }
    setIsDirty(isDirty);
  }, [sections, onChange, setIsDirty, isDirty]);
  useEffect(() => {
    if (editingIndex !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingIndex]);
  useEffect(() => {
    if (editingIndex?.item !== null && editingIndex?.item !== undefined) {
      const item = sections[editingIndex.section].content[editingIndex.item];
      if (item?.type === "codeBlock") {
        setTempCodeLanguage(item.content.config.language || "javascript");
      } else if (item?.type === "quote") {
        setTempQuoteAuthor(item.content.config.author || "");
      } else if (item?.type === "warningBox") {
        setTempWarningType(item.content.config.type);
        setTempWarningDesign(item.content.config.design);
      }
    }
  }, [editingIndex, sections]);
  const addSection = (): void => {
    const newSection = {
      heading: "Add Heading",
      content: [],
      id: generateId()
    };
    setSections([...sections, newSection]);
  };
  const addContent = (sectionIndex: number, type: ExtendedContentType): void => {
    const template = contentTemplates[type];
    const newContent: ContentItem = {
      type,
      content: JSON.parse(JSON.stringify(template.defaultContent)),
      id: generateId()
    };
    const newSections = [...sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      content: [...newSections[sectionIndex].content, newContent]
    };
    setSections(newSections);
  };
  const startEditing = (sectionIndex: number, itemIndex: number | null = null): void => {
    if (editingIndex !== null) {
      saveCurrentEdit();
    }
    setEditingIndex({ section: sectionIndex, item: itemIndex });
  };
  const saveCurrentEdit = (): void => {
    if (!editingIndex) return;
    const { section, item } = editingIndex;
    const newSections = [...sections];
    if (item === null && inputRef.current) {
      newSections[section] = { ...newSections[section], heading: inputRef.current.value };
    } else if (item !== null) {
      const contentItems = [...newSections[section].content];
      const contentItem = { ...contentItems[item] };
      if (contentItem.type === "paragraph" && richTextEditorRef.current) {
        contentItem.content = { data: richTextEditorRef.current.getHTML() };
      } else if (contentItem.type === "codeBlock") {
        if (inputRef.current) {
          (contentItem.content as CodeBlockContent).data = inputRef.current.value;
        }
        (contentItem.content as CodeBlockContent).config.language = tempCodeLanguage;
      } else if (contentItem.type === "quote") {
        if (inputRef.current) {
          (contentItem.content as QuotesBlockContent).data = inputRef.current.value;
        }
        (contentItem.content as QuotesBlockContent).config.author = tempQuoteAuthor;
      } else if (contentItem.type === "warningBox") {
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
  const handleReset = (): void => {
    setSections(JSON.parse(JSON.stringify(originalSections)));
  };
  const handleSave = async (): Promise<void> => {
    try {
      setIsSaving(true);
      if (recordId) {
        const response = await updateData<ContentRecord>("contents", recordId, { ref_id: subTopicId, content_data: sections });
        console.log(response);
      } else {
        const response = await submitData<ContentRecord>("contents", { ref_id: subTopicId, content_data: sections });
        if (response.success && response.data && response.data.length > 0) {
          setRecordId(response.data[0].id);
        }
      }
      setOriginalSections(JSON.parse(JSON.stringify(sections)));
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setIsSaving(false);
    }
  };
  const handleSectionDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((sections) => {
        const oldIndex = sections.findIndex(section => section.id === active.id);
        const newIndex = sections.findIndex(section => section.id === over.id);
        return arrayMove(sections, oldIndex, newIndex);
      });
    }
  };
  const handleContentDragEnd = (event: DragEndEvent, sectionIndex: number): void => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((sections) => {
        const newSections = [...sections];
        const section = { ...newSections[sectionIndex] };
        const oldIndex = section.content.findIndex(item => item.id === active.id);
        const newIndex = section.content.findIndex(item => item.id === over.id);
        section.content = arrayMove(section.content, oldIndex, newIndex);
        newSections[sectionIndex] = section;
        return newSections;
      });
    }
  };
  if (loading) {
    return <Loader />;
  }
  const sectionIds: string[] = sections.map(section => section.id);
  return (
    <div className="relative flex-1 flex flex-col gap-4 bg-fixed bg-[url('/grid-pattern.svg')] bg-cover box-border">
      <div className="flex h-12 items-center justify-end gap-2 mb-4 bg-white sticky top-16 z-50 p-4 box-border">
        <Button
          onClick={undo}
          disabled={historyIndex === 0}
          size="sm"
          variant="ghost"
          className="p-2 bg-transparent rounded-full text-black hover:bg-gray-400"
        >
          <Undo />
        </Button>
        <Button
          onClick={redo}
          disabled={historyIndex === history.length - 1}
          size="sm"
          variant="ghost"
          className="p-2 bg-transparent rounded-full text-black hover:bg-gray-400"
        >
          <Redo />
        </Button>
        <Button onClick={handleReset} disabled={!isDirty || isSaving} variant="outline" size="sm" className={`border ${!isDirty ? "bg-gray-200 text-gray-500" : "bg-gray-300 text-black hover:bg-gray-400"}`}>
          <RotateCcw size={14} className="mr-1" />
          Reset
        </Button>
        <Button onClick={handleSave} disabled={!isDirty || isSaving} size="sm" className={`border ${!isDirty ? "bg-gray-200 text-gray-500" : "bg-green-600 text-white hover:bg-green-700"}`}>
          {isSaving ? (
            <>
              <Loader2 size={14} className="mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={14} className="mr-1" />
              Save
            </>
          )}
        </Button>
      </div>
      <div className={`p-4 ${type === 'blog' ? 'w-full max-w-6xl' : 'w-[calc(100vw-(24rem))]'} mx-auto mb-4 box-border`}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
          <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
            {sections.map((section, sIndex) => (
              <SortableSection
                key={section.id}
                section={section}
                index={sIndex}
                startEditing={startEditing}
                addContent={addContent}
                onDeleteClick={handleDeleteSection}
                onContentDelete={handleDeleteContent}
                contentItems={section.content}
                handleContentDragEnd={handleContentDragEnd}
                editingIndex={editingIndex}
                saveCurrentEdit={saveCurrentEdit}
                inputRef={inputRef}
                richTextEditorRef={richTextEditorRef}
                tempCodeLanguage={tempCodeLanguage}
                setTempCodeLanguage={setTempCodeLanguage}
                tempQuoteAuthor={tempQuoteAuthor}
                setTempQuoteAuthor={setTempQuoteAuthor}
                tempWarningType={tempWarningType}
                setTempWarningType={setTempWarningType}
                tempWarningDesign={tempWarningDesign}
                setTempWarningDesign={setTempWarningDesign}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
              />
            ))}
          </SortableContext>
        </DndContext>
        <button onClick={addSection} className="w-full h-16 flex justify-center items-center border-2 border-dashed border-gray-300 rounded-sm hover:bg-gray-50 transition-colors box-border">
          <Plus className="h-6 w-6 mr-2" /> Add Section
        </button>
      </div>
      {sectionToDelete !== null && (
        <Dialog open={true} onOpenChange={(open) => { if (!open) setSectionToDelete(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete Section</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this section? {isSectionDirty(sectionToDelete) && "All unsaved changes will be lost."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <button onClick={() => setSectionToDelete(null)} className="px-4 py-2 bg-gray-300 rounded mr-2">
                Cancel
              </button>
              <button onClick={() => deleteSection(sectionToDelete)} className="px-4 py-2 bg-red-500 text-white rounded">
                Delete
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {contentToDelete !== null && (
        <Dialog open={true} onOpenChange={(open) => { if (!open) setContentToDelete(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete Content</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this content item? {isSectionDirty(contentToDelete.sectionIndex) && "All unsaved changes will be lost."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <button onClick={() => setContentToDelete(null)} className="px-4 py-2 bg-gray-300 rounded mr-2">
                Cancel
              </button>
              <button onClick={() => deleteContent(contentToDelete.sectionIndex, contentToDelete.itemIndex)} className="px-4 py-2 bg-red-500 text-white rounded">
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
