"use client"

import { Plus, Text, Code, AlertTriangle, Quote, Table } from "lucide-react"
import type React from "react"
import { type JSX, useState, useRef, useEffect } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

// Types
type ContentItem = {
  icon: JSX.Element
  label: string
  content: string
}

type Section = {
  heading: string | null
  content: ContentItem[]
}

const contentTemplates: Record<string, ContentItem> = {
  paragraph: { icon: <Text className="h-4 w-4" />, label: "Paragraph", content: "New paragraph content..." },
  warning: { icon: <AlertTriangle className="h-4 w-4" />, label: "Warning Box", content: "⚠️ Warning message here..." },
  heading: { icon: <Plus className="h-4 w-4" />, label: "Heading", content: "New Heading" },
  code: { icon: <Code className="h-4 w-4" />, label: "Code", content: "<code>Sample code here</code>" },
  quote: { icon: <Quote className="h-4 w-4" />, label: "Quote", content: '"Inspirational quote here."' },
  table: { icon: <Table className="h-4 w-4" />, label: "Table", content: "[Table placeholder]" },
}

const ContentEditor = () => {
  const [sections, setSections] = useState<Section[]>([])
  const [editingIndex, setEditingIndex] = useState<{ section: number; item: number | null } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingIndex !== null && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingIndex])

  const addSection = () => {
    setSections([...sections, { heading: null, content: [] }])
  }

  const addContent = (sectionIndex: number, type: keyof typeof contentTemplates) => {
    const updatedSections = [...sections]
    updatedSections[sectionIndex].content.push(contentTemplates[type])
    if (!updatedSections[sectionIndex].heading) {
      updatedSections[sectionIndex].heading = "New Heading"
    }
    setSections(updatedSections)
  }

  const startEditing = (sectionIndex: number, itemIndex: number | null = null) => {
    setEditingIndex({ section: sectionIndex, item: itemIndex })
  }

  const handleEdit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && editingIndex !== null) {
      const { section, item } = editingIndex
      const updatedSections = [...sections]
      if (item === null) {
        updatedSections[section].heading = e.currentTarget.value
      } else {
        updatedSections[section].content[item].content = e.currentTarget.value
      }
      setSections(updatedSections)
      setEditingIndex(null)
    }
  }

  return (
    <div className="flex-1 flex flex-col gap-4 m-4">
      {sections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          className="flex flex-col min-h-[50vh] gap-2 p-4 border border-gray-200 rounded-lg shadow-sm"
        >
          {editingIndex?.section === sectionIndex && editingIndex.item === null ? (
            <input
              ref={inputRef}
              defaultValue={section.heading || ""}
              onKeyDown={handleEdit}
              onBlur={() => setEditingIndex(null)}
              className="border rounded-sm px-2 py-1"
            />
          ) : (
            <h2
              onDoubleClick={() => startEditing(sectionIndex)}
              className="text-2xl font-bold cursor-pointer hover:bg-gray-100 p-2 rounded-sm"
            >
              {section.heading || "Add Heading"}
            </h2>
          )}
          {section.content.map((item, itemIndex) =>
            editingIndex?.section === sectionIndex && editingIndex.item === itemIndex ? (
              <input
                key={itemIndex}
                ref={inputRef}
                defaultValue={item.content}
                onKeyDown={handleEdit}
                onBlur={() => setEditingIndex(null)}
                className="border rounded-sm px-2 py-1"
              />
            ) : (
              <div
                key={itemIndex}
                onDoubleClick={() => startEditing(sectionIndex, itemIndex)}
                className="border border-gray-200 p-2 rounded-sm shadow-sm transition-shadow duration-200 cursor-pointer"
              >
                {item.content}
              </div>
            ),
          )}
          <Popover>
            <PopoverTrigger className="w-full h-12 flex justify-center items-center border border-dashed border-gray-300 rounded-sm hover:bg-gray-50 cursor-pointer transition-colors duration-200">
              <Plus className="h-4 w-4 mr-2" /> Add Content
            </PopoverTrigger>
            <PopoverContent className="grid grid-cols-2 gap-2 p-2">
              {Object.keys(contentTemplates).map((type) => (
                <button
                  key={type}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-sm transition-colors duration-200"
                  onClick={() => addContent(sectionIndex, type as keyof typeof contentTemplates)}
                >
                  {contentTemplates[type].icon}
                  {contentTemplates[type].label}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      ))}
      <button
        onClick={addSection}
        className="w-full h-16 border-2 border-dashed border-gray-300 rounded-sm flex justify-center items-center hover:bg-gray-50 cursor-pointer transition-colors duration-200"
      >
        <Plus className="h-6 w-6 mr-2" /> Add Section
      </button>
    </div>
  )
}

export default ContentEditor

