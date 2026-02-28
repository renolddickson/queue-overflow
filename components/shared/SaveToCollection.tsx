'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bookmark, Plus, Loader2, Check } from 'lucide-react';
import { getMyCollections, addDocumentToCollection, createCollection } from '@/actions/collection';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SaveToCollectionProps {
  documentId: string;
  className?: string;
}

export function SaveToCollection({ documentId, className }: SaveToCollectionProps) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  
  const [showCreate, setShowCreate] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (open) {
      loadCollections();
    }
  }, [open]);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const res = await getMyCollections();
      if (res.data) setCollections(res.data);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (collectionId: string) => {
    setSavingId(collectionId);
    try {
      const res = await addDocumentToCollection(collectionId, documentId);
      if (res.success) {
        toast.success('Saved to collection');
        setOpen(false);
      } else {
        toast.error(res.error || 'Failed to save');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateAndSave = async () => {
    if (!newCollectionName.trim()) return;
    
    setIsCreating(true);
    try {
      const res = await createCollection(newCollectionName);
      if (res.success && res.data) {
        await handleSave(res.data.id);
      } else {
        toast.error(res.error || 'Failed to create collection');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className={cn("p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all", className)}>
          <Bookmark size={18} className="text-white" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Save to Collection</DialogTitle>
          <DialogDescription>
            Organize this content into one of your collections.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-slate-400" />
            </div>
          ) : collections.length > 0 ? (
            <div className="grid gap-2">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => handleSave(collection.id)}
                  disabled={!!savingId}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all text-left"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{collection.name}</span>
                    <span className="text-xs text-slate-500">{collection.items?.[0]?.count || 0} items</span>
                  </div>
                  {savingId === collection.id ? (
                    <Loader2 size={18} className="animate-spin text-slate-400" />
                  ) : (
                    <Plus size={18} className="text-slate-400" />
                  )}
                </button>
              ))}
            </div>
          ) : !showCreate && (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">You haven't created any collections yet.</p>
            </div>
          )}

          {showCreate ? (
            <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Collection Name</label>
                <Input 
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="E.g., Web Design, Coding Tips"
                  className="bg-white dark:bg-zinc-900"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button 
                  className="flex-1 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900"
                  onClick={handleCreateAndSave}
                  disabled={isCreating || !newCollectionName.trim()}
                >
                  {isCreating ? <Loader2 size={18} className="animate-spin mr-2" /> : <Check size={18} className="mr-2" />}
                  Create & Save
                </Button>
              </div>
            </div>
          ) : (
            <Button 
                variant="outline" 
                className="w-full h-12 border-dashed border-2 hover:border-slate-400 transition-all rounded-xl"
                onClick={() => setShowCreate(true)}
            >
              <Plus size={18} className="mr-2" />
              Create New Collection
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
