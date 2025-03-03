"use client";
import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import "react-image-crop/dist/ReactCrop.css";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { useUserStore } from "@/stores/store";
import { getUid } from "@/actions/document";
import SideSheetContent from "@/components/SheetContent";
import { DocumentData, User } from "@/types/api";

export default function DocumentList({ params }: { params: Promise<{ username: string }> }) {  
  // Directly destructure username from params (no need for use())
  const {username} = use(params);
  const [currentUser,setCurrentUser] = useState<User | null>(null)
  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    const fetchUserByUid = async () => {
      try {
        const uid = await getUid();
        if (uid) {
          await fetchUser(uid);
        }
      } catch (error) {
        console.error("Error fetching UID:", error);
      }
    };

    fetchUserByUid();
  }, [fetchUser]);

  useEffect(() => {
    console.log("user",user);
    
    setCurrentUser(user)
  }, [user, username]);

  // State for documents, new document, editing, etc.
  const [documents, setDocuments] = useState<DocumentData[]>([
    {
      id: "1",
      title: "Getting Started with React",
      description: "A comprehensive guide to React fundamentals for beginners.",
      cover_image: "/placeholder.svg?height=200&width=300",
      updated_at: "2023-10-15",
    },
    {
      id: "2",
      title: "Advanced CSS Techniques",
      description: "Learn advanced CSS techniques to create stunning web designs.",
      cover_image: "/placeholder.svg?height=200&width=300",
      updated_at: "2023-11-22",
    },
    {
      id: "3",
      title: "JavaScript Best Practices",
      description: "Discover the best practices for writing clean and efficient JavaScript code.",
      cover_image: "/placeholder.svg?height=200&width=300",
      updated_at: "2024-01-05",
    },
  ]);

  const [newDocument, setNewDocument] = useState<Omit<DocumentData, "id">>({
    title: "",
    description: "",
    cover_image: "",
    updated_at: new Date().toISOString().split("T")[0],
  });

  const [editingDocument, setEditingDocument] = useState<DocumentData | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  const handleAddDocument = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    setDocuments([...documents, { id: newId, ...newDocument }]);
    setNewDocument({
      title: "",
      description: "",
      cover_image: "",
      updated_at: new Date().toISOString().split("T")[0],
    });
    setIsSheetOpen(false);
  };

  const handleEditDocument = () => {
    if (editingDocument) {
      setDocuments(documents.map((doc) => (doc.id === editingDocument.id ? editingDocument : doc)));
      setEditingDocument(null);
      setIsSheetOpen(false);
    }
  };

  const handleDeleteDocument = () => {
    if (documentToDelete) {
      setDocuments(documents.filter((doc) => doc.id !== documentToDelete));
      setDocumentToDelete(null);
    }
  };

  const openEditSheet = (document: DocumentData) => {
    setEditingDocument(document);
    setIsSheetOpen(true);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Documents</h1>
        {/* {currentUser && (username === currentUser?.username) && ( */}
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
            <Plus className="mr-2 h-4 w-4" /> Add Document
          </Button>
        {/* )} */}
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No documents found</p>
          {username === currentUser?.username && (
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
              <div className="relative h-48 w-full">
                <Image
                  src={document.cover_image || "/placeholder.svg"}
                  alt={document.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-2 line-clamp-1">{document.title}</h2>
                <p className="text-muted-foreground line-clamp-3">{document.description}</p>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <span>Published: {formatDate(document.updated_at)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 p-4 pt-0">
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
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Document Sheet */}
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
      <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocument} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
