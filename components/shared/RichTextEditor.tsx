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
  ({ defaultValue = "", onKeyDown, onBlur, onChange, placeholder = "Start typing...", className }, ref) => {
    const [content, setContent] = useState(defaultValue || "")
    
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
          // Removed indent: true because it is not a valid option
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
        // Add the Tiptap link extension
        TiptapLink.configure({
          openOnClick: false,
        }),
      ],
      content: content,
      editorProps: {
        attributes: {
          class: "prose prose-sm sm:prose-base mx-auto focus:outline-none min-h-[150px] max-w-full",
        },
        handleKeyDown(view, event) {
          // Capture Tab key to insert indentation instead of shifting focus
          if (event.key === "Tab" && !event.shiftKey) {
            event.preventDefault()
            const { state, dispatch } = view
            const { from, to } = state.selection
            dispatch(state.tr.insertText("    ", from, to)) // insert 4 spaces
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
      },
    })

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || "",
      getText: () => editor?.getText() || "",
      getEditor: () => editor,
      setContent: (content: string) => {
        setContent(content)
        editor?.commands.setContent(content)
      },
      focus: () => editor?.commands.focus(),
    }))

    // Update content when defaultValue changes
    useEffect(() => {
      if (editor && defaultValue !== null && defaultValue !== editor.getHTML()) {
        editor.commands.setContent(defaultValue)
        setContent(defaultValue)
      }
    }, [defaultValue, editor])

    if (!editor) {
      return null
    }

    return (
      <div className={cn("border rounded-md", className)}>
        <MenuBar editor={editor} />
        <EditorContent 
          editor={editor} 
          onKeyDown={onKeyDown} 
          onBlur={onBlur}
          className="px-4 py-3" 
          onClick={(e) => e.stopPropagation()}
        />
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
