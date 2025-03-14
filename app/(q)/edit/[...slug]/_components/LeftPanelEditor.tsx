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
}: {
  navigate: (path: string) => void
  docId: string
}) {
  const [topics, setTopics] = useState<Topics[]>([])
  const [loader, setLoader] = useState(false)

  // For editing topic title only
  const [editingTopicId, setEditingTopicId] = useState<{id:string,loading:boolean} | null>(null)
  const [tempTopicTitle, setTempTopicTitle] = useState("")

  // New state for editing subtopic title
  const [editingSubTopic, setEditingSubTopic] = useState<{ topicId: string; subTopicId: string,loading:boolean } | null>(null)
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
    if (!oldTopic || tempTopicTitle== oldTopic.title) return

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
    setEditingSubTopic({ topicId, subTopicId,loading:false })
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
      setEditingSubTopic(prev => (prev ? { ...prev,loading:true }:null))
      if(tempSubTopicTitle !== subTopic.title){
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
    setEditingTopicId({id:topicId,loading:true})
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
              const isEditing = editingTopicId?.id === topic.id
              return (
                <div key={topic.id}>
                  <div className="flex items-center gap-2 rounded-sm px-2 py-2 transition relative group">
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
                      <div className="relative text-black">
                      <input
                        type="text"
                        value={tempTopicTitle}
                        onChange={(e) => setTempTopicTitle(e.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            saveTopicEdit(topic.id);
                          }}}
                          onBlur={() => saveTopicEdit(topic.id)}
                          className="border rounded-sm px-2 py-1 flex-grow"
                        autoFocus
                      />
                        {editingTopicId.loading && (
                          <div className="absolute inset-y-0 right-2 flex items-center">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <span
                          className="font-medium flex-grow cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]"
                          onDoubleClick={() =>
                            startEditingTopic(topic.id, topic.title)
                          }
                          title={topic.title}
                        >
                          {topic.title}
                        </span>
                        <div className="flex justify-end absolute right-0 w-[30%] bg-gradient-to-r from-[rgba(249,250,251,0.2)] via-[rgba(249,250,251,0.8)] to-[#F9FAFB] opacity-0 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTopicHandler(topic.id)}
                            className="transition-opacity"
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
                      </>
                    )}
                  </div>

                  {/* Subtopics */}
                  <div className="ml-6">
                    {topic.subTopics.map((sub) => {
                      const isEditingSub =
                        editingSubTopic &&
                        editingSubTopic.topicId === topic.id &&
                        editingSubTopic.subTopicId === sub.id
                        const isLoading = editingSubTopic?.loading
                      return (
                        <div
                          key={sub.id}
                          className={`flex items-center justify-between cursor-pointer group ${pathname === `/edit/${docId}/${sub.id}`
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                        >
                          {isEditingSub ? (
                            <div className="relative text-black">
                            <input
                              type="text"
                              value={tempSubTopicTitle}
                              onChange={(e) =>
                                setTempSubTopicTitle(e.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  saveSubTopicEdit(topic.id, sub.id);
                                }}}
                              onBlur={() =>
                                saveSubTopicEdit(topic.id, sub.id)
                              }
                              autoFocus
                              className="border rounded-sm px-2 py-1 flex-grow"
                            />
                              {isLoading && (
                                <div className="absolute inset-y-0 right-2 flex items-center">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                            <span
                              className="block rounded-sm px-2 py-2 text-sm transition flex-grow whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]"
                              title={sub.title}
                              onDoubleClick={() =>
                                startEditingSubTopic(topic.id, sub.id, sub.title)
                              }
                            >
                              {sub.title}
                            </span>
                          {pathname !== `/edit/${docId}/${sub.id}` && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  navigate(`/edit/${docId}/${sub.id}`)
                                }
                              >
                                <FilePenLine className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  deleteSubTopicHandler(topic.id, sub.id)
                                }
                              >
                                <Trash className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          )}
                          </>
                          )}
                        </div>
                      )
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
