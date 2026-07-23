"use client";

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
import { handleFileChange } from '@/utils/helper';
import { toast } from 'sonner';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import CloudinaryUpload from '@/components/common/CloudinaryUpload';
import { X, Tag, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const DEFAULT_KEYWORDS = [
  'Technology',
  'Design',
  'Business',
  'Lifestyle',
  'Education'
];

interface SideSheetContentProps {
  isSheetOpen: boolean;
  setIsSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleEditDocument: (doc?: DocumentData) => Promise<void>;
  handleAddDocument: (doc?: Omit<DocumentData, "id">) => Promise<void>;
  editingDocument: DocumentData | null;
  handleInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleToggleChange: (name: string, value: any) => void;
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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    if (!isSheetOpen) {
      setUploadedImage(null);
      document.body.style.overflow = 'auto';
      document.body.style.pointerEvents = 'auto';
    }
  }, [isSheetOpen]);
  
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.pointerEvents = 'auto';
    };
  }, []);

  const previewImage = uploadedImage || (editingDocument ? editingDocument.cover_image : newDocument.cover_image);

  const handleSave = async () => {
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
      console.error("Error updating document", error);
      toast.error("Failed to update document");
    } finally {
      setUploadedImage(null);
      setIsSubmitting(false);
    }
  };

  const currentKeywords = editingDocument?.keywords || newDocument.keywords || [];

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
        
        <div className="grid gap-6 py-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="publish_state" className="text-xs font-bold uppercase tracking-wider text-slate-500">Visibility</Label>
              <Select 
                value={editingDocument ? editingDocument.publish_state : newDocument.publish_state} 
                onValueChange={(value) => handleToggleChange('publish_state', value)}
              >
                <SelectTrigger id="publish_state" className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800">
                  <SelectGroup>
                    <SelectItem value="published">Published (Public)</SelectItem>
                    <SelectItem value="draft">Draft (Private)</SelectItem>
                    <SelectItem value="unlisted">Unlisted (Link only)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-slate-500">Content Type</Label>
              <Select 
                value={editingDocument ? editingDocument.type : newDocument.type} 
                onValueChange={(value) => handleToggleChange('type', value)} 
                disabled={!!editingDocument}
              >
                <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="posts">Posts (Single Page)</SelectItem>
                  <SelectItem value="docs">Docs (Multi-page)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-slate-500">Title</Label>
              <Input
                id="title"
                name="title"
                value={editingDocument ? editingDocument.title : newDocument.title}
                onChange={handleInputChange}
                className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
                placeholder="Enter document title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={editingDocument ? editingDocument.description : newDocument.description}
                onChange={handleInputChange}
                className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl resize-none"
                placeholder="Enter document description"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Tag size={12} /> Keywords & Tags
            </Label>
            
            <div className="flex flex-wrap gap-2 min-h-[3rem] p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
              {currentKeywords.length > 0 ? (
                currentKeywords.map((kw) => (
                  <Badge 
                    key={kw} 
                    variant="secondary" 
                    className="pl-2.5 pr-1 py-1 gap-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none shadow-sm transition-all"
                  >
                    <span className="text-[10px] font-bold">{kw}</span>
                    <button 
                      onClick={() => handleToggleChange('keywords', currentKeywords.filter(k => k !== kw))}
                      className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 p-2 italic">Add keywords to reach more readers...</p>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
                <Input 
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (keywordInput.trim() && !currentKeywords.includes(keywordInput.trim())) {
                        handleToggleChange('keywords', [...currentKeywords, keywordInput.trim()]);
                        setKeywordInput('');
                      }
                    }
                  }}
                  placeholder="Custom tag..."
                  className="pl-8 h-10 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
              <Button 
                onClick={() => {
                  if (keywordInput.trim() && !currentKeywords.includes(keywordInput.trim())) {
                    handleToggleChange('keywords', [...currentKeywords, keywordInput.trim()]);
                    setKeywordInput('');
                  }
                }}
                variant="secondary"
                size="sm"
                className="h-10 px-4 rounded-xl text-xs font-bold"
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_KEYWORDS.map(kw => {
                const isSelected = currentKeywords.includes(kw);
                return (
                  <button
                    key={kw}
                    onClick={() => {
                      if (!isSelected) {
                        handleToggleChange('keywords', [...currentKeywords, kw]);
                      } else {
                        handleToggleChange('keywords', currentKeywords.filter(k => k !== kw));
                      }
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all",
                      isSelected
                        ? "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 border-transparent"
                        : "bg-white dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                    )}
                  >
                    {kw}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cover Image</Label>
            <div className="flex flex-col gap-3">
                <CloudinaryUpload 
                    onSuccess={(url) => setUploadedImage(url)}
                    folder="documents"
                    buttonText="Upload New Cover"
                />
                {previewImage && (
                <div className="relative h-40 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group/img">
                    <Image
                      src={previewImage}
                      alt="Cover preview"
                      fill
                      className="object-cover group-hover/img:scale-105 transition-transform duration-500"
                    />
                    <button 
                        onClick={() => setUploadedImage(null)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-slate-900/90 rounded-full shadow-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                    >
                        <X size={14} />
                    </button>
                </div>
                )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Button onClick={handleSave} disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all">
            {isSubmitting ? "Saving..." : editingDocument ? "Update Metadata" : "Create Document"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" disabled={isSubmitting} className="h-12 px-6 rounded-xl border-slate-200 dark:border-slate-800 font-bold">
              Cancel
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SideSheetContent;
