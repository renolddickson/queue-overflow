import React, { useRef, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Label } from './ui/label';
import { Button } from './ui/button';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@radix-ui/react-select';
import { DialogHeader, DialogFooter } from './ui/dialog';
import Image from "next/image"
import { DocumentData } from '@/types/api';

interface ExtendedCrop extends Crop {
    aspect?: number
  }

interface ImageUploadWithCropProps {
    onCropComplete: (croppedImage: string) => void
    initialImage?: string
}

interface SideSheetContentProps {
    isSheetOpen: boolean;
    setIsSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleEditDocument: () => void;
    handleAddDocument: () => void;
    editingDocument: DocumentData | null;
    setEditingDocument: React.Dispatch<React.SetStateAction<DocumentData | null>>;
    setNewDocument: React.Dispatch<React.SetStateAction<Omit<DocumentData, "id">>>;
    handleInputChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    newDocument: Omit<DocumentData, "id">;
}

function ImageUploadWithCrop({ onCropComplete, initialImage }: ImageUploadWithCropProps) {
    const [cropDialogOpen, setCropDialogOpen] = useState(false)
    const [uploadedImage, setUploadedImage] = useState<string | null>(initialImage || null)
    const [crop, setCrop] = useState<ExtendedCrop>({
      unit: "%",
      width: 100,
      height: 30,
      x: 0,
      y: 35,
      aspect: 16 / 5,
    })
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
    const [aspectRatio, setAspectRatio] = useState<string>("16:5")
    const imageRef = useRef<HTMLImageElement | null>(null)
  
    const handleFileChange = (files: FileList | null) => {
      if (files && files.length > 0) {
        const file = files[0]
        const reader = new FileReader()
        reader.onload = () => {
          setUploadedImage(reader.result as string)
          setCropDialogOpen(true)
        }
        reader.readAsDataURL(file)
      }
    }
  
    const handleCropCompleteInternal = (crop: PixelCrop) => {
      setCompletedCrop(crop)
    }
  
    const handleAspectRatioChange = (value: string) => {
      setAspectRatio(value)
      const [width, height] = value.split(":").map(Number)
      setCrop({
        unit: "%",
        width: 100,
        height: 30,
        x: 0,
        y: 35,
        aspect: width / height,
      })
    }
  
    const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<string> => {
      return new Promise((resolve) => {
        const canvas = document.createElement("canvas")
        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height
  
        canvas.width = crop.width
        canvas.height = crop.height
  
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          throw new Error("No 2d context")
        }
  
        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        )
  
        resolve(canvas.toDataURL("image/jpeg"))
      })
    }
  
    const handleSaveCrop = async () => {
      if (imageRef.current && completedCrop) {
        try {
          const croppedImageUrl = await getCroppedImg(imageRef.current, completedCrop)
          onCropComplete(croppedImageUrl)
          setCropDialogOpen(false)
        } catch (e) {
          console.error("Error cropping image:", e)
        }
      }
    }
  
    return (
      <div className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="coverImage">Cover Image</Label>
          <input
            id="coverImage"
            name="coverImage"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files)}
            className="cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
          />
          {uploadedImage && (
            <div className="relative h-32 mt-2 rounded-md overflow-hidden">
              <Image
                src={uploadedImage}
                alt="Cover preview"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
  
        <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Crop Cover Image</DialogTitle>
              <DialogDescription>
                Adjust the crop area to select which portion of the image to use as your document cover.
              </DialogDescription>
            </DialogHeader>
  
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="aspect-ratio" className="w-24">
                  Aspect Ratio:
                </Label>
                <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
                  <SelectTrigger id="aspect-ratio" className="w-[180px]">
                    <SelectValue placeholder="Select aspect ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:5">16:5 (Wide)</SelectItem>
                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                    <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
  
              <div className="max-h-[400px] overflow-auto">
                {uploadedImage && (
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={handleCropCompleteInternal}
                    aspect={crop.aspect}
                    className="max-w-full"
                  >
                    <img
                      ref={imageRef}
                      src={uploadedImage}
                      alt="Upload"
                      className="max-w-full"
                      crossOrigin="anonymous"
                    />
                  </ReactCrop>
                )}
              </div>
            </div>
  
            <DialogFooter>
              <Button variant="outline" onClick={() => setCropDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCrop}>Apply Crop</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }
const SideSheetContent: React.FC<SideSheetContentProps> = ({
    isSheetOpen,
    setIsSheetOpen,
    setNewDocument,
    handleEditDocument,
    handleAddDocument,
    editingDocument,
    setEditingDocument,
    handleInputChange,
    newDocument,
  }) => {
  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
    <SheetContent className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>{editingDocument ? "Edit Document" : "Add New Document"}</SheetTitle>
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
        {/* Image upload & crop */}
        <ImageUploadWithCrop
          initialImage={editingDocument ? editingDocument.cover_image : newDocument.cover_image}
          onCropComplete={(croppedImage) => {
            if (editingDocument) {
              setEditingDocument({ ...editingDocument, cover_image: croppedImage })
            } else {
              setNewDocument({ ...newDocument, cover_image: croppedImage })
            }
          }}
        />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <SheetClose asChild>
          <Button variant="outline">Cancel</Button>
        </SheetClose>
        <Button onClick={editingDocument ? handleEditDocument : handleAddDocument}>
          {editingDocument ? "Save Changes" : "Add Document"}
        </Button>
      </div>
    </SheetContent>
  </Sheet>
  )
}

export default SideSheetContent