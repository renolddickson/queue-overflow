"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DesktopOnly } from '@/components/shared/DesktopOnly';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  FileText, 
  Layers, 
  Image as ImageIcon, 
  ChevronRight, 
  ArrowLeft,
  Sparkles,
  Globe,
  Lock,
  Link2,
  Tag,
  X,
  Hash
} from 'lucide-react';
import Image from "next/image";
import { toast } from 'sonner';
import { submitData, uploadImage } from '@/actions/document';
import { handleFileChange, readFileAsDataURL } from '@/utils/helper';
import { cn } from '@/lib/utils';
import { getUid } from '@/actions/auth';
import { Badge } from '@/components/ui/badge';

const DEFAULT_KEYWORDS = [
  'Technology',
  'Design',
  'Business',
  'Lifestyle',
  'Education'
];

export default function CreateNewPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<'posts' | 'docs'>('posts');
  const [publishState, setPublishState] = useState<'published' | 'draft' | 'unlisted'>('draft');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  
  // Keywords state
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  const onCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await handleFileChange(e, setUploadedImage, setCoverImageFile);
    } catch (error) {
      console.error("Cover image upload error:", error);
      toast.error("Failed to read cover image");
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsSubmitting(true);
    try {
      const uid = await getUid();
      if (!uid) throw new Error("Not authorized");

      let coverImageUrl = null;
      if (coverImageFile) {
        const base64Data = await readFileAsDataURL(coverImageFile);
        coverImageUrl = await uploadImage('documents', {
          fileName: coverImageFile.name,
          fileContent: base64Data,
        });
      }

      const newDoc = {
        title,
        description,
        type,
        publish_state: publishState,
        cover_image: coverImageUrl,
        user_id: uid,
        keywords, // Added keywords field
      };

      const res = await submitData<any>("documents", newDoc);
      
      if (res.data && res.data[0]) {
        toast.success("Content created successfully!");
        const createdDoc = res.data[0];
        router.push(`/edit/${createdDoc.type}/${createdDoc.id}`);
      }
    } catch (error: any) {
      console.error("Error creating document:", error);
      toast.error(error.message || "Failed to create content");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DesktopOnly>
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="space-y-2">
              <button 
                onClick={() => router.back()}
                className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Profile</span>
              </button>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-slate-50">
                Start a new story
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                Transform your thoughts into professional documentation or engaging posts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Step 1: Type Selection */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xs font-bold text-slate-500">1</div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Choose Content Type</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setType('posts')}
                    className={cn(
                      "relative flex items-start gap-4 p-6 rounded-2xl border-2 transition-all text-left group",
                      type === 'posts' 
                        ? "border-slate-900 dark:border-slate-50 bg-slate-50 dark:bg-slate-900" 
                        : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <div className={cn(
                      "p-3 rounded-xl transition-colors",
                      type === 'posts' ? "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    )}>
                      <FileText size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 dark:text-slate-50">Post</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">Single page with focused content. Ideal for tutorials, announcements, or simple articles.</p>
                    </div>
                    {type === 'posts' && <Sparkles className="absolute top-4 right-4 text-orange-500 w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => setType('docs')}
                    className={cn(
                      "relative flex items-start gap-4 p-6 rounded-2xl border-2 transition-all text-left group",
                      type === 'docs' 
                        ? "border-slate-900 dark:border-slate-50 bg-slate-50 dark:bg-slate-900" 
                        : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <div className={cn(
                      "p-3 rounded-xl transition-colors",
                      type === 'docs' ? "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    )}>
                      <Layers size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 dark:text-slate-50">Docs</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">Multi-page structure with sidebar. Best for comprehensive guides and documentation.</p>
                    </div>
                    {type === 'docs' && <Sparkles className="absolute top-4 right-4 text-orange-500 w-5 h-5" />}
                  </button>
                </div>
              </section>

              {/* Step 2: Content Details */}
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xs font-bold text-slate-500">2</div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Content Details</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold uppercase tracking-wider text-slate-500">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="E.g., Mastering the Art of Clean Code"
                      className="h-14 text-xl font-serif bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-slate-900 dark:focus:ring-slate-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold uppercase tracking-wider text-slate-500">Short Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Briefly describe what this content is about..."
                      rows={4}
                      className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl resize-none text-base leading-relaxed"
                    />
                  </div>
                </div>
              </section>

              {/* Step 3: Keywords */}
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xs font-bold text-slate-500">3</div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Keywords & Tags</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Selected Keywords</Label>
                    <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
                      {keywords.length > 0 ? (
                        keywords.map((kw) => (
                          <Badge 
                            key={kw} 
                            variant="secondary" 
                            className="pl-3 pr-1 py-1 gap-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none group transition-all"
                          >
                            <span className="text-xs font-medium">{kw}</span>
                            <button 
                              onClick={() => setKeywords(keywords.filter(k => k !== kw))}
                              className="p-0.5 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 p-1 italic">No keywords selected yet...</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Custom Keyword</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input 
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
                                setKeywords([...keywords, keywordInput.trim()]);
                                setKeywordInput('');
                              }
                            }
                          }}
                          placeholder="Type and press Enter..."
                          className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl"
                        />
                      </div>
                      <Button 
                        onClick={() => {
                          if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
                            setKeywords([...keywords, keywordInput.trim()]);
                            setKeywordInput('');
                          }
                        }}
                        variant="secondary"
                        className="h-11 px-6 rounded-xl"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Quick Suggestions</Label>
                    <div className="flex flex-wrap gap-2">
                      {DEFAULT_KEYWORDS.map(kw => (
                        <button
                          key={kw}
                          onClick={() => {
                            if (!keywords.includes(kw)) {
                              setKeywords([...keywords, kw]);
                            }
                          }}
                          disabled={keywords.includes(kw)}
                          className={cn(
                            "px-4 py-2 rounded-xl border text-sm font-medium transition-all flex items-center gap-2",
                            keywords.includes(kw)
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent cursor-not-allowed"
                              : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-50 hover:text-slate-900 dark:hover:text-slate-50"
                          )}
                        >
                          <Tag size={12} />
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar Settings */}
            <div className="space-y-8">
              <div className="sticky top-24 space-y-8">
                
                {/* Cover Image Upload */}
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Cover Image</Label>
                  <div 
                    className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all hover:border-slate-400"
                    onClick={() => document.getElementById('coverImage')?.click()}
                  >
                    {uploadedImage ? (
                      <Image src={uploadedImage} alt="Preview" fill className="object-cover" />
                    ) : (
                      <>
                        <ImageIcon size={32} className="text-slate-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-slate-500 font-medium">Upload Image</span>
                      </>
                    )}
                    <input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={onCoverImageChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest leading-relaxed">
                    Recommended: 1600x900px<br/>max 2MB
                  </p>
                </div>

                {/* Visibility Settings */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-6 shadow-xl">
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Visibility</Label>
                    <Select value={publishState} onValueChange={(val: any) => setPublishState(val)}>
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-none">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800">
                        <SelectItem value="published" className="rounded-xl py-3">
                          <div className="flex items-center gap-3">
                            <Globe size={16} className="text-blue-500" />
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">Published</span>
                              <span className="text-[10px] text-slate-400">Publicly visible to everyone</span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="draft" className="rounded-xl py-3">
                          <div className="flex items-center gap-3">
                            <Lock size={16} className="text-amber-500" />
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">Draft</span>
                              <span className="text-[10px] text-slate-400">Only you can see this</span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="unlisted" className="rounded-xl py-3">
                          <div className="flex items-center gap-3">
                            <Link2 size={16} className="text-slate-500" />
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">Unlisted</span>
                              <span className="text-[10px] text-slate-400">Visible via direct link only</span>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleCreate}
                    disabled={isSubmitting}
                    className="w-full h-14 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 rounded-2xl text-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-200 dark:shadow-none"
                  >
                    {isSubmitting ? "Generating..." : "Create & Start Writing"}
                    {!isSubmitting && <ChevronRight size={20} className="ml-2" />}
                  </Button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </DesktopOnly>
  );
}
