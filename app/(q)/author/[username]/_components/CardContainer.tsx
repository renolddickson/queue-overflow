"use client";

import React, { useEffect, useState } from "react";
import Image from "@/components/common/Image";
import "react-image-crop/dist/ReactCrop.css";
import { Pencil, Trash2, PenTool, CalendarIcon, MoreVertical, Eye, Layers, X, BookmarkPlus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteDocument, fetchData, submitData, updateData, deleteImagesFromStorage } from "@/actions/document";
import SideSheetContent from "@/app/(q)/author/[username]/_components/SheetContent";
import { DocumentData, User } from "@/types/api";
import { toast } from "sonner";
import Link from "next/link";
import { useHasMounted } from "@/hooks/useHasMounted";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DocumentPlaceholder from "@/components/common/DocumentPlaceholder";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CardContainerProps {
  userId: string;
  isDocOwner: boolean;
  initialDocuments: DocumentData[];
  userData: User;
}

type TabStatus = "published" | "draft" | "unlisted";

export const CardContainer = ({ userId, isDocOwner, initialDocuments, userData }: CardContainerProps) => {
  const [activeTab, setActiveTab] = useState<TabStatus>("published");
  const [documents, setDocuments] = useState<DocumentData[]>(initialDocuments);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState<boolean>(true);
  const hasMounted = useHasMounted()
  const [newDocument, setNewDocument] = useState<Omit<DocumentData, "id">>({
    title: "",
    description: "",
    cover_image: "",
    publish_state: 'published',
    type: 'docs',
  });
  const [editingDocument, setEditingDocument] = useState<DocumentData | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setNewDocument((prev) => ({
      ...prev,
      updated_at: new Date().toISOString().split("T")[0],
    }));
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsDocumentsLoading(true);
      try {
        const filter: any = { user_id: userId };

        if (isDocOwner) {
          filter.publish_state = activeTab;
        } else {
          // Public view only sees published
          filter.publish_state = 'published';
        }

        const res = await fetchData<DocumentData>({
          table: "documents",
          filter,
        });
        setDocuments(res.data || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
      setIsDocumentsLoading(false);
    };

    fetchDocuments();
  }, [isDocOwner, userId, activeTab]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (editingDocument) {
      setEditingDocument({ ...editingDocument, [name]: value });
    } else {
      setNewDocument({ ...newDocument, [name]: value });
    }
  };

  const handleToggleChange = (name: string, value: any) => {
    if (editingDocument) {
      setEditingDocument({ ...editingDocument, [name]: value });
    } else {
      setNewDocument({ ...newDocument, [name]: value });
    }
  };

  const handleAddDocument = async (newDoc?: Omit<DocumentData, "id">) => {
    const docToAdd = newDoc || newDocument;
    try {
      const res = await submitData<DocumentData>("documents", docToAdd);
      if (res.data && res.data.length > 0) {
        setDocuments((prev) => [...prev, ...(res.data as DocumentData[])]);
        toast.success("Document added successfully.");
      }
    } catch (error) {
      console.error("Error adding document:", error);
    }
    setNewDocument({
      title: "",
      description: "",
      cover_image: "",
      publish_state: 'published',
      type: 'docs'
    });
  };

  const handleEditDocument = async (updatedDoc?: DocumentData) => {
    const docToUpdate = updatedDoc || editingDocument;
    if (docToUpdate) {
      try {
        const res = await updateData("documents", docToUpdate.id, docToUpdate);
        if (res.data && res.data.length > 0) {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === docToUpdate.id ? ((res.data as DocumentData[])[0]) : doc
            )
          );
          toast.success("Document updated successfully.");
        }
      } catch (error) {
        console.error("Error updating document:", error);
      }
      setEditingDocument(null);
    }
  };

  const handleDeleteDocument = async () => {
    if (documentToDelete) {
      try {
        // Find the document object in the state using the ID
        const docToDelete = documents.find(doc => doc.id === documentToDelete);
        // Check for imageUrls and delete images if they exist
        if (docToDelete && docToDelete.cover_image) {
          try {
            await deleteImagesFromStorage([docToDelete.cover_image]);
          } catch (imgError) {
            console.error("Error deleting images:", imgError);
            // Continue with document deletion even if image deletion fails
          }
        }

        // Delete the document from the database
        await deleteDocument(documentToDelete);

        // Update the state by removing the document
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentToDelete));

        // Show success message
        toast.success("Document deleted successfully.");
      } catch (error) {
        console.error("Error deleting document:", error);
      }

      // Clear the documentToDelete variable
      setDocumentToDelete(null);
    }
  };

  const openEditSheet = (doc: DocumentData) => {
    setEditingDocument(doc);
    setIsSheetOpen(true);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto py-12">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 mb-8">
          <Tabs 
            value={activeTab} 
            onValueChange={(val) => setActiveTab(val as TabStatus)}
            className="w-auto"
          >
            <TabsList className="bg-transparent h-auto p-0 flex justify-start gap-8 border-none rounded-none">
              <TabsTrigger 
                value="published" 
                className="px-0 py-3 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-primary text-slate-500 dark:text-slate-400 data-[state=active]:text-primary dark:data-[state=active]:text-primary font-medium transition-all"
              >
                Published
              </TabsTrigger>
              <TabsTrigger 
                value="draft" 
                className="px-0 py-3 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-primary text-slate-500 dark:text-slate-400 data-[state=active]:text-primary dark:data-[state=active]:text-primary font-medium transition-all"
              >
                Drafts
              </TabsTrigger>
              <TabsTrigger 
                value="unlisted" 
                className="px-0 py-3 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary dark:data-[state=active]:border-primary text-slate-500 dark:text-slate-400 data-[state=active]:text-primary dark:data-[state=active]:text-primary font-medium transition-all"
              >
                Unlisted
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

      {isDocOwner && activeTab === 'published' && (
        <div className="mb-10 relative bg-orange-600 dark:bg-orange-700 rounded-lg p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="relative z-10 max-w-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
              Create a story to easily organize and share knowledge
            </h2>
            <Link
              href="/edit/new"
              className="bg-slate-950 hover:bg-black text-white rounded-full px-8 py-4 text-base font-semibold transition-all active:scale-95 inline-block text-center border border-white/20 shadow-xl"
            >
              Start a story
            </Link>
          </div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center shadow-xl">
              <BookmarkPlus className="text-orange-600 dark:text-orange-400 w-10 h-10 md:w-14 md:h-14" />
            </div>
          </div>

          <button className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">
            <X size={24} />
          </button>

          {/* Abstract circles decoration */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-64 h-64 bg-orange-500/30 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        </div>
      )}

      {isDocumentsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="bg-slate-100 dark:bg-slate-800/50 h-[400px] rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center max-w-xl mx-auto bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center mb-6 shadow-sm">
            <Layers className="text-slate-300 dark:text-slate-700" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 italic font-serif">Empty portfolio.</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
            {activeTab === 'published' 
              ? "When you publish stories, they will appear here for everyone to see."
              : activeTab === 'draft'
              ? "Drafts are stories you're currently working on. They are only visible to you."
              : "Unlisted stories are visible to anyone with the link, but won't show up on your profile."}
          </p>
          {isDocOwner && activeTab === 'published' && (
             <Button
                onClick={() => setIsSheetOpen(true)}
                className="bg-primary hover:bg-orange-700 text-white rounded-full px-8 shadow-md"
             >
                Create your first story
             </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {documents.map((doc) => (
            <div key={doc.id} className="group relative flex flex-col h-full bg-white dark:bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800/50 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-500 hover:-translate-y-1">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
                {doc.cover_image ? (
                  <Image
                    src={doc.cover_image}
                    alt={doc.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <DocumentPlaceholder type={doc.type} title={doc.title} />
                )}
                
                {/* Gradient Overlay for a more premium feel */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute top-4 left-4 flex gap-2">
                  {doc.type === 'docs' && (
                    <span className="p-1.5 rounded-xl backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/20 text-white shadow-sm" title="Multi-page Document">
                      <Layers size={14} strokeWidth={2.5} />
                    </span>
                  )}
                  {doc.publish_state === 'draft' ? (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100/90 text-amber-700 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-200/50 dark:border-amber-800/50 shadow-sm backdrop-blur-sm">
                      Draft
                    </span>
                  ) : doc.publish_state === 'unlisted' ? (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100/90 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700 shadow-sm backdrop-blur-sm">
                      Unlisted
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {doc.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-[13px] line-clamp-2 mb-4 leading-relaxed">
                  {doc.description || "Explore the deep intricacies of modern development patterns and architectural decisions in this comprehensive guide."}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center text-[11px] font-medium text-slate-400 gap-1.5">
                    <CalendarIcon size={12} className="text-slate-300" />
                    {formatDate(doc.updated_at || new Date().toISOString())}
                  </div>

                  <div className="flex items-center gap-0.5">
                    <Link href={`/${doc.type}/${doc.id}`}>
                      <button className="p-2 text-slate-400 hover:text-primary hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-full transition-all" title="View Article">
                        <Eye size={16} />
                      </button>
                    </Link>
                    {isDocOwner && (
                      <>
                        <Link href={`/edit/${doc.type}/${doc.id}`}>
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all" title="Edit Content">
                            <PenTool size={16} />
                          </button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-full transition-all">
                              <MoreVertical size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-1">
                            <DropdownMenuItem onSelect={() => openEditSheet(doc)} className="rounded-xl py-2.5 px-4 cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800">
                              <Pencil className="h-4 w-4 mr-3" />
                              Edit Meta Info
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                            <DropdownMenuItem
                              className="rounded-xl py-2.5 px-4 text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
                              onSelect={() => setDocumentToDelete(doc.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-3" />
                              Delete permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sheet and Dialog remain functional */}
      <SideSheetContent
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        handleEditDocument={handleEditDocument}
        handleAddDocument={handleAddDocument}
        editingDocument={editingDocument}
        handleInputChange={handleInputChange}
        handleToggleChange={handleToggleChange}
        newDocument={newDocument}
      />

      <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <AlertDialogContent className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-serif">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              This action is permanent. Deleting this story will remove all associated content from our servers and storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-full px-6 border-slate-200 dark:border-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              className="rounded-full px-6 bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
