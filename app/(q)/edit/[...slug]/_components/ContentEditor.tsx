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
  Minus,
  Image as ImageIcon,
  ArrowLeft
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  DocumentContent,
  ContentType,
  CodeBlockContent,
  QuotesBlockContent,
  WarningBoxContent,
  CodeFile,
  ImageBlockContent
} from "@/types";
import CodeBlock from "@/components/shared/CodeBlock";
import QuotesBlock from "@/components/shared/QuotesBlock";
import WarningBox from "@/components/shared/WarningBox";
import RichTextEditor, { RichTextEditorRef } from "@/components/shared/RichTextEditor";
import { fetchTopics, fetchContentByRef, saveContent } from "@/actions/document";
import { ContentRecord } from "@/types/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Loader from "@/components/common/Loader";
import YouTubeIframe from "@/components/shared/youtubeIframe";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { PadEditor } from "./PadEditor";
import GoToTop from "@/app/(q)/_components/GoToTop";
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
// import MainContent from "@/components/common/Content";

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
  type: 'docs' | 'posts'
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
  },
  divider: {
    type: "divider",
    defaultContent: { data: null },
    icon: <Minus />,
    label: "Divider"
  }
};

// Code languages.
interface CodeLanguage {
  value: string;
  label: string;
}
const codeLanguages: CodeLanguage[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "json", label: "JSON" },
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
// Medium-style Floating Menu
// ------------------------
const MediumTemplateMenu = ({ onSelect }: { onSelect: (type: ExtendedContentType) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 group/menu">
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`w-9 h-9 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-45 border-slate-900 bg-slate-50 dark:bg-slate-800' : ''} hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm`}
      >
        <Plus size={20} className="text-slate-500" />
      </button>

      <div
        className={`flex items-center gap-2 overflow-hidden transition-all duration-500 ${isOpen ? 'max-w-md opacity-100 ml-2' : 'max-w-0 opacity-0'}`}
      >
        {[
          { type: 'paragraph', icon: <AlignLeft size={18} />, label: 'Paragraph' },
          { type: 'heading2', icon: <Heading2 size={18} />, label: 'Heading 2' },
          { type: 'heading3', icon: <Heading3 size={18} />, label: 'Heading 3' },
          { type: 'image', icon: <ImageIcon size={18} />, label: 'Image' },
          { type: 'iframe', icon: <Youtube size={18} />, label: 'Video' },
          { type: 'codeBlock', icon: <Code size={18} />, label: 'Code' },
          { type: 'quote', icon: <Quote size={18} />, label: 'Quote' },
          { type: 'warningBox', icon: <AlertTriangle size={18} />, label: 'Box' },
          { type: 'divider', icon: <Minus size={18} />, label: 'Divider' },
        ].map((item) => (
          <button
            key={item.type}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item.type as ExtendedContentType);
              setIsOpen(false);
            }}
            title={item.label}
            className="w-8 h-8 rounded-full border border-green-500 flex items-center justify-center text-green-600 hover:bg-green-50 bg-white transition-colors shadow-sm"
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

// ------------------------
// Common EditingActions component
// ------------------------
interface EditingActionsProps {
  onDelete: () => void;
  onCancel: () => void;
  onSave: () => void;
}
const EditingActions: React.FC<EditingActionsProps> = ({ onDelete, onCancel, onSave }) => (
  <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
    <button
      onClick={onDelete}
      className="p-2 transition-colors text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"
      title="Delete block"
    >
      <Trash size={18} />
    </button>
    <div className="flex gap-3">
      <button
        onClick={onCancel}
        className="px-4 py-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        className="px-6 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium transition-all shadow-md active:scale-95"
      >
        Save Block
      </button>
    </div>
  </div>
);

// ------------------------
// SortableContentItem component
// ------------------------
interface SortableContentItemProps {
  item: ContentItem;
  index: number;
  startEditing: (sectionIndex: number, itemIndex: number) => void;
  sectionIndex: number;
  onDeleteClick: (sectionIndex: number, itemIndex: number) => void;
  isEditing: boolean;
  addContent: (sectionIndex: number, type: ExtendedContentType, atIndex?: number) => void;
}

const SortableContentItem: React.FC<SortableContentItemProps> = ({
  item,
  index,
  startEditing,
  sectionIndex,
  onDeleteClick,
  isEditing,
  addContent
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className="group/content relative">
      {/* Floating UI on hover */}
      <div className="absolute -left-12 top-0 bottom-0 flex items-start pt-2 opacity-0 group-hover/content:opacity-100 transition-all duration-300">
        <div className="flex flex-col gap-3">
          <MediumTemplateMenu onSelect={(type) => addContent(sectionIndex, type, index + 1)} />
          <div {...attributes} {...listeners} className="w-9 h-9 flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 transition-colors">
            <GripVertical size={20} />
          </div>
        </div>
      </div>

      <div
        onClick={() => startEditing(sectionIndex, index)}
        className={`cursor-text transition-all duration-300 relative px-4 py-2 ${isEditing ? 'z-30' : 'hover:bg-slate-50/50 rounded-lg'}`}
      >
        {(() => {
          switch (item.type) {
            case "heading2": return <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-6 mt-8">{item.content.data}</h2>;
            case "heading3": return <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-4 mt-6">{item.content.data}</h3>;
            case "paragraph": return <div className="text-xl leading-relaxed font-normal text-slate-700 dark:text-slate-300 font-serif mb-4" dangerouslySetInnerHTML={{ __html: item.content.data }} />;
            case "codeBlock": return <div className="my-8"><CodeBlock content={item.content} /></div>;
            case "quote": return <div className="my-8"><QuotesBlock content={item.content} /></div>;
            case "warningBox": return <div className="my-6"><WarningBox content={item.content} /></div>;
            case "iframe": return <div className="my-8 rounded-xl overflow-hidden shadow-lg border dark:border-slate-800"><YouTubeIframe link={item.content.data} /></div>;
            case "image": return <div className="my-10"><ImageBlock content={item.content} /></div>;
            case "divider": return <div className="py-12"><hr className="border-slate-200 dark:border-slate-800 w-1/4 mx-auto border-2" /></div>;
            default: return null;
          }
        })()}
      </div>
    </div>
  );
};

// ------------------------
// SortableSection component with collapse/expand
// ------------------------
// SortableSection was removed in favor of direct rendering in ContentEditor for a single-page Medium-style experience.

// ------------------------
// Main ContentEditor component with Undo/Redo and collapse/expand
// ------------------------
const ContentEditor: React.FC<ContentEditorProps> = ({ initialContent = [], subTopicId, type, onChange, setIsDirty }) => {
  const safeInitialContent: DocumentContent[] = Array.isArray(initialContent) ? initialContent : [];
  const generateId = (): string => `id-${Math.random().toString(36).substring(2, 9)}`;

  // We simplify everything to ONE section.
  const initialSections: Section[] = [{
    heading: "",
    content: safeInitialContent.map(item => ({ ...item, id: generateId() })),
    id: generateId()
  }];

  // History for undo/redo.
  const [history, setHistory] = useState<Section[][]>([initialSections]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [loading, setLoading] = useState<boolean>(safeInitialContent.length === 0);
  const [editingIndex, setEditingIndex] = useState<EditingIndex | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [originalSections, setOriginalSections] = useState<Section[]>(JSON.parse(JSON.stringify(initialSections)));
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const richTextEditorRef = useRef<RichTextEditorRef | null>(null);
  const [tempCodeLanguage, setTempCodeLanguage] = useState<string>("javascript");
  const [tempCodeFiles, setTempCodeFiles] = useState<CodeFile[]>([]);
  const [tempImageConfig, setTempImageConfig] = useState<ImageBlockContent["config"]>({});
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [tempQuoteAuthor, setTempQuoteAuthor] = useState<string>("");
  const [tempWarningType, setTempWarningType] = useState<"info" | "warning" | "error" | "note" | "tip">("warning");
  const [tempWarningDesign, setTempWarningDesign] = useState<1 | 2>(1);
  const [contentToDelete, setContentToDelete] = useState<{ sectionIndex: number; itemIndex: number } | null>(null);
  const [mode, setMode] = useState<'block' | 'pad'>('block');
  const [padContent, setPadContent] = useState<string>('');
  const [encodedPadContent, setEncodedPadContent] = useState<string>('');

  const processPadContent = (content: string): void => {
    try {
      const utf8Content = encodeURIComponent(content).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));
      const encoded = btoa(utf8Content);
      setEncodedPadContent(encoded);
      setPadContent(content);
    } catch (e) {
      console.error("Failed to encode pad content", e);
    }
  }
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
  const deleteSection = (): void => {
    // Disabled in single section mode
  };
  const deleteContent = (sectionIndex: number, itemIndex: number): void => {
    const newSections = [...sections];
    const contentItems = newSections[sectionIndex].content.filter((_, i) => i !== itemIndex);
    newSections[sectionIndex] = { ...newSections[sectionIndex], content: contentItems };
    setSections(newSections);
    setContentToDelete(null);
    setEditingIndex(null);
  };
  const handleDeleteSection = (): void => {
    // Disabled
  };
  const handleDeleteContent = (sectionIndex: number, itemIndex: number): void => {
    setContentToDelete({ sectionIndex, itemIndex });
  };
  useEffect(() => {
    const fetchContent = async (): Promise<void> => {
      try {
        let response = await fetchContentByRef(type, subTopicId);
        let record = response.data;

        if (response.success && record) {
          setRecordId(record.id);
          let data = record.content_data;
          if (typeof data === "string") {
            try {
              data = JSON.parse(data);
            } catch {
              data = [];
            }
          }

          const incomingData = (Array.isArray(data) ? data : []) as any[];
          let processedSections: Section[] = [];

          if (incomingData.length > 0) {
            // Detect if it's Array<Item> or Array<Section>
            const isNakedItems = !incomingData[0].hasOwnProperty('content');

            if (isNakedItems) {
              processedSections = [{
                id: generateId(),
                heading: "",
                content: incomingData.map(item => ({
                  ...item,
                  id: item.id || generateId()
                }))
              }];
            } else {
              processedSections = incomingData.map(sec => ({
                id: sec.id || generateId(),
                heading: sec.heading || "",
                content: (sec.content || []).map((item: any) => ({
                  ...item,
                  id: item.id || generateId()
                }))
              }));
            }
          }

          if (processedSections.length === 0) {
            processedSections = [{
              id: generateId(),
              heading: "",
              content: []
            }];
          }

          setSections(processedSections);
          setOriginalSections(JSON.parse(JSON.stringify(processedSections)));
          setHistory([processedSections]);
          setHistoryIndex(0);
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
        setTempCodeFiles(item.content.files || []);
      } else if (item?.type === "quote") {
        setTempQuoteAuthor(item.content.config.author || "");
      } else if (item?.type === "warningBox") {
        setTempWarningType(item.content.config.type);
        setTempWarningDesign(item.content.config.design);
      } else if (item?.type === "image") {
        setTempImageConfig(item.content.config || {});
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
  const addContent = (sectionIndex: number, type: ExtendedContentType, atIndex?: number): void => {
    const template = contentTemplates[type];
    const newContentItem: ContentItem = {
      type,
      content: JSON.parse(JSON.stringify(template.defaultContent)),
      id: generateId()
    };
    const newSections = [...sections];
    const sectionContent = [...newSections[sectionIndex].content];

    if (atIndex !== undefined) {
      sectionContent.splice(atIndex, 0, newContentItem);
    } else {
      sectionContent.push(newContentItem);
    }

    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      content: sectionContent
    };
    setSections(newSections);

    const finalIndex = atIndex !== undefined ? atIndex : sectionContent.length - 1;
    startEditing(sectionIndex, finalIndex);
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

    if (item === null) {
      newSections[section] = { ...newSections[section], heading: (inputRef.current as any)?.value || "" };
    } else {
      const contentItems = [...newSections[section].content];
      const contentItem = { ...contentItems[item] };

      if (contentItem.type === "paragraph" && richTextEditorRef.current) {
        contentItem.content = { data: richTextEditorRef.current.getHTML() };
      } else if (contentItem.type === "codeBlock") {
        if (inputRef.current && tempCodeFiles.length === 0) {
          (contentItem.content as CodeBlockContent).data = inputRef.current.value;
        }
        (contentItem.content as CodeBlockContent).config.language = tempCodeLanguage;
        (contentItem.content as CodeBlockContent).files = tempCodeFiles;
      } else if (contentItem.type === "quote") {
        if (inputRef.current) (contentItem.content as QuotesBlockContent).data = inputRef.current.value;
        (contentItem.content as QuotesBlockContent).config.author = tempQuoteAuthor;
      } else if (contentItem.type === "warningBox") {
        if (inputRef.current) (contentItem.content as WarningBoxContent).data = inputRef.current.value;
        (contentItem.content as WarningBoxContent).config.type = tempWarningType;
        (contentItem.content as WarningBoxContent).config.design = tempWarningDesign;
      } else if (contentItem.type === "image") {
        if (inputRef.current) (contentItem.content as ImageBlockContent).data = inputRef.current.value;
        (contentItem.content as ImageBlockContent).config = tempImageConfig;
      } else if (["heading2", "heading3", "iframe"].includes(contentItem.type)) {
        if (inputRef.current) contentItem.content = { data: inputRef.current.value };
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
      const response = await saveContent(type, subTopicId, sections, recordId || undefined);
      if (response.success && response.data) {
        setRecordId(response.data.id);
      }
      setOriginalSections(JSON.parse(JSON.stringify(sections)));
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setIsSaving(false);
    }
  };
  const handleSectionDragEnd = (): void => {
    // Section drag is disabled in simplified mode.
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
  return (
    <div className="relative flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-950 min-h-screen box-border">
      {/* Top sticky tool bar */}
      <div className="h-16 flex items-center justify-between gap-4 px-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />
          <Tabs value={mode} onValueChange={v => setMode(v as 'block' | 'pad')} className="w-[140px]">
            <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
              <TabsTrigger value="block" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">Canvas</TabsTrigger>
              <TabsTrigger value="pad" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">Pad</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2" />
          <div className="flex items-center gap-1">
            <Button onClick={undo} disabled={historyIndex <= 0} size="icon" variant="ghost" className="h-8 w-8 text-slate-600 dark:text-slate-400"><Undo size={18} /></Button>
            <Button onClick={redo} disabled={historyIndex >= history.length - 1} size="icon" variant="ghost" className="h-8 w-8 text-slate-600 dark:text-slate-400"><Redo size={18} /></Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleReset} disabled={!isDirty || isSaving} variant="ghost" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
            <RotateCcw size={16} className="mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!isDirty || isSaving} className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 shadow-md transition-all active:scale-95">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="mr-2" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
      {mode === 'block' && sections.length > 0 && (
        <div className="w-full max-w-4xl mx-auto px-12 py-24 min-h-screen bg-white dark:bg-slate-900 shadow-xl border-x border-slate-100 dark:border-slate-800 transition-colors">
          {sections.map((section, sIdx) => (
            <div key={section.id} className="mb-20 last:mb-0">
              {/* Section Heading */}
              <div className="mb-10 group/section relative">
                <textarea
                  ref={editingIndex?.section === sIdx && editingIndex?.item === null ? (inputRef as any) : null}
                  defaultValue={section.heading || ""}
                  placeholder={sIdx === 0 ? "Article Title" : "Section Heading"}
                  className={`w-full font-serif font-bold text-slate-900 dark:text-slate-50 placeholder:text-slate-100 dark:placeholder:text-slate-800 border-none focus:ring-0 resize-none bg-transparent leading-tight ${sIdx === 0 ? 'text-6xl' : 'text-4xl'}`}
                  onFocus={() => startEditing(sIdx, null)}
                  onBlur={saveCurrentEdit}
                  rows={1}
                  onChange={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                />
                {sIdx > 0 && (
                  <button
                    onClick={() => {
                      const newSections = sections.filter((_, i) => i !== sIdx);
                      setSections(newSections);
                    }}
                    className="absolute -left-12 top-2 opacity-0 group-hover/section:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                    title="Remove Section"
                  >
                    <Trash size={18} />
                  </button>
                )}
              </div>

              {/* Content Flow for this section */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => handleContentDragEnd(event, sIdx)}>
                <SortableContext items={section.content.map(i => i.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-2">
                    {section.content.map((item, i) => {
                      const isEditing = editingIndex?.section === sIdx && editingIndex?.item === i;

                      if (isEditing) {
                        return (
                          <div key={item.id} className="relative z-20 bg-slate-50/50 dark:bg-slate-800/40 p-6 rounded-2xl border border-blue-200 dark:border-blue-900 shadow-sm transition-all animate-in fade-in zoom-in-95 duration-200">
                            <div className="absolute -left-16 top-6 opacity-40 hover:opacity-100 transition-opacity">
                              <MediumTemplateMenu onSelect={(type) => addContent(sIdx, type, i + 1)} />
                            </div>

                            {(() => {
                              switch (item.type) {
                                case "paragraph":
                                  return (
                                    <div className="editor-container">
                                      <RichTextEditor
                                        ref={richTextEditorRef}
                                        defaultValue={item.content.data}
                                        placeholder="Tell your story..."
                                        className="border-none focus:ring-0 text-lg leading-relaxed font-serif dark:text-slate-200"
                                      />
                                      <EditingActions
                                        onDelete={() => handleDeleteContent(sIdx, i)}
                                        onCancel={() => setEditingIndex(null)}
                                        onSave={saveCurrentEdit}
                                      />
                                    </div>
                                  );
                                case "codeBlock":
                                  return (
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between border-b pb-2">
                                        <Label className="text-lg font-bold">Code Files</Label>
                                        <Button variant="outline" size="sm" onClick={() => setTempCodeFiles([...tempCodeFiles, { name: "new-file.js", language: "javascript", content: "" }])}>
                                          <Plus className="mr-2 h-4 w-4" /> Add File
                                        </Button>
                                      </div>
                                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                        {tempCodeFiles.map((file, fIdx) => (
                                          <div key={fIdx} className="p-3 border rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-3 relative group/file">
                                            <button onClick={() => setTempCodeFiles(tempCodeFiles.filter((_, idx) => idx !== fIdx))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm"><X size={12} /></button>
                                            <div className="grid grid-cols-2 gap-3">
                                              <input value={file.name} onChange={(e) => { const n = [...tempCodeFiles]; n[fIdx].name = e.target.value; setTempCodeFiles(n); }} className="p-2 border rounded text-sm bg-transparent dark:border-slate-800 dark:text-slate-300" placeholder="Filename" />
                                              <Select value={file.language} onValueChange={(v) => { const n = [...tempCodeFiles]; n[fIdx].language = v; setTempCodeFiles(n); }}><SelectTrigger className="dark:bg-slate-900 border-slate-200 dark:border-slate-800"><SelectValue /></SelectTrigger><SelectContent>{codeLanguages.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent></Select>
                                            </div>
                                            <textarea value={file.content} onChange={(e) => { const n = [...tempCodeFiles]; n[fIdx].content = e.target.value; setTempCodeFiles(n); }} className="w-full h-32 font-mono text-sm p-2 border rounded bg-transparent dark:border-slate-800 dark:text-slate-300" />
                                          </div>
                                        ))}
                                        {tempCodeFiles.length === 0 && (
                                          <textarea ref={inputRef as any} defaultValue={(item.content as CodeBlockContent).data} className="w-full h-40 font-mono text-sm p-2 border rounded bg-transparent dark:border-slate-800 dark:text-slate-300" />
                                        )}
                                      </div>
                                      <EditingActions onDelete={() => handleDeleteContent(sIdx, i)} onCancel={() => setEditingIndex(null)} onSave={saveCurrentEdit} />
                                    </div>
                                  );
                                case "quote":
                                  return (
                                    <div className="space-y-4">
                                      <textarea ref={inputRef as any} defaultValue={(item.content as QuotesBlockContent).data} className="w-full h-24 text-xl italic font-serif p-4 border-l-4 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-slate-200 focus:outline-none" placeholder="Enter quote..." />
                                      <input value={tempQuoteAuthor} onChange={(e) => setTempQuoteAuthor(e.target.value)} className="w-full p-2 border-b dark:border-slate-800 bg-transparent dark:text-slate-300" placeholder="Author (optional)" />
                                      <EditingActions onDelete={() => handleDeleteContent(sIdx, i)} onCancel={() => setEditingIndex(null)} onSave={saveCurrentEdit} />
                                    </div>
                                  );
                                case "warningBox":
                                  return (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <Select value={tempWarningType} onValueChange={(v) => setTempWarningType(v as any)}><SelectTrigger className="dark:bg-slate-900 border-slate-200 dark:border-slate-800"><SelectValue /></SelectTrigger><SelectContent>{warningTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select>
                                        <Select value={tempWarningDesign.toString()} onValueChange={(v) => setTempWarningDesign(parseInt(v) as any)}><SelectTrigger className="dark:bg-slate-900 border-slate-200 dark:border-slate-800"><SelectValue /></SelectTrigger><SelectContent>{warningDesigns.map(d => <SelectItem key={d.value} value={d.value.toString()}>{d.label}</SelectItem>)}</SelectContent></Select>
                                      </div>
                                      <textarea ref={inputRef as any} defaultValue={(item.content as WarningBoxContent).data} className="w-full h-20 p-2 border rounded dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300" />
                                      <EditingActions onDelete={() => handleDeleteContent(sIdx, i)} onCancel={() => setEditingIndex(null)} onSave={saveCurrentEdit} />
                                    </div>
                                  );
                                case "image":
                                  return (
                                    <div className="space-y-4">
                                      <input ref={inputRef as any} defaultValue={(item.content as ImageBlockContent).data || ""} className="w-full p-2 border rounded dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300" placeholder="Image URL" />
                                      <div className="grid grid-cols-2 gap-4">
                                        <Select value={tempImageConfig?.fit || "cover"} onValueChange={(v) => setTempImageConfig({ ...tempImageConfig, fit: v as any })}><SelectTrigger className="dark:bg-slate-900 border-slate-200 dark:border-slate-800"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cover">Cover</SelectItem><SelectItem value="contain">Contain</SelectItem></SelectContent></Select>
                                        <Select value={tempImageConfig?.position || "center"} onValueChange={(v) => setTempImageConfig({ ...tempImageConfig, position: v as any })}><SelectTrigger className="dark:bg-slate-900 border-slate-200 dark:border-slate-800"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left">Left</SelectItem><SelectItem value="center">Center</SelectItem><SelectItem value="right">Right</SelectItem></SelectContent></Select>
                                      </div>
                                      <textarea value={tempImageConfig?.caption || ""} onChange={(e) => setTempImageConfig({ ...tempImageConfig, caption: e.target.value })} className="w-full p-2 border rounded text-sm dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400" placeholder="Caption" />
                                      <Button variant="outline" className="w-full dark:border-slate-800" onClick={() => setCropImage((inputRef.current as any)?.value || item.content.data)}><ImageIcon className="mr-2 h-4 w-4" /> Edit Crop</Button>
                                      <EditingActions onDelete={() => handleDeleteContent(sIdx, i)} onCancel={() => setEditingIndex(null)} onSave={saveCurrentEdit} />
                                    </div>
                                  );
                                case "heading2":
                                  return (
                                    <div className="space-y-4">
                                      <textarea
                                        ref={inputRef as any}
                                        defaultValue={item.content.data}
                                        className="w-full text-3xl font-serif font-bold text-slate-900 border-none focus:ring-0 resize-none bg-transparent"
                                        placeholder="Heading 2"
                                        rows={1}
                                        onChange={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                      />
                                      <EditingActions onDelete={() => handleDeleteContent(sIdx, i)} onCancel={() => setEditingIndex(null)} onSave={saveCurrentEdit} />
                                    </div>
                                  );
                                case "heading3":
                                  return (
                                    <div className="space-y-4">
                                      <textarea
                                        ref={inputRef as any}
                                        defaultValue={item.content.data}
                                        className="w-full text-2xl font-serif font-bold text-slate-800 border-none focus:ring-0 resize-none bg-transparent"
                                        placeholder="Heading 3"
                                        rows={1}
                                        onChange={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                      />
                                      <EditingActions onDelete={() => handleDeleteContent(sIdx, i)} onCancel={() => setEditingIndex(null)} onSave={saveCurrentEdit} />
                                    </div>
                                  );
                                case "iframe":
                                  return (
                                    <div className="space-y-4">
                                      <div className="flex flex-col gap-2">
                                        <Label className="text-sm text-slate-500">YouTube Embed Link</Label>
                                        <input ref={inputRef as any} defaultValue={item.content.data} className="w-full p-2 border rounded-lg bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300" placeholder="https://youtube.com/watch?v=..." />
                                      </div>
                                      <EditingActions onDelete={() => handleDeleteContent(sIdx, i)} onCancel={() => setEditingIndex(null)} onSave={saveCurrentEdit} />
                                    </div>
                                  );
                                case "divider":
                                  return (
                                    <div className="flex flex-col items-center gap-4 py-8">
                                      <span className="text-slate-400 font-medium">--- Divider Block ---</span>
                                      <EditingActions onDelete={() => handleDeleteContent(sIdx, i)} onCancel={() => setEditingIndex(null)} onSave={saveCurrentEdit} />
                                    </div>
                                  );
                                default:
                                  return (
                                    <div className="space-y-4">
                                      <input ref={inputRef as any} defaultValue={(item as any).content.data || ""} onKeyDown={(e) => e.key === "Enter" && saveCurrentEdit()} className="w-full p-2 border rounded" />
                                      <EditingActions onDelete={() => handleDeleteContent(sIdx, i)} onCancel={() => setEditingIndex(null)} onSave={saveCurrentEdit} />
                                    </div>
                                  );
                              }
                            })()}
                          </div>
                        );
                      }

                      return (
                        <SortableContentItem
                          key={item.id}
                          item={item}
                          index={i}
                          startEditing={startEditing}
                          sectionIndex={sIdx}
                          onDeleteClick={handleDeleteContent}
                          isEditing={false}
                          addContent={addContent}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Menu for adding content to this section */}
              <div className="mt-8 flex justify-center opacity-40 hover:opacity-100 transition-opacity">
                <MediumTemplateMenu onSelect={(type) => addContent(sIdx, type)} />
              </div>
            </div>
          ))}

          {/* Add Section Button */}
          <div className="mt-20 py-10 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-6">
            <Button
              onClick={() => {
                setSections([...sections, { id: generateId(), heading: "", content: [] }]);
                setIsDirty(true);
              }}
              variant="outline"
              className="rounded-full px-8 dark:border-slate-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Section
            </Button>
          </div>
        </div>
      )}
      {
        mode === 'pad' && (
          <div className={`p-4 h-full w-full mx-auto mb-4 flex gap-4`}>
            <ResizablePanelGroup direction={true ? "horizontal" : "vertical"}>
              <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                <PadEditor content={padContent || JSON.stringify(sections, null, 2)} onChange={processPadContent} />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                <div className="w-full h-full p-2 border rounded overflow-auto">
                  <iframe src={`/docs#content=${encodedPadContent}`} frameBorder="0" className="w-full h-full"></iframe>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        )
      }
      {/* Sections delete dialog removed */}
      {
        contentToDelete !== null && (
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
        )
      }
      {
        cropImage && (
          <Dialog open={true} onOpenChange={(open) => { if (!open) setCropImage(null); }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crop Image</DialogTitle>
                <DialogDescription>
                  Drag to select the area you want to keep.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center bg-slate-100 dark:bg-slate-900 rounded-md p-4 max-h-[500px] overflow-auto">
                <ReactCrop
                  crop={crop}
                  onChange={c => setCrop(c)}
                  onComplete={c => setCompletedCrop(c)}
                >
                  <img src={cropImage} alt="Crop me" className="max-w-full h-auto" />
                </ReactCrop>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setCropImage(null)}>Cancel</Button>
                <Button
                  onClick={() => {
                    setTempImageConfig({ ...(tempImageConfig || {}), crop: completedCrop });
                    setCropImage(null);
                  }}
                >
                  Save Crop
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      }
      <GoToTop />
    </div>
  );
};

export default ContentEditor;
