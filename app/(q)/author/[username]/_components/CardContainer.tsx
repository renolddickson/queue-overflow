"use client";

import React, { useEffect, useState } from "react";
import Image from "@/components/common/Image";
import "react-image-crop/dist/ReactCrop.css";
import { Plus, Pencil, Trash2, PenTool, CalendarIcon, MoreVertical, Eye, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import { fetchData, submitData, updateData, deleteData, deleteImagesFromStorage } from "@/actions/document";
import SideSheetContent from "@/app/(q)/author/[username]/_components/SheetContent";
import { DocumentData } from "@/types/api";
import { toast } from "sonner";
import Link from "next/link";
import { useHasMounted } from "@/hooks/useHasMounted";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DocumentPlaceholder from "@/components/common/DocumentPlaceholder";

interface CardContainerProps {
  userId: string;
  isDocOwner: boolean;
  initialDocuments: DocumentData[];
}

export const CardContainer = ({ userId, isDocOwner, initialDocuments }: CardContainerProps) => {
  const [documents, setDocuments] = useState<DocumentData[]>(initialDocuments);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState<boolean>(true);
  const hasMounted = useHasMounted()
  const [newDocument, setNewDocument] = useState<Omit<DocumentData, "id">>({
    title: "",
    description: "",
    cover_image: "",
    isPublished: false,
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
        const res = await fetchData<DocumentData>({
          table: "documents",
          filter: { user_id: userId, ...(isDocOwner ? {} : { isPublished: true }), },
        });
        setDocuments(res.data || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
      setIsDocumentsLoading(false);
    };

    fetchDocuments();
  }, [isDocOwner, userId]);

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

  const handleToggleChange = (name: string, value: boolean | string) => {
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
      isPublished: false,
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
        await deleteData("documents", documentToDelete);

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-50">Content Portfolio</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and explore published articles and documentation.</p>
        </div>
        {isDocOwner && (
          <Button
            onClick={() => {
              setEditingDocument(null);
              setNewDocument({ title: "", description: "", cover_image: "", isPublished: false, type: 'docs' });
              setIsSheetOpen(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 shadow-md transition-all active:scale-95 group"
          >
            <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Create New
          </Button>
        )}
      </div>

      {isDocumentsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="bg-slate-100 dark:bg-slate-800/50 h-[400px] rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <PenTool className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100 italic">No stories yet.</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">Start sharing your knowledge by creating your first post or documentation.</p>
          {isDocOwner && (
            <Button
              variant="outline"
              className="mt-6 rounded-full border-slate-300 dark:border-slate-700"
              onClick={() => setIsSheetOpen(true)}
            >
              Create your first story
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {documents.map((doc) => (
            <div key={doc.id} className="group relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 hover:-translate-y-2">
              <div className="relative h-56 w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
                {doc.cover_image ? (
                  <Image
                    src={doc.cover_image}
                    alt={doc.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <DocumentPlaceholder type={doc.type} title={doc.title} />
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  {doc.type === 'docs' && (
                    <span className="p-1.5 rounded-lg backdrop-blur-md bg-black/20 border border-white/20 text-white shadow-sm" title="Multi-page Document">
                      <Layers size={14} strokeWidth={2.5} />
                    </span>
                  )}
                  {!doc.isPublished && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-amber-500/20 border border-amber-400/30 text-amber-100">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-3 line-clamp-2 leading-tight group-hover:text-green-600 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                  {doc.description || "In this article, we explore the deep intricacies of modern development patterns and architectural decisions."}
                </p>

                <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center text-xs text-slate-400 gap-2">
                    <CalendarIcon size={14} />
                    {formatDate(doc.updated_at || new Date().toISOString())}
                  </div>

                  <div className="flex items-center gap-1">
                    <Link href={`/${doc.type}/${doc.id}`}>
                      <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-all" title="View Article">
                        <Eye size={18} />
                      </button>
                    </Link>
                    {isDocOwner && (
                      <>
                        <Link href={`/edit/${doc.type}/${doc.id}`}>
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all" title="Edit Content">
                            <PenTool size={18} />
                          </button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-full transition-all">
                              <MoreVertical size={18} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-1">
                            <DropdownMenuItem onClick={() => openEditSheet(doc)} className="rounded-xl py-2.5 px-4 cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800">
                              <Pencil className="h-4 w-4 mr-3" />
                              Edit Meta Info
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                            <DropdownMenuItem
                              className="rounded-xl py-2.5 px-4 text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
                              onClick={() => setDocumentToDelete(doc.id)}
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
