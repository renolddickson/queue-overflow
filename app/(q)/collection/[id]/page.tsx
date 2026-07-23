import React from 'react';
import { getCollectionById } from '@/actions/collection';
import { notFound } from 'next/navigation';
import FeedItem from '@/app/(q)/_components/FeedItem';
import { Bookmark, Layers, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: collection, items, error } = await getCollectionById(id);

  if (!collection && !error) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 w-full flex flex-col min-h-screen">
      <div className="mb-10 flex flex-col md:flex-row md:items-start md:gap-6 gap-4 border-b border-slate-100 dark:border-zinc-800 pb-8">
        <Link 
          href="/collection" 
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 transition-colors self-start"
          title="Back to Collections"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="p-4 rounded-3xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 self-start hidden md:block">
          <Bookmark size={32} />
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <h1 className="text-3xl md:text-5xl font-serif font-black text-slate-900 dark:text-white leading-tight">
              {collection ? collection.name : 'Collection Detail'}
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-xs font-bold text-slate-600 dark:text-slate-300 w-fit">
              <Layers size={14} />
              <span>{items.length} Items</span>
            </div>
          </div>
          {collection?.description && (
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl max-w-2xl">
              {collection.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        {items.length > 0 ? (
          items.map((item: any) => (
            <FeedItem key={`${item.id}-${Math.random()}`} data={item} />
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 mt-4 bg-slate-50 dark:bg-zinc-900/30 rounded-[48px] border-2 border-dashed border-slate-200 dark:border-zinc-800/50">
            <div className="p-6 rounded-full bg-slate-100 dark:bg-zinc-900 mb-6">
              <Bookmark size={64} className="text-slate-300 dark:text-zinc-700" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">This collection is empty</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
              Save articles or documentation to this collection and they will appear here.
            </p>
            <Link 
              href="/"
              className="mt-8 px-6 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity"
            >
              Explore feed
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
