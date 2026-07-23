'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { 
  Bookmark, 
  Plus, 
  Loader2, 
  Check, 
  ChevronRight,
  FolderPlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  getMyCollections, 
  addDocumentToCollection, 
  ensureSaveForLaterCollection,
  createCollection,
  getDocumentCollections
} from "@/actions/collection";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface CollectionDropdownProps {
  documentId: string;
  className?: string;
  iconSize?: number;
}

export function CollectionDropdown({ documentId, className, iconSize = 20 }: CollectionDropdownProps) {
  const [collections, setCollections] = useState<any[]>([]);
  const [activeCollections, setActiveCollections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [colRes, activeRes] = await Promise.all([
        getMyCollections(),
        getDocumentCollections(documentId)
      ]);
      setCollections(colRes.data || []);
      setActiveCollections(activeRes.data || []);
    } catch (error) {
        console.error("Failed to load collections", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCollection = async (collectionId: string, name: string) => {
    startTransition(async () => {
      const res = await addDocumentToCollection(collectionId, documentId);
      if (res.success) {
        setActiveCollections(prev => [...prev, collectionId]);
        toast.success(`Saved to ${name}`);
      } else {
        toast.error(res.error || "Failed to add to collection");
      }
    });
  };

  const handleSaveForLater = async () => {
    startTransition(async () => {
      const res = await ensureSaveForLaterCollection();
      if (res.success && res.data) {
        const colId = res.data.id;
        if (activeCollections.includes(colId)) {
            toast.info("Already in Save for later");
            return;
        }
        await handleAddToCollection(colId, "Save for later");
      } else {
        toast.error("Failed to ensure default collection");
      }
    });
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    startTransition(async () => {
      const res = await createCollection(newCollectionName.trim());
      if (res.success && res.data) {
        const newCol = res.data;
        setCollections(prev => [newCol, ...prev]);
        setNewCollectionName("");
        setShowCreateInput(false);
        await handleAddToCollection(newCol.id, newCol.name);
      } else {
        toast.error(res.error || "Failed to create collection");
      }
    });
  };

  const isSaved = activeCollections.length > 0;

  return (
    <DropdownMenu onOpenChange={(open) => open && loadData()}>
      <DropdownMenuTrigger asChild>
        <button 
          className={cn(
            "p-2 rounded-full transition-all active:scale-95 group/bookmark",
            isSaved 
                ? "text-primary bg-primary/5" 
                : "text-slate-400 hover:text-slate-900 dark:hover:text-white",
            className
          )}
          title="Save to collection"
        >
          {isPending ? (
            <Loader2 size={iconSize} className="animate-spin" />
          ) : (
            <Bookmark size={iconSize} className={cn(isSaved && "fill-current")} />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
        <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-500">
          Save to Collection
        </DropdownMenuLabel>
        
        <DropdownMenuItem 
          onSelect={(e) => { e.preventDefault(); handleSaveForLater(); }}
          className="flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer focus:bg-slate-50 dark:focus:bg-zinc-800"
        >
          <div className="flex items-center gap-2">
            <Bookmark size={16} className="text-slate-400" />
            <span className="font-medium">Save for later</span>
          </div>
          {activeCollections.some(id => collections.find(c => c.id === id)?.name === 'Save for later') && (
            <Check size={16} className="text-primary" />
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-100 dark:bg-zinc-800 my-1" />

        <div className="max-h-48 overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={20} className="animate-spin text-slate-300" />
            </div>
          ) : collections.filter(c => c.name !== 'Save for later').length > 0 ? (
            collections.filter(c => c.name !== 'Save for later').map((col) => (
              <DropdownMenuItem 
                key={col.id}
                onSelect={(e) => { e.preventDefault(); handleAddToCollection(col.id, col.name); }}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer focus:bg-slate-50 dark:focus:bg-zinc-800"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="font-medium truncate max-w-[140px]">{col.name}</span>
                </div>
                {activeCollections.includes(col.id) && (
                  <Check size={16} className="text-primary" />
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-xs text-slate-400 italic">
              No other collections yet
            </div>
          )}
        </div>

        <DropdownMenuSeparator className="bg-slate-100 dark:bg-zinc-800 my-1" />
        
        {showCreateInput ? (
          <form onSubmit={handleCreateCollection} className="p-2 space-y-2">
            <Input 
              autoFocus
              placeholder="Collection name..."
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className="h-9 text-sm rounded-lg"
              disabled={isPending}
            />
            <div className="flex gap-2">
              <Button 
                type="submit" 
                size="sm" 
                className="flex-1 h-8 text-xs rounded-lg"
                disabled={isPending || !newCollectionName.trim()}
              >
                {isPending ? <Loader2 size={12} className="animate-spin" /> : "Create"}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCreateInput(false)}
                className="h-8 text-xs rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <DropdownMenuItem 
            onSelect={(e) => { e.preventDefault(); setShowCreateInput(true); }}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer text-primary focus:bg-primary/5 focus:text-primary font-bold"
          >
            <FolderPlus size={16} />
            <span>Create New Collection</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
