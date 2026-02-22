"use client";

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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import CloudinaryUpload from '@/components/common/CloudinaryUpload';
import { X } from 'lucide-react';

interface SideSheetContentProps {
  isSheetOpen: boolean;
  setIsSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleEditDocument: (doc?: DocumentData) => Promise<void>;
  handleAddDocument: (doc?: Omit<DocumentData, "id">) => Promise<void>;
  editingDocument: DocumentData | null;
  handleInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleToggleChange: (name: string, value: boolean | string) => void;
  newDocument: Omit<DocumentData, "id">;
}

const SideSheetContent: React.FC<SideSheetContentProps> = ({
  isSheetOpen,
  setIsSheetOpen,
  handleEditDocument,
  handleAddDocument,
  editingDocument,
  handleInputChange,
  handleToggleChange,
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
      // Forcefully restore body scrolling and pointer events
      document.body.style.overflow = 'auto';
      document.body.style.pointerEvents = 'auto';
    }
  }, [isSheetOpen]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.pointerEvents = 'auto';
    };
  }, []);

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
      const coverImageUrl = uploadedImage;

      if (editingDocument) {
        const updatedDocument = coverImageUrl
          ? { ...editingDocument, cover_image: coverImageUrl }
          : editingDocument;
        await handleEditDocument(updatedDocument);
      } else {
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
      setUploadedImage(null);
      setCoverImageFile(null);
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen} modal={false}>
      <SheetContent 
        className="sm:max-w-md overflow-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
      >
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
          <div className="flex items-center gap-4 pb-2">
            <div className="grid gap-2 w-full">
              <Label htmlFor="publish_state">Visibility State</Label>
              <Select 
                value={editingDocument ? editingDocument.publish_state : newDocument.publish_state} 
                onValueChange={(value) => handleToggleChange('publish_state', value)}
              >
                <SelectTrigger id="publish_state" className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800">
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="published" className="rounded-xl">Published (Public)</SelectItem>
                    <SelectItem value="draft" className="rounded-xl">Draft (Private)</SelectItem>
                    <SelectItem value="unlisted" className="rounded-xl">Unlisted (Link only)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={editingDocument ? editingDocument.type : newDocument.type} onValueChange={(value) => handleToggleChange('type', value)} disabled={!!editingDocument}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Type</SelectLabel>
                  <SelectItem value="posts">Posts (Single Page)</SelectItem>
                  <SelectItem value="docs">Docs (Multi-page)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
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
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="coverImage">Cover Image</Label>
            <div className="flex flex-col gap-3">
                <CloudinaryUpload 
                    onSuccess={(url) => {
                        setUploadedImage(url);
                    }}
                    folder="documents"
                    buttonText="Upload Cover Image"
                />
                {previewImage && (
                <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <Image
                    src={previewImage}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                    />
                    <button 
                        onClick={() => setUploadedImage(null)}
                        className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-slate-900/80 rounded-full shadow-sm"
                    >
                        <X size={14} />
                    </button>
                </div>
                )}
            </div>
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
