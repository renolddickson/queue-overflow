"use client"
import { Plus, Trash, Edit } from "lucide-react"
import type { Topics } from "@/types"
import { useEffect, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
  fetchTopics,
  addTopic as apiAddTopic,
  updateTopic as apiUpdateTopic,
  addSubTopic as apiAddSubTopic,
  deleteSubTopic as apiDeleteSubTopic,
} from "@/actions/document"
import { bulkDeleteData } from "@/actions/document"
import Icon from "../shared/Icon"
import { usePathname } from "next/navigation"

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

export default function LeftPanelEditor({
  navigate,
  docId,
}: {
  navigate: (path: string) => void
  docId: string
}) {
  const [topics, setTopics] = useState<Topics[]>([])
  const [loader, setLoader] = useState(false)

  // For editing topic title only
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
  const [tempTopicTitle, setTempTopicTitle] = useState("")
  const pathname = usePathname()
  useEffect(() => {
    const fetchAllTopics = async () => {
      setLoader(true)
      try {
        const res = await fetchTopics(docId)
        setTopics(res.data || [])
      } catch (error) {
        console.error("Error fetching topics:", error)
      }
      setLoader(false)
    }
    fetchAllTopics()
  }, [docId])

  // ---------------------
  // TOPIC CRUD
  // ---------------------

  // 1) Add new topic
  const addTopic = async () => {
    const tempId = `temp-${Math.random().toString(36).slice(2, 9)}`
    const position = topics.length
    const newTopicData = { title: "New Topic", icon: "FileText", position }

    // Local optimistic topic
    const newLocalTopic: Topics = {
      id: tempId,
      title: newTopicData.title,
      icon: newTopicData.icon,
      position: newTopicData.position,
      subTopics: [],
    }

    setTopics((prev) => [...prev, newLocalTopic])
    try {
      const res = await apiAddTopic(docId, newTopicData)
      setTopics((prev) =>
        prev.map((t) => (t.id === tempId ? res.data : t))
      )
    } catch (error) {
      console.error("Error adding topic:", error)
      setTopics((prev) => prev.filter((t) => t.id !== tempId))
    }
  }

  // 2) Save topic title edit
  const saveTopicEdit = async (topicId: string) => {
    const oldTopic = topics.find((t) => t.id === topicId)
    if (!oldTopic) return

    // Optimistic update
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId ? { ...t, title: tempTopicTitle } : t
      )
    )

    try {
      const updatedFields = { title: tempTopicTitle }
      const res = await apiUpdateTopic(topicId, updatedFields)
      setTopics((prev) =>
        prev.map((t) => (t.id === topicId ? { ...t, ...res.data } : t))
      )
    } catch (error) {
      console.error("Error updating topic title:", error)
      // Revert
      setTopics((prev) =>
        prev.map((t) => (t.id === topicId ? oldTopic : t))
      )
    } finally {
      setEditingTopicId(null)
    }
  }

  // 3) Delete topic (with subtopics)
  const deleteTopicHandler = async (topicId: string) => {
    // Ask for confirmation before deleting a topic (and its subtopics)
    if (!window.confirm("Are you sure you want to delete this topic and its subtopics?")) return

    const oldTopics = [...topics]
    setTopics((prev) => prev.filter((t) => t.id !== topicId))
    try {
      await bulkDeleteData("topics", [topicId]) // Will also delete subtopics
    } catch (error) {
      console.error("Error deleting topic:", error)
      setTopics(oldTopics)
    }
  }

  // 4) Update icon immediately on selection
  const updateTopicIcon = async (topicId: string, newIcon: string) => {
    const oldTopic = topics.find((t) => t.id === topicId)
    if (!oldTopic) return

    // Optimistic update
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, icon: newIcon } : t))
    )

    try {
      await apiUpdateTopic(topicId, { icon: newIcon })
    } catch (error) {
      console.error("Error updating topic icon:", error)
      // Revert
      setTopics((prev) =>
        prev.map((t) => (t.id === topicId ? oldTopic : t))
      )
    }
  }

  // ---------------------
  // SUBTOPIC CRUD
  // ---------------------

  // 1) Add subtopic
  const addSubTopic = async (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId)
    if (!topic) return

    const tempId = `temp-${Math.random().toString(36).slice(2, 9)}`
    const position = topic.subTopics.length
    const newSubTopicData = { title: "New Subtopic", position }

    const newLocalSubtopic = {
      id: tempId,
      title: newSubTopicData.title,
      position: newSubTopicData.position,
    }

    // Optimistic update
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? { ...t, subTopics: [...t.subTopics, newLocalSubtopic] }
          : t
      )
    )
    try {
      const res = await apiAddSubTopic(topicId, newSubTopicData)
      setTopics((prev) =>
        prev.map((t) =>
          t.id === topicId
            ? {
                ...t,
                subTopics: t.subTopics.map((s) =>
                  s.id === tempId ? res.data : s
                ),
              }
            : t
        )
      )
    } catch (error) {
      console.error("Error adding subtopic:", error)
      // Revert
      setTopics((prev) =>
        prev.map((t) =>
          t.id === topicId
            ? { ...t, subTopics: t.subTopics.filter((s) => s.id !== tempId) }
            : t
        )
      )
    }
  }

  // 2) Delete subtopic
  const deleteSubTopicHandler = async (topicId: string, subTopicId: string) => {
    // Ask for confirmation before deleting a subtopic
    if (!window.confirm("Are you sure you want to delete this subtopic?")) return

    const oldTopics = [...topics]
    // Optimistic update
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? { ...t, subTopics: t.subTopics.filter((s) => s.id !== subTopicId) }
          : t
      )
    )
    try {
      await apiDeleteSubTopic(subTopicId)
    } catch (error) {
      console.error("Error deleting subtopic:", error)
      setTopics(oldTopics)
    }
  }

  // ---------------------
  // UI Helpers
  // ---------------------

  const startEditingTopic = (topicId: string, currentTitle: string) => {
    setEditingTopicId(topicId)
    setTempTopicTitle(currentTitle)
  }

  return (
    <nav className="w-64 border-r bg-gray-50 px-4 py-6 sticky top-16 h-[calc(100vh-64px)] overflow-auto">
      <div>
        {/* Add Topic Button */}
        <button
          className="w-full border border-dashed rounded-sm border-gray-400 flex justify-center gap-2 px-4 py-2 hover:bg-gray-200 cursor-pointer"
          onClick={addTopic}
        >
          <Plus /> Add Topic
        </button>

        {loader ? (
          // Loading skeleton
          <div className="animate-pulse mt-4 space-y-4">
            <div className="h-6 bg-gray-300 rounded w-full"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
          </div>
        ) : (
          topics.map((topic) => {
            const isEditing = editingTopicId === topic.id
            return (
              <div key={topic.id} className="group">
                <div className="flex items-center gap-2 rounded-sm px-2 py-2 transition">
                  {/* Icon Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="p-0">
                        <Icon name={topic.icon} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-2">
                      <div className="grid grid-cols-3 gap-2">
                        {iconOptions.map((icon) => (
                          <Button
                            key={icon}
                            variant="ghost"
                            size="icon"
                            onClick={() => updateTopicIcon(topic.id, icon)}
                          >
                            <Icon name={icon} />
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Topic Title (with editing) */}
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempTopicTitle}
                      onChange={(e) => setTempTopicTitle(e.target.value)}
                      onBlur={() => saveTopicEdit(topic.id)}
                      className="border rounded-sm px-2 py-1 flex-grow"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="font-medium flex-grow cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]"
                      onDoubleClick={() =>
                        startEditingTopic(topic.id, topic.title)
                      }
                      title={topic.title} // Tooltip on hover if truncated
                    >
                      {topic.title}
                    </span>
                  )}

                  {/* Right action buttons for topic */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTopicHandler(topic.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash className="h-4 w-4 text-red-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => addSubTopic(topic.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Subtopics */}
                <div className="ml-6">
                  {topic.subTopics.map((sub) => (
                    <div
                      key={sub.id}
                      className={`flex items-center justify-between ${
                        pathname === `/q/${sub.id}/${sub.id}`
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <span
                        className="block rounded-sm px-2 py-2 text-sm transition flex-grow whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]"
                        title={sub.title}
                      >
                        {sub.title}
                      </span>

                      {/* Hover icons: Edit and Trash */}
                      <div className="flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/q/edit/${docId}/${sub.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSubTopicHandler(topic.id, sub.id)}
                        >
                          <Trash className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </nav>
  )
}
