"use client"

import type React from "react"
import { forwardRef, useImperativeHandle, useEffect } from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Color from "@tiptap/extension-color"
import TextStyle from "@tiptap/extension-text-style"
import Placeholder from "@tiptap/extension-placeholder"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  Quote,
  SeparatorHorizontal,
  Palette,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface RichTextEditorProps {
  defaultValue: string | null
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
}

export interface RichTextEditorRef {
  getHTML: () => string
  getText: () => string
  getEditor: () => Editor | null
  setContent: (content: string) => void
  focus: () => void
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
  ({ defaultValue = "", onKeyDown, onBlur, placeholder = "Start typing...", className }, ref) => {
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
      ],
      content: defaultValue,
      editorProps: {
        attributes: {
          class: "prose prose-sm sm:prose-base mx-auto focus:outline-none min-h-[150px] max-w-full",
        },
      },
    })

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || "",
      getText: () => editor?.getText() || "",
      getEditor: () => editor,
      setContent: (content: string) => editor?.commands.setContent(content),
      focus: () => editor?.commands.focus(),
    }))

    // Update content when defaultValue changes
    useEffect(() => {
      if (editor && defaultValue !== editor.getHTML()) {
        editor.commands.setContent(defaultValue)
      }
    }, [defaultValue, editor])

    if (!editor) {
      return null
    }

    return (
      <div className={cn("border rounded-md", className)} onBlur={onBlur}>
        <MenuBar editor={editor} />
        <EditorContent editor={editor} onKeyDown={onKeyDown} className="px-4 py-3" />
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

  return (
    <div className="border-b p-2 flex flex-wrap gap-1 items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "bg-muted" : ""}
        type="button"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "bg-muted" : ""}
        type="button"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive("underline") ? "bg-muted" : ""}
        type="button"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? "bg-muted" : ""}
        type="button"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={editor.isActive({ textAlign: "left" }) ? "bg-muted" : ""}
        type="button"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={editor.isActive({ textAlign: "center" }) ? "bg-muted" : ""}
        type="button"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={editor.isActive({ textAlign: "right" }) ? "bg-muted" : ""}
        type="button"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        className={editor.isActive({ textAlign: "justify" }) ? "bg-muted" : ""}
        type="button"
      >
        <AlignJustify className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
        type="button"
      >
        <Heading1 className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
        type="button"
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "bg-muted" : ""}
        type="button"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "bg-muted" : ""}
        type="button"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive("codeBlock") ? "bg-muted" : ""}
        type="button"
      >
        <Code className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive("blockquote") ? "bg-muted" : ""}
        type="button"
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        type="button"
      >
        <SeparatorHorizontal className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className={editor.isActive("textStyle") ? "bg-muted" : ""} type="button">
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <div className="grid grid-cols-5 gap-1">
            {colors.map((color) => (
              <Button
                key={color.value}
                variant="ghost"
                className="h-8 w-8 p-0 rounded-md"
                style={{ backgroundColor: color.value === "inherit" ? "transparent" : color.value }}
                onClick={() => editor.chain().focus().setColor(color.value).run()}
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

