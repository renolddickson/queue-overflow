"use client"
import { Plus, Trash, FilePenLine } from "lucide-react"
import type { Topics } from "@/types/api"
import { useEffect, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
  fetchTopics,
  addTopic as apiAddTopic,
  updateTopic as apiUpdateTopic,
  addSubTopic as apiAddSubTopic,
  deleteSubTopic as apiDeleteSubTopic,
  updateSubTopic as apiUpdateSubTopic, // New API for updating subtopic title
} from "@/actions/document"
import { bulkDeleteData } from "@/actions/document"
import Icon from "@/components/shared/Icon"
import { usePathname } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

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

type ConfirmDialogData = {
  type: "topic" | "subtopic"
  topicId: string
  subTopicId?: string
}

export default function LeftPanelEditor({
  navigate,
  docId,
  type
}: {
  navigate: (path: string) => void
  docId: string
  type: 'posts' | 'docs'
}) {
  const [topics, setTopics] = useState<Topics[]>([])
  const [loader, setLoader] = useState(false)

  // For editing topic title only
  const [editingTopicId, setEditingTopicId] = useState<{ id: string, loading: boolean } | null>(null)
  const [tempTopicTitle, setTempTopicTitle] = useState("")

  // New state for editing subtopic title
  const [editingSubTopic, setEditingSubTopic] = useState<{ topicId: string; subTopicId: string, loading: boolean } | null>(null)
  const [tempSubTopicTitle, setTempSubTopicTitle] = useState("")

  const pathname = usePathname()

  // State for our confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData | null>(null)

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

  const addTopic = async () => {
    const tempId = `temp-${Math.random().toString(36).slice(2, 9)}`
    const position = topics.length
    const newTopicData = { title: "New Topic", icon: "FileText", position }

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

  const saveTopicEdit = async (topicId: string) => {
    const oldTopic = topics.find((t) => t.id === topicId)
    if (!oldTopic || tempTopicTitle == oldTopic.title) {
      setEditingTopicId(null)
      return
    }

    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId ? { ...t, title: tempTopicTitle } : t
      )
    )

    try {
      const updatedFields = { title: tempTopicTitle }
      setEditingTopicId(prev => (prev ? { ...prev, loading: true } : null));
      const res = await apiUpdateTopic(topicId, updatedFields)
      setTopics((prev) =>
        prev.map((t) => (t.id === topicId ? { ...t, ...res.data } : t))
      )
    } catch (error) {
      console.error("Error updating topic title:", error)
      setTopics((prev) =>
        prev.map((t) => (t.id === topicId ? oldTopic : t))
      )
    } finally {
      setEditingTopicId(null)
    }
  }

  const deleteTopicHandler = (topicId: string) => {
    setConfirmDialog({ type: "topic", topicId })
  }

  const updateTopicIcon = async (topicId: string, newIcon: string) => {
    const oldTopic = topics.find((t) => t.id === topicId)
    if (!oldTopic) return
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

  const deleteSubTopicHandler = (topicId: string, subTopicId: string) => {
    setConfirmDialog({ type: "subtopic", topicId, subTopicId })
  }

  const startEditingSubTopic = (
    topicId: string,
    subTopicId: string,
    currentTitle: string
  ) => {
    setEditingSubTopic({ topicId, subTopicId, loading: false })
    setTempSubTopicTitle(currentTitle)
  }

  const saveSubTopicEdit = async (topicId: string, subTopicId: string) => {
    const topic = topics.find((t) => t.id === topicId)
    if (!topic) return
    const subTopic = topic.subTopics.find((s) => s.id === subTopicId)
    if (!subTopic) return

    const oldSubTopic = { ...subTopic }
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? {
            ...t,
            subTopics: t.subTopics.map((s) =>
              s.id === subTopicId ? { ...s, title: tempSubTopicTitle } : s
            ),
          }
          : t
      )
    )

    try {
      const updatedFields = { title: tempSubTopicTitle }
      setEditingSubTopic(prev => (prev ? { ...prev, loading: true } : null))
      if (tempSubTopicTitle !== subTopic.title) {
        const res = await apiUpdateSubTopic(subTopicId, updatedFields)
        setTopics((prev) =>
          prev.map((t) =>
            t.id === topicId
              ? {
                ...t,
                subTopics: t.subTopics.map((s) =>
                  s.id === subTopicId ? { ...s, ...res.data } : s
                ),
              }
              : t
          )
        )
      }
    } catch (error) {
      console.error("Error updating subtopic title:", error)
      setTopics((prev) =>
        prev.map((t) =>
          t.id === topicId
            ? {
              ...t,
              subTopics: t.subTopics.map((s) =>
                s.id === subTopicId ? oldSubTopic : s
              ),
            }
            : t
        )
      )
    } finally {
      setEditingSubTopic(null)
      setTempSubTopicTitle("")
    }
  }

  const startEditingTopic = (topicId: string, currentTitle: string) => {
    setEditingTopicId({ id: topicId, loading: false })
    setTempTopicTitle(currentTitle)
  }

  const handleConfirmDeletion = async () => {
    if (!confirmDialog) return

    if (confirmDialog.type === "topic") {
      const { topicId } = confirmDialog
      const oldTopics = [...topics]
      setTopics((prev) => prev.filter((t) => t.id !== topicId))
      try {
        await bulkDeleteData("topics", [topicId])
      } catch (error) {
        console.error("Error deleting topic:", error)
        setTopics(oldTopics)
      }
    } else if (confirmDialog.type === "subtopic" && confirmDialog.subTopicId) {
      const { topicId, subTopicId } = confirmDialog
      const oldTopics = [...topics]
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
    setConfirmDialog(null)
  }

  return (
    <>
      <nav className="w-64 border-r border-slate-200 dark:border-slate-800 px-4 py-6 sticky top-16 h-[calc(100vh-64px)] overflow-auto bg-white dark:bg-slate-900">
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
              const isEditing = editingTopicId?.id === topic.id
              const isActive = pathname === `/edit/${type}/${docId}/${topic.id}`;
              return (
                <div key={topic.id}>
                  <div className={`flex items-center gap-2 group px-2 py-1.5 rounded-md transition-all relative ${isActive ? "bg-slate-100 dark:bg-slate-800" : ""}`}>
                    {/* Icon Popover */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <Icon name={topic.icon} className={`h-4 w-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600"}`} />
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
                      <div className="relative text-black flex-grow">
                        <input
                          type="text"
                          value={tempTopicTitle}
                          onChange={(e) => setTempTopicTitle(e.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              saveTopicEdit(topic.id);
                            }
                          }}
                          onBlur={() => saveTopicEdit(topic.id)}
                          className="w-full border rounded-sm px-2 py-1 text-sm bg-white"
                          autoFocus
                        />
                        {editingTopicId.loading && (
                          <div className="absolute inset-y-0 right-2 flex items-center">
                            <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <span
                          className={`text-sm font-semibold flex-grow cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis ${isActive 
                            ? "text-blue-600 dark:text-blue-400" 
                            : "text-slate-700 dark:text-slate-200"
                          }`}
                          onDoubleClick={() =>
                            startEditingTopic(topic.id, topic.title)
                          }
                          onClick={() => navigate(`/edit/${type}/${docId}/${topic.id}`)}
                          title={topic.title}
                        >
                          {topic.title}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => navigate(`/edit/${type}/${docId}/${topic.id}`)}
                          >
                            <FilePenLine className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => addSubTopic(topic.id)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteTopicHandler(topic.id)}
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>


                  {/* Subtopics */}
                  <div className="ml-5 border-l border-slate-200 dark:border-slate-800 pl-4 py-1 space-y-0.5">
                    {topic.subTopics.map((sub) => {
                      const isActive = pathname === `/edit/${type}/${docId}/${sub.id}`;
                      const isEditingSub =
                        editingSubTopic &&
                        editingSubTopic.topicId === topic.id &&
                        editingSubTopic.subTopicId === sub.id;
                      const isLoading = editingSubTopic?.loading;
                      return (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between cursor-pointer group relative py-1 rounded-sm transition-all"
                        >
                          {isEditingSub ? (
                            <div className="relative text-black flex-grow">
                              <input
                                type="text"
                                value={tempSubTopicTitle}
                                onChange={(e) =>
                                  setTempSubTopicTitle(e.target.value)
                                }
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    saveSubTopicEdit(topic.id, sub.id);
                                  }
                                }}
                                onBlur={() =>
                                  saveSubTopicEdit(topic.id, sub.id)
                                }
                                autoFocus
                                className="w-full border rounded-sm px-2 py-1 text-sm bg-white"
                              />
                              {isLoading && (
                                <div className="absolute inset-y-0 right-2 flex items-center">
                                  <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                              {isActive && (
                                <div className="absolute -left-[17px] top-1.5 bottom-1.5 w-[2px] bg-blue-600 dark:bg-blue-400 rounded-full" />
                              )}
                              <span
                                className={`block text-sm transition-all flex-grow whitespace-nowrap overflow-hidden text-ellipsis ${isActive
                                  ? "text-blue-600 dark:text-blue-400 font-medium"
                                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                                  }`}
                                title={sub.title}
                                onDoubleClick={() =>
                                  startEditingSubTopic(topic.id, sub.id, sub.title)
                                }
                                onClick={() => navigate(`/edit/${type}/${docId}/${sub.id}`)}
                              >
                                {sub.title}
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    navigate(`/edit/${type}/${docId}/${sub.id}`)
                                  }
                                >
                                  <FilePenLine className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() =>
                                    deleteSubTopicHandler(topic.id, sub.id)
                                  }
                                >
                                  <Trash className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </nav>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <Dialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setConfirmDialog(null)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                {confirmDialog.type === "topic"
                  ? "Are you sure you want to delete this topic and its subtopics? This action cannot be undone."
                  : "Are you sure you want to delete this subtopic? This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialog(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDeletion}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
