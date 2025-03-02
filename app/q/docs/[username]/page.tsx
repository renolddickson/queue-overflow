"use client"

import React, { useState, useRef } from "react"
import Image from "next/image"
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

import { Plus, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// -------------------------
// Types
// -------------------------
interface ExtendedCrop extends Crop {
  aspect?: number
}
// Define the document type
interface Document {
  id: string
  title: string
  description: string
  coverImage: string
  publishedDate: string
}

// Props for the cropping component
interface ImageUploadWithCropProps {
  onCropComplete: (croppedImage: string) => void
  initialImage?: string
}

// -------------------------
// ImageUploadWithCrop Component
// -------------------------

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

// -------------------------
// DocumentList Component
// -------------------------

export default function DocumentList() {
  // Sample documents data
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      title: "Getting Started with React",
      description: "A comprehensive guide to React fundamentals for beginners.",
      coverImage: "/placeholder.svg?height=200&width=300",
      publishedDate: "2023-10-15",
    },
    {
      id: "2",
      title: "Advanced CSS Techniques",
      description: "Learn advanced CSS techniques to create stunning web designs.",
      coverImage: "/placeholder.svg?height=200&width=300",
      publishedDate: "2023-11-22",
    },
    {
      id: "3",
      title: "JavaScript Best Practices",
      description: "Discover the best practices for writing clean and efficient JavaScript code.",
      coverImage: "/placeholder.svg?height=200&width=300",
      publishedDate: "2024-01-05",
    },
  ])

  // State for the form
  const [newDocument, setNewDocument] = useState<Omit<Document, "id">>({
    title: "",
    description: "",
    coverImage: "",
    publishedDate: new Date().toISOString().split("T")[0],
  })

  // State for edit mode
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)

  // State for delete confirmation
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)

  // State for sheet visibility
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (editingDocument) {
      setEditingDocument({
        ...editingDocument,
        [name]: value,
      })
    } else {
      setNewDocument({
        ...newDocument,
        [name]: value,
      })
    }
  }

  // Add a new document
  const handleAddDocument = () => {
    const newId = Math.random().toString(36).substring(2, 9)
    setDocuments([...documents, { id: newId, ...newDocument }])
    setNewDocument({
      title: "",
      description: "",
      coverImage: "",
      publishedDate: new Date().toISOString().split("T")[0],
    })
    setIsSheetOpen(false)
  }

  // Edit a document
  const handleEditDocument = () => {
    if (editingDocument) {
      setDocuments(documents.map((doc) => (doc.id === editingDocument.id ? editingDocument : doc)))
      setEditingDocument(null)
      setIsSheetOpen(false)
    }
  }

  // Delete a document
  const handleDeleteDocument = () => {
    if (documentToDelete) {
      setDocuments(documents.filter((doc) => doc.id !== documentToDelete))
      setDocumentToDelete(null)
    }
  }

  // Open edit sheet
  const openEditSheet = (document: Document) => {
    setEditingDocument(document)
    setIsSheetOpen(true)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Documents</h1>
        <Button
          onClick={() => {
            setEditingDocument(null)
            setNewDocument({
              title: "",
              description: "",
              coverImage: "",
              publishedDate: new Date().toISOString().split("T")[0],
            })
            setIsSheetOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No documents found</p>
          <Button
            onClick={() => {
              setEditingDocument(null)
              setNewDocument({
                title: "",
                description: "",
                coverImage: "",
                publishedDate: new Date().toISOString().split("T")[0],
              })
              setIsSheetOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Create your first document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => (
            <Card key={document.id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src={document.coverImage || "/placeholder.svg"}
                  alt={document.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-2 line-clamp-1">{document.title}</h2>
                <p className="text-muted-foreground line-clamp-3">{document.description}</p>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <span>Published: {formatDate(document.publishedDate)}</span>
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
              initialImage={editingDocument ? editingDocument.coverImage : newDocument.coverImage}
              onCropComplete={(croppedImage) => {
                if (editingDocument) {
                  setEditingDocument({ ...editingDocument, coverImage: croppedImage })
                } else {
                  setNewDocument({ ...newDocument, coverImage: croppedImage })
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
  )
}
