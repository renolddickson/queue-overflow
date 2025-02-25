"use client"
import { Plus } from "lucide-react"
import type { Topics } from "@/types"
import { usePathname } from "next/navigation"
import Icon from "../../../components/shared/Icon"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

// All possible icons
const iconOptions = [
  "BookOpen",
  "Layers",
  "Tool",
  "CodeXml",
  "Braces",
  "BarChart2",
  "User",
  "FileText",
  "Globe",
  "Database",
  "Package",
  "Settings",
  "Clipboard",
  "Folder",
  "Shield",
  "Tag",
  "Bell",
]

// Initial data
const topics: Topics[] = [
  {
    title: "Introduction",
    icon: "BookOpen",
    isActive: true,
    id: "1",
    subTopics: [
      { title: "About Playcart", isActive: true, id: "1" },
      { title: "How to Get Started", id: "2" },
      { title: "Key Features Overview", id: "3" },
      { title: "FAQs and Support", id: "4" },
    ],
  },
  {
    title: "Campaign Management",
    icon: "Layers",
    isActive: false,
    id: "2",
    subTopics: [
      { title: "Creating a New Campaign", id: "1" },
      { title: "Managing Campaigns", id: "2" },
      { title: "Performance Analysis", id: "3" },
    ],
  },
]

/**
 * Types to manage editing subtopics by both topicId & subTopicId
 */
interface EditingSubTopic {
  topicId: string
  subTopicId: string
}

export default function LeftPanelEditor() {
  const [content, setContent] = useState<Topics[]>(topics)

  // For editing topics; editingTopicId now doubles as our popover open flag.
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
  const [tempTopicTitle, setTempTopicTitle] = useState("")
  const [tempTopicIcon, setTempTopicIcon] = useState("")

  // For editing subtopics
  const [editingSubTopic, setEditingSubTopic] = useState<EditingSubTopic | null>(null)
  const [tempSubTopicTitle, setTempSubTopicTitle] = useState("")

  const pathname = usePathname()

  // Add a new topic at the top
  const addTopic = () => {
    setContent((prev) => [
      {
        title: "New Topic",
        icon: "FileText",
        isActive: true,
        id: (prev.length + 1).toString(),
        subTopics: [],
      },
      ...prev,
    ])
  }

  // Add a new subtopic to a specific topic
  const addSubTopic = (topicId: string) => {
    setContent((prev) =>
      prev.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              subTopics: [
                ...topic.subTopics,
                {
                  title: "New Subtopic",
                  id: (topic.subTopics.length + 1).toString(),
                },
              ],
            }
          : topic,
      ),
    )
  }

  // Start editing a topic (and open its popover)
  const startEditingTopic = (topicId: string, currentTitle: string, currentIcon: string) => {
    setEditingTopicId(topicId)
    setTempTopicTitle(currentTitle)
    setTempTopicIcon(currentIcon)
  }

  // Save topic edits on blur (or after icon selection)
  const saveTopicEdit = (topicId: string) => {
    setContent((prev) =>
      prev.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              title: tempTopicTitle,
              icon: tempTopicIcon,
            }
          : topic,
      ),
    )
    setEditingTopicId(null)
  }

  // Start editing a subtopic
  const startEditingSubTopic = (topicId: string, subTopicId: string, currentTitle: string) => {
    setEditingSubTopic({ topicId, subTopicId })
    setTempSubTopicTitle(currentTitle)
  }

  // Save subtopic edits on blur
  const saveSubTopicEdit = (topicId: string, subTopicId: string) => {
    setContent((prev) =>
      prev.map((topic) => {
        if (topic.id !== topicId) return topic
        return {
          ...topic,
          subTopics: topic.subTopics.map((sub) =>
            sub.id === subTopicId ? { ...sub, title: tempSubTopicTitle } : sub,
          ),
        }
      }),
    )
    setEditingSubTopic(null)
  }

  // Update icon and close popover
  const updateIcon = (topicId: string, newIcon: string) => {
    setTempTopicIcon(newIcon)
    setContent((prev) =>
      prev.map((topic) =>
        topic.id === topicId ? { ...topic, icon: newIcon } : topic,
      ),
    )
    // Close popover after selection
    setEditingTopicId(null)
  }

  return (
    <nav className="w-64 border-r bg-gray-50 px-4 py-6 sticky top-16 h-[calc(100vh-64px)] overflow-auto">
      <div className="space-y-4">
        {/* Button to add a new Topic */}
        <button
          className="w-full border border-dashed rounded-sm border-gray-400 flex justify-center gap-2 px-4 py-2 hover:bg-gray-200 cursor-pointer"
          onClick={addTopic}
        >
          <Plus /> Add Topic
        </button>

        {content.map((section) => {
          const isTopicEditing = editingTopicId === section.id

          return (
            <div key={section.id} className="mb-2">
              {/* TOPIC ROW */}
              <div className="flex items-center gap-2 rounded-sm px-2 py-2 transition">
                {/* Icon with popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-0"
                      // onDoubleClick={(e) => {
                      //   startEditingTopic(section.id, section.title, section.icon)
                      // }}
                    >
                      <Icon name={isTopicEditing ? tempTopicIcon : section.icon} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <div className="grid grid-cols-3 gap-2 p-2">
                      {iconOptions.map((icon) => (
                        <Button
                          key={icon}
                          variant="ghost"
                          size="icon"
                          onClick={() => updateIcon(section.id, icon)}
                        >
                          <Icon name={icon} />
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Topic title */}
                {isTopicEditing ? (
                  <input
                    type="text"
                    value={tempTopicTitle}
                    onChange={(e) => setTempTopicTitle(e.target.value)}
                    onBlur={() => saveTopicEdit(section.id)}
                    className="border rounded-sm px-2 py-1 flex-grow"
                    autoFocus
                  />
                ) : (
                  <span
                    className="font-medium flex-grow"
                    onDoubleClick={() =>
                      startEditingTopic(section.id, section.title, section.icon)
                    }
                  >
                    {section.title}
                  </span>
                )}

                <Plus
                  className="ml-auto h-4 w-4 cursor-pointer"
                  onClick={() => addSubTopic(section.id)}
                />
              </div>

              {/* SUBTOPICS */}
              <div className="mt-1 ml-4 space-y-1">
                {section.subTopics.map((sub) => {
                  const isSubEditing =
                    editingSubTopic?.topicId === section.id &&
                    editingSubTopic?.subTopicId === sub.id

                  return isSubEditing ? (
                    <input
                      key={sub.id}
                      type="text"
                      value={tempSubTopicTitle}
                      onChange={(e) => setTempSubTopicTitle(e.target.value)}
                      onBlur={() => saveSubTopicEdit(section.id, sub.id)}
                      className="border rounded-sm px-2 py-1"
                      autoFocus
                    />
                  ) : (
                    <a
                      key={sub.id}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      onDoubleClick={() =>
                        startEditingSubTopic(section.id, sub.id, sub.title)
                      }
                      className={`block rounded-sm px-2 py-2 text-sm transition cursor-pointer ${
                        pathname === `/q/${section.id}/${sub.id}`
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {sub.title}
                    </a>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </nav>
  )
}
