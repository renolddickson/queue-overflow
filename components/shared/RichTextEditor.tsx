"use client"

import type React from "react"
import { forwardRef, useImperativeHandle, useEffect, useState } from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Color from "@tiptap/extension-color"
import TextStyle from "@tiptap/extension-text-style"
import Placeholder from "@tiptap/extension-placeholder"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
// Import the Tiptap Link extension and rename the lucide icon to avoid conflicts
import TiptapLink from "@tiptap/extension-link"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  SeparatorHorizontal,
  Palette,
  Link as LinkIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface RichTextEditorProps {
  defaultValue: string | null
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  onChange?: (html: string) => void
  onSlashCommand?: (type: string) => void
  onEnterPressed?: () => void
}

export interface RichTextEditorRef {
  getHTML: () => string
  getText: () => string
  getEditor: () => Editor | null
  setContent: (content: string) => void
  focus: () => void
  clear: () => void
}

const colors = [
  { name: "Default", value: "inherit" },
  { name: "Black", value: "#000000" },
  { name: "Gray", value: "#6b7280" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
]

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ defaultValue = "", onKeyDown, onBlur, onChange, onSlashCommand, onEnterPressed, placeholder = "Start typing or type '/' for commands...", className }, ref) => {
    const [content, setContent] = useState(defaultValue || "")
    const [showSlashMenu, setShowSlashMenu] = useState(false)
    const [slashPosition, setSlashPosition] = useState({ top: 0, left: 0 })
    
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"],
          alignments: ["left", "center", "right", "justify"],
        }),
        TextStyle,
        Color,
        Placeholder.configure({
          placeholder,
        }),
        HorizontalRule,
        TiptapLink.configure({
          openOnClick: false,
        }),
      ],
      content: content,
      editorProps: {
        attributes: {
          class: "prose prose-sm sm:prose-base mx-auto focus:outline-none min-h-[100px] max-w-full dark:prose-invert",
        },
        handleKeyDown(view, event) {
          if (event.key === "/") {
            const { state } = view;
            const { from } = state.selection;
            const coords = view.coordsAtPos(from);
            setSlashPosition({ top: coords.bottom + window.scrollY, left: coords.left + window.scrollX });
            // Detect if it's the start of a block
            const $pos = state.doc.resolve(from);
            if ($pos.parentOffset === 0) {
                setShowSlashMenu(true);
            }
          }

          if (event.key === "Enter" && !event.shiftKey && !showSlashMenu) {
             const { state } = view;
             const { from, to } = state.selection;
             // If cursor is at the very end of the document, trigger onEnterPressed
             if (from === to && from === state.doc.content.size - 1) {
                if (onEnterPressed) {
                    onEnterPressed();
                    return true;
                }
             }
          }

          if (event.key === "Escape") {
            setShowSlashMenu(false);
          }

          if (event.key === "Tab" && !event.shiftKey) {
            event.preventDefault()
            const { state, dispatch } = view
            const { from, to } = state.selection
            dispatch(state.tr.insertText("    ", from, to))
            return true
          }
          return false
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML()
        setContent(html)
        if (onChange) {
          onChange(html)
        }
        
        // Hide slash menu if content changes and it doesn't start with /
        if (showSlashMenu && !editor.getText().startsWith('/')) {
            setShowSlashMenu(false);
        }
      },
    })

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || "",
      getText: () => editor?.getText() || "",
      getEditor: () => editor,
      setContent: (content: string) => {
        setContent(content)
        editor?.commands.setContent(content)
      },
      focus: () => editor?.commands.focus(),
      clear: () => editor?.commands.clearContent(),
    }))

    useEffect(() => {
      if (editor && defaultValue !== null && defaultValue !== editor.getHTML()) {
        editor.commands.setContent(defaultValue)
        setContent(defaultValue)
      }
    }, [defaultValue, editor])

    if (!editor) {
      return null
    }

    const handleCommand = (type: string) => {
        setShowSlashMenu(false);
        editor.commands.clearContent();
        if (onSlashCommand) {
            onSlashCommand(type);
        }
    }

    return (
      <div className={cn("relative group transition-all duration-200", className)}>
        <MenuBar editor={editor} />
        <EditorContent 
          editor={editor} 
          onKeyDown={onKeyDown} 
          onBlur={onBlur}
          className="px-4 py-3 min-h-[50px] cursor-text" 
          onClick={(e) => {
            e.stopPropagation();
            editor.commands.focus();
          }}
        />

        {showSlashMenu && (
          <div 
            className="fixed z-50 bg-white dark:bg-background border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl p-2 w-56 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: slashPosition.top, left: slashPosition.left }}
          >
            <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Insert Block</p>
            <div className="flex flex-col gap-0.5">
                {[
                    { id: 'heading2', label: 'Heading 2', icon: <Heading2 size={14} /> },
                    { id: 'heading3', label: 'Heading 3', icon: <Heading1 size={14} /> },
                    { id: 'codeBlock', label: 'Code Block', icon: <Bold size={14} /> },
                    { id: 'image', label: 'Image', icon: <Palette size={14} /> },
                    { id: 'quote', label: 'Quote', icon: <Strikethrough size={14} /> },
                    { id: 'warningBox', label: 'Warning Box', icon: <AlignLeft size={14} /> },
                ].map(cmd => (
                    <button
                        key={cmd.id}
                        onClick={() => handleCommand(cmd.id)}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-left"
                    >
                        <span className="text-slate-400">{cmd.icon}</span>
                        {cmd.label}
                    </button>
                ))}
            </div>
          </div>
        )}
      </div>
    )
  },
)

