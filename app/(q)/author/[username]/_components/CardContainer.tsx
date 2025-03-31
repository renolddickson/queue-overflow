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
import SideSheetContent from "@/app/(q)/author/[username]/_components/SheetContent";
import { DocumentData } from "@/types/api";
import { toast } from "sonner";
import Link from "next/link";
import { useHasMounted } from "@/hooks/useHasMounted";

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
    type: 'blog',
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
          filter: { user_id: userId,...(isDocOwner ? {} : { isPublished: true }),},
        });
        setDocuments(res.data || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
      setIsDocumentsLoading(false);
    };

    fetchDocuments();
  }, [userId]);

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

  const handleToggleChange = (name:string,value:boolean | string) => {
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
      type: 'blog'
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
    <div className="container mx-auto py-8 border-t">
      <div className="flex justify-end items-center mb-8">
        {/* <h1 className="text-3xl font-bold">My Documents</h1> */}
        {isDocOwner && (
          <Button
            className="flex gap-2"
            onClick={() => {
              setEditingDocument(null);
              setNewDocument({
                title: "",
                description: "",
                cover_image: "",
                isPublished: false,
                type: 'blog'
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
            <div key={idx} className={`${hasMounted?'animate-pulse':''} bg-gray-200 h-64 rounded`}></div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No documents found</p>
          {isDocOwner && (
            <Button
              onClick={() => {
                setEditingDocument(null);
                setNewDocument({
                  title: "",
                  description: "",
                  cover_image: "",
                  isPublished: false,
                  type: 'blog',
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
              <Link href={`/q/${doc.type}/${doc.id}`}>
                <div className="relative h-48 w-full">
                  <Image
                    src={doc.cover_image || "/assets/no-thumbnail.jpg"}
                    alt={doc.title}
                    fill
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/no-thumbnail.jpg";
                    }}
                    className="object-contain"
                  />
                </div>
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold mb-2 line-clamp-1">
                    {doc.title}
                  </h2>
                  <p className="text-muted-foreground line-clamp-3">
                    {doc.description}
                  </p>
                  {doc?.updated_at &&
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <span>Published: {formatDate(doc?.updated_at)}</span>
                  </div>
                  }
                </CardContent>
              </Link>
              {isDocOwner && (
                <CardFooter className="flex justify-between gap-2 p-4 pt-0">
                  <Link href={`/edit/${doc.type}/${doc.id}`}>
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
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        handleEditDocument={handleEditDocument}
        handleAddDocument={handleAddDocument}
        editingDocument={editingDocument}
        handleInputChange={handleInputChange}
        handleToggleChange={handleToggleChange}
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
