"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import "react-image-crop/dist/ReactCrop.css";
import { Plus, Pencil, Trash2, PenTool } from "lucide-react";
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
import { fetchData, submitData, updateData, deleteData } from "@/actions/document";
import SideSheetContent from "@/components/documents/SheetContent";
import { DocumentData } from "@/types/api";
import { Toaster, toast } from "sonner";
import Link from "next/link";

interface CardContainerProps {
    userId: string;
  documentOwner: boolean;
}

export const CardContainer = ({ userId, documentOwner }: CardContainerProps) => {
  // State for storing fetched documents
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState<boolean>(true);

  // States for new/edit document form and dialog visibility
  const [newDocument, setNewDocument] = useState<Omit<DocumentData, "id">>({
    title: "",
    description: "",
    cover_image: "",
    updated_at: new Date().toISOString().split("T")[0],
  });
  const [editingDocument, setEditingDocument] = useState<DocumentData | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Client-side fetch of documents using fetchData inside useEffect
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsDocumentsLoading(true);
      try {
        // Here we assume your fetchData function supports filtering by username.
        const res = await fetchData<DocumentData>({
          table: "documents",
          filter: [{ user_id: userId }],
        });
        setDocuments(res.data || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
      setIsDocumentsLoading(false);
    };

    fetchDocuments();
  }, [userId]);

  // Handler for input changes in the add/edit form
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

  // Create new document action
  const handleAddDocument = async () => {
    try {
      const res = await submitData<DocumentData>("documents", newDocument);
      if (res.data && res.data.length > 0) {
        setDocuments((prev) => [...prev, ...(res.data  as DocumentData[])]);
        toast.success("Document added successfully.");
      }
    } catch (error) {
      console.error("Error adding document:", error);
    }
    setNewDocument({
      title: "",
      description: "",
      cover_image: "",
      updated_at: new Date().toISOString().split("T")[0],
    });
    setIsSheetOpen(false);
  };

  // Update document action
  const handleEditDocument = async () => {
    if (editingDocument) {
      try {
        const res = await updateData("documents", editingDocument.id, editingDocument);
        if (res.data && res.data.length > 0) {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === editingDocument.id ? ((res.data  as DocumentData[])[0]) : doc
            )
          );
          toast.success("Document updated successfully.");
        }
      } catch (error) {
        console.error("Error updating document:", error);
      }
      setEditingDocument(null);
      setIsSheetOpen(false);
    }
  };

  // Delete document action
  const handleDeleteDocument = async () => {
    if (documentToDelete) {
      try {
        await deleteData("documents", documentToDelete);
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentToDelete));
        toast.success("Document deleted successfully.");
      } catch (error) {
        console.error("Error deleting document:", error);
      }
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
    <div className="container mx-auto py-8 px-4">
      <Toaster />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Documents</h1>
        {documentOwner && (
          <Button
            className="flex gap-2"
            onClick={() => {
              setEditingDocument(null);
              setNewDocument({
                title: "",
                description: "",
                cover_image: "",
                updated_at: new Date().toISOString().split("T")[0],
              });
              setIsSheetOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:block">Add Document</span>
          </Button>
        )}
      </div>

      {isDocumentsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="animate-pulse bg-gray-200 h-64 rounded"></div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No documents found</p>
          {documentOwner && (
            <Button
              onClick={() => {
                setEditingDocument(null);
                setNewDocument({
                  title: "",
                  description: "",
                  cover_image: "",
                  updated_at: new Date().toISOString().split("T")[0],
                });
                setIsSheetOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Create your first document
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="overflow-hidden">
              <Link href={`/q/view/${doc.id}`}>
                <div className="relative h-48 w-full">
                  <Image
                    src={doc.cover_image || "/placeholder.svg"}
                    alt={doc.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold mb-2 line-clamp-1">
                    {doc.title}
                  </h2>
                  <p className="text-muted-foreground line-clamp-3">
                    {doc.description}
                  </p>
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <span>Published: {formatDate(doc.updated_at)}</span>
                  </div>
                </CardContent>
              </Link>
              {documentOwner && (
                <CardFooter className="flex justify-between gap-2 p-4 pt-0">
                  <Link href={`/q/edit/${doc.id}`}>
                    <Button>
                      <PenTool /> Edit document
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditSheet(doc)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setDocumentToDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      <SideSheetContent
        setNewDocument={setNewDocument}
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        handleEditDocument={handleEditDocument}
        handleAddDocument={handleAddDocument}
        editingDocument={editingDocument}
        setEditingDocument={setEditingDocument}
        handleInputChange={handleInputChange}
        newDocument={newDocument}
      />

      <AlertDialog
        open={!!documentToDelete}
        onOpenChange={(open) => !open && setDocumentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
