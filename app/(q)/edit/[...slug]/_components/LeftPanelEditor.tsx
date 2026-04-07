"use client"
import { Plus, Trash, FilePenLine } from "lucide-react"
import type { Topics } from "@/types/api"
import { useEffect, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
  addTopic as apiAddTopic,
  updateTopic as apiUpdateTopic,
  addSubTopic as apiAddSubTopic,
  deleteSubTopic as apiDeleteSubTopic,
  updateSubTopic as apiUpdateSubTopic,
  bulkDeleteData,
} from "@/actions/document"
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
import { useTopicStore } from "@/stores/topicStore"

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
  const { 
    topics, 
    loader, 
    fetchAllTopics, 
    addTopicOptimistic, 
    updateTopicOptimistic, 
    removeTopicOptimistic,
    addSubTopicOptimistic,
    updateSubTopicOptimistic,
    removeSubTopicOptimistic
  } = useTopicStore()

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
    fetchAllTopics(docId)
  }, [docId, fetchAllTopics])

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

    addTopicOptimistic(newLocalTopic)
    startEditingTopic(tempId, newLocalTopic.title)
    try {
      const res = await apiAddTopic(docId, newTopicData)
      const updatedTopic = { ...res.data, subTopics: [] };
      updateTopicOptimistic(tempId, updatedTopic)
      
      // If we were editing this topic, update the ID to the real one
      if (editingTopicId?.id === tempId) {
        setEditingTopicId({ id: res.data.id, loading: false })
      }
    } catch (error) {
      console.error("Error adding topic:", error)
      removeTopicOptimistic(tempId)
    }
  }

  const saveTopicEdit = async (topicId: string) => {
    const oldTopic = topics.find((t) => t.id === topicId)
    if (!oldTopic || tempTopicTitle == oldTopic.title) {
      setEditingTopicId(null)
      return
    }

    updateTopicOptimistic(topicId, { title: tempTopicTitle })

    try {
      const updatedFields = { title: tempTopicTitle }
      setEditingTopicId(prev => (prev ? { ...prev, loading: true } : null));
      const res = await apiUpdateTopic(topicId, updatedFields)
      // Don't overwrite subTopics if we just updated the title
      updateTopicOptimistic(topicId, { title: res.data.title })
    } catch (error) {
      console.error("Error updating topic title:", error)
      updateTopicOptimistic(topicId, { title: oldTopic.title })
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
    updateTopicOptimistic(topicId, { icon: newIcon })

    try {
      await apiUpdateTopic(topicId, { icon: newIcon })
    } catch (error) {
      console.error("Error updating topic icon:", error)
      updateTopicOptimistic(topicId, { icon: oldTopic.icon })
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

    addSubTopicOptimistic(topicId, newLocalSubtopic)
    startEditingSubTopic(topicId, tempId, newLocalSubtopic.title)
    try {
      const res = await apiAddSubTopic(topicId, newSubTopicData)
      updateSubTopicOptimistic(topicId, tempId, res.data)
      
      // If we were editing this subtopic, update the ID to the real one
      if (editingSubTopic?.subTopicId === tempId) {
        setEditingSubTopic({ topicId, subTopicId: res.data.id, loading: false })
      }
    } catch (error) {
      console.error("Error adding subtopic:", error)
      removeSubTopicOptimistic(topicId, tempId)
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

    const oldSubTopicTitle = subTopic.title
    updateSubTopicOptimistic(topicId, subTopicId, { title: tempSubTopicTitle })

    try {
      const updatedFields = { title: tempSubTopicTitle }
      setEditingSubTopic(prev => (prev ? { ...prev, loading: true } : null))
      if (tempSubTopicTitle !== subTopic.title) {
        const res = await apiUpdateSubTopic(subTopicId, updatedFields)
        updateSubTopicOptimistic(topicId, subTopicId, res.data)
      }
    } catch (error) {
      console.error("Error updating subtopic title:", error)
      updateSubTopicOptimistic(topicId, subTopicId, { title: oldSubTopicTitle })
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
      removeTopicOptimistic(topicId)
      try {
        await bulkDeleteData("sections", [topicId])
      } catch (error) {
        console.error("Error deleting topic:", error)
        useTopicStore.getState().setTopics(oldTopics)
      }
    } else if (confirmDialog.type === "subtopic" && confirmDialog.subTopicId) {
      const { topicId, subTopicId } = confirmDialog
      const currentTopic = topics.find(t => t.id === topicId)
      if (!currentTopic) return
      const oldSubTopics = [...currentTopic.subTopics]
      
      removeSubTopicOptimistic(topicId, subTopicId)
      try {
        await apiDeleteSubTopic(subTopicId)
      } catch (error) {
        console.error("Error deleting subtopic:", error)
        updateTopicOptimistic(topicId, { subTopics: oldSubTopics })
      }
    }
    setConfirmDialog(null)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div>
          {loader ? (
            // Loading skeleton
            <div className="animate-pulse mt-4 space-y-4 px-4">
              <div className="h-6 bg-gray-300 rounded w-full"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {topics.map((topic) => {
                const isEditing = editingTopicId?.id === topic.id
                return (
                  <div key={topic.id}>
                    <div className="flex items-center gap-2 group px-2 py-1.5 rounded-md transition-all relative">
                      {/* Icon Popover */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Icon name={topic.icon} className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
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
                            className={`text-sm font-semibold flex-grow cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis transition-colors ${pathname === `/edit/${type}/${docId}/${topic.id}` ? 'text-blue-600' : 'text-slate-700 dark:text-slate-200 hover:text-blue-500'}`}
                            onClick={() => navigate(`/edit/${type}/${docId}/${topic.id}`)}
                            onDoubleClick={() =>
                              startEditingTopic(topic.id, topic.title)
                            }
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
                      {/* Add Subtopic Dotted Button */}
                      <button
                        className="flex items-center gap-2 px-2 py-1 text-xs text-slate-400 hover:text-slate-600 border border-dashed border-slate-200 rounded-sm hover:bg-slate-50 transition-all w-full mt-1 group"
                        onClick={() => addSubTopic(topic.id)}
                      >
                        <Plus className="h-3 w-3 text-slate-300 group-hover:text-slate-500" />
                        <span>Add Subtopic</span>
                      </button>
                    </div>
                  </div>
                )
              })}
              
              {/* Add Topic Dotted Button at the end */}
              {!loader && (
                <button
                  className="mt-4 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 border-2 border-dashed border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-all"
                  onClick={addTopic}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Topic</span>
                </button>
              )}
              {/* Extra spacing at bottom */}
              <div className="h-20" />
            </div>
          )}
        </div>
      </div>

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
                {confirmDialog?.type === "topic"
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
    </div>
  )
}
