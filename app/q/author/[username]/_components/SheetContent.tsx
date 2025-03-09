// In SideSheetContent.tsx
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from "next/image";
import { DocumentData } from '@/types/api';
import { handleFileChange, readFileAsDataURL } from '@/utils/helper';
import { toast } from 'sonner';
import { uploadImage } from '@/actions/document';

interface SideSheetContentProps {
  isSheetOpen: boolean;
  setIsSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleEditDocument: (doc?: DocumentData) => Promise<void>;
  handleAddDocument: (doc?: Omit<DocumentData, "id">) => Promise<void>;
  editingDocument: DocumentData | null;
  handleInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  newDocument: Omit<DocumentData, "id">;
}

const SideSheetContent: React.FC<SideSheetContentProps> = ({
  isSheetOpen,
  setIsSheetOpen,
  handleEditDocument,
  handleAddDocument,
  editingDocument,
  handleInputChange,
  newDocument,
}) => {
  // Local state for storing the cover image preview and file object
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear the preview and file when the sheet closes
  useEffect(() => {
    if (!isSheetOpen) {
      setUploadedImage(null);
      setCoverImageFile(null);
    }
  }, [isSheetOpen]);

  // Determine which image to preview: if the user uploaded a new one, use that;
  // otherwise, if editing an existing document, show its cover_image;
  // or fallback to newDocument.cover_image if available.
  const previewImage = uploadedImage || (editingDocument ? editingDocument.cover_image : newDocument.cover_image);

  // Update both image preview and file states using the common helper
  const onCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await handleFileChange(e, setUploadedImage, setCoverImageFile);
    } catch (error) {
      console.error("Cover image upload error:", error);
      toast.error("Failed to read cover image");
    }
  };

  const handleCoverImageUpload = async () => {
    setIsSubmitting(true);
    try {
      let coverImageUrl: string | null = null;
      if (coverImageFile) {
        const base64Data = await readFileAsDataURL(coverImageFile);
        coverImageUrl = await uploadImage('documents', {
          fileName: coverImageFile.name,
          fileContent: base64Data,
        });
      }

      if (editingDocument) {
        // Build an updated document using a local variable
        const updatedDocument = coverImageUrl
          ? { ...editingDocument, cover_image: coverImageUrl }
          : editingDocument;
        await handleEditDocument(updatedDocument);
      } else {
        // Build an updated new document
        const updatedNewDocument = coverImageUrl
          ? { ...newDocument, cover_image: coverImageUrl }
          : newDocument;
        await handleAddDocument(updatedNewDocument);
      }
      setIsSheetOpen(false);
    } catch (error) {
      console.error("Error updating cover image", error);
      toast.error("Failed to update cover image");
    } finally {
      // Clear the preview and file after submission
      setUploadedImage(null);
      setCoverImageFile(null);
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {editingDocument ? "Edit Document" : "Add New Document"}
          </SheetTitle>
          <SheetDescription>
            {editingDocument
              ? "Make changes to your document here."
              : "Fill in the details to create a new document."}
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={editingDocument ? editingDocument.title : newDocument.title}
              onChange={handleInputChange}
              placeholder="Enter document title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={editingDocument ? editingDocument.description : newDocument.description}
              onChange={handleInputChange}
              placeholder="Enter document description"
              rows={4}
            />
          </div>
          {/* Image upload & preview */}
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="coverImage">Cover Image</Label>
            <input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={onCoverImageChange}
              className="cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
            />
            {previewImage && (
              <div className="relative h-32 mt-2 rounded-md overflow-hidden">
                <Image
                  src={previewImage}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <SheetClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </SheetClose>
          <Button onClick={handleCoverImageUpload} disabled={isSubmitting}>
            {isSubmitting
              ? "Submitting..."
              : editingDocument
              ? "Save Changes"
              : "Add Document"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SideSheetContent;
