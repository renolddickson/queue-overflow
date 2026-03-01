'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Plus, Loader2, Layers } from 'lucide-react';
import { getMyCollections, deleteCollection } from '@/actions/collection';
import { toast } from 'sonner';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const res = await getMyCollections();
      if (res.data) setCollections(res.data);
    } catch (error) {
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteCollection(id);
      if (res.success) {
        toast.success("Collection deleted");
        loadCollections();
      } else {
        toast.error(res.error || "Failed to delete");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 w-full flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif font-black text-slate-900 dark:text-white">My Collections</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Organize and browse your saved content.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="animate-spin text-slate-400" size={48} />
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card key={collection.id} className="bg-white dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col h-full border-none shadow-sm">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between mb-4">
                   <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                     <Bookmark size={24} />
                   </div>
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full" 
                    onClick={() => handleDelete(collection.id)}
                   >
                     <Plus className="rotate-45" size={20} />
                   </Button>
                </div>
                <CardTitle className="text-2xl font-serif">{collection.name}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1 min-h-[40px]">{collection.description || "Personal collection"}</CardDescription>
                
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                    <Layers size={16} className="text-slate-400" />
                    <span>{collection.items?.[0]?.count || 0} <span className="font-normal text-slate-500">Items</span></span>
                  </div>
                  <Button variant="outline" className="rounded-full h-8 text-xs font-bold border-slate-200 dark:border-zinc-800">View All</Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50 dark:bg-zinc-900/30 rounded-[48px] border-2 border-dashed border-slate-200 dark:border-zinc-800/50">
          <div className="p-6 rounded-full bg-slate-100 dark:bg-zinc-900 mb-6">
            <Bookmark size={64} className="text-slate-300 dark:text-zinc-700" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">No collections found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
            Start saving content from your feed to organize them into personal collections.
          </p>
        </div>
      )}
    </div>
  );
}
