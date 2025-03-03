"use client";

import React, { useState, useEffect } from "react";
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
import {
  deleteData,
  fetchData,
  fetchUserData,
  getUid,
  submitData,
  updateData,
} from "@/actions/document";
import SideSheetContent from "@/components/SheetContent";
import { DocumentData, User } from "@/types/api";
import { Toaster, toast } from "sonner";
import Link from "next/link";

interface DocumentListProps {
  params: Promise<{ username: string }>;
}

export default function DocumentList({ params }: DocumentListProps) {
  const { username } = React.use(params);

  const [userData, setUserData] = useState<User | null>(null);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState<boolean>(true);

  const [newDocument, setNewDocument] = useState<Omit<DocumentData, "id">>({
    title: "",
    description: "",
    cover_image: "",
    updated_at: new Date().toISOString().split("T")[0],
  });
  const [editingDocument, setEditingDocument] = useState<DocumentData | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      const uid = await getUid();
      if (uid) {
        const { data } = await fetchUserData(uid);
        setUserData(data);
        console.log(data);

      }
    };
    fetchUser();
  }, []);

  // Fetch all documents on mount
  useEffect(() => {
    const fetchAllDocuments = async () => {
      setIsDocumentsLoading(true);
      const { data } = await fetchData<DocumentData>({ table: "documents" });
      setDocuments(data);
      setIsDocumentsLoading(false);
    };
    fetchAllDocuments();
  }, []);

  // Handle input changes for add/edit
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingDocument) {
      setEditingDocument({
        ...editingDocument,
        [name]: value,
      });
    } else {
      setNewDocument({
        ...newDocument,
        [name]: value,
      });
    }
  };

  // Create new document
  const handleAddDocument = async () => {
    const { data } = await submitData("documents", newDocument);
    if (data && data.length > 0) {
      setDocuments((prev) => [...prev, ...(data as DocumentData[])]);
      toast.success("Document added successfully.");
    }
    setNewDocument({
      title: "",
      description: "",
      cover_image: "",
      updated_at: new Date().toISOString().split("T")[0],
    });
    setIsSheetOpen(false);
  };

  // Update an existing document
  const handleEditDocument = async () => {
    if (editingDocument) {
      const { data } = await updateData("documents", editingDocument.id, editingDocument);
      if (data && data.length > 0) {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === editingDocument.id ? (data as DocumentData[])[0] : doc
          )
        );
        toast.success("Document updated successfully.");
      }
      setEditingDocument(null);
      setIsSheetOpen(false);
    }
  };

  // Delete a document
  const handleDeleteDocument = async () => {
    if (documentToDelete) {
      await deleteData("documents", documentToDelete);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentToDelete));
      toast.success("Document deleted successfully.");
      setDocumentToDelete(null);
    }
  };

  const openEditSheet = (document: DocumentData) => {
    setEditingDocument(document);
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
      {/* Place the Toaster component at the root of your UI */}
      <Toaster />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Documents</h1>
        {username === userData?.user_name && (
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
            <Plus className="h-4 w-4" /> <span className="hidden md:block">Add Document</span>
          </Button>
        )}
      </div>

      {isDocumentsLoading ? (
        // Skeleton loader while documents load
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse bg-gray-200 h-64 rounded"></div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No documents found</p>
          {username === userData?.user_name && (
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
          {documents.map((document) => (
            <Card key={document.id} className="overflow-hidden">
              <Link href={`/q/view/${document.id}`}>
                <div className="relative h-48 w-full">
                  <Image
                    src={document.cover_image || "/placeholder.svg"}
                    alt={document.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold mb-2 line-clamp-1">
                    {document.title}
                  </h2>
                  <p className="text-muted-foreground line-clamp-3">
                    {document.description}
                  </p>
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <span>Published: {formatDate(document.updated_at)}</span>
                  </div>
                </CardContent>
              </Link>
              {username === userData?.user_name && (
                <CardFooter className="flex justify-between gap-2 p-4 pt-0">
                  <Link href={`/q/edit/${document.id}`}><Button><PenTool />Edit document</Button></Link>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEditSheet(document)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setDocumentToDelete(document.id)}
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

      {/* SideSheet for Add/Edit */}
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

      {/* Delete Confirmation Dialog */}
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
}