RichTextEditor.displayName = "RichTextEditor"

interface MenuBarProps {
  editor: Editor
}

const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) {
    return null
  }

  // Prevent button clicks from propagating and triggering parent onClicks
  const handleButtonClick = (callback: () => void) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    callback()
  }

  // Link feature: prompt user to add or remove a link
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("Enter the URL", previousUrl || "")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div 
      className="border-b p-2 flex flex-wrap gap-1 items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={handleButtonClick(() => editor.chain().focus().toggleBold().run())}
        className={editor.isActive("bold") ? "bg-muted" : ""}
        type="button"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleButtonClick(() => editor.chain().focus().toggleItalic().run())}
        className={editor.isActive("italic") ? "bg-muted" : ""}
        type="button"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleButtonClick(() => editor.chain().focus().toggleUnderline().run())}
        className={editor.isActive("underline") ? "bg-muted" : ""}
        type="button"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleButtonClick(() => editor.chain().focus().toggleStrike().run())}
        className={editor.isActive("strike") ? "bg-muted" : ""}
        type="button"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={handleButtonClick(() => editor.chain().focus().setTextAlign("left").run())}
        className={editor.isActive({ textAlign: "left" }) ? "bg-muted" : ""}
        type="button"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleButtonClick(() => editor.chain().focus().setTextAlign("center").run())}
        className={editor.isActive({ textAlign: "center" }) ? "bg-muted" : ""}
        type="button"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleButtonClick(() => editor.chain().focus().setTextAlign("right").run())}
        className={editor.isActive({ textAlign: "right" }) ? "bg-muted" : ""}
        type="button"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleButtonClick(() => editor.chain().focus().setTextAlign("justify").run())}
        className={editor.isActive({ textAlign: "justify" }) ? "bg-muted" : ""}
        type="button"
      >
        <AlignJustify className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={handleButtonClick(() => editor.chain().focus().toggleHeading({ level: 1 }).run())}
        className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
        type="button"
      >
        <Heading1 className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleButtonClick(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
        type="button"
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={handleButtonClick(() => editor.chain().focus().toggleBulletList().run())}
        className={editor.isActive("bulletList") ? "bg-muted" : ""}
        type="button"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleButtonClick(() => editor.chain().focus().toggleOrderedList().run())}
        className={editor.isActive("orderedList") ? "bg-muted" : ""}
        type="button"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleButtonClick(() => editor.chain().focus().setHorizontalRule().run())}
        type="button"
      >
        <SeparatorHorizontal className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />
      
      {/* Link Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleButtonClick(setLink)}
        className={editor.isActive("link") ? "bg-muted" : ""}
        type="button"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={editor.isActive("textStyle") ? "bg-muted" : ""} 
            type="button"
            onClick={(e) => e.stopPropagation()}
          >
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-5 gap-1">
            {colors.map((color) => (
              <Button
                key={color.value}
                variant="ghost"
                className="h-8 w-8 p-0 rounded-md"
                style={{ backgroundColor: color.value === "inherit" ? "transparent" : color.value }}
                onClick={handleButtonClick(() => editor.chain().focus().setColor(color.value).run())}
                type="button"
                title={color.name}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default RichTextEditor
