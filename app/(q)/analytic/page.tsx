'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Activity, Loader2, Eye, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { getAnalyticsStats } from '@/actions/analytics';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await getAnalyticsStats();
      if (res.data) setStats(res.data);
    } catch (error) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const totalViews = stats.reduce((acc, curr) => acc + (curr.views?.[0]?.count || 0), 0);
  const totalContents = stats.length;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 w-full flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif font-black text-slate-900 dark:text-white">Content Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Insights into how your content is performing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-slate-900 text-white dark:bg-zinc-900 border-none rounded-[32px] overflow-hidden shadow-xl">
          <CardContent className="p-8 flex flex-col justify-between h-40">
            <div className="p-3 rounded-2xl bg-white/10 w-fit">
              <TrendingUp size={24} className="text-orange-400" />
            </div>
            <div>
              <p className="text-4xl font-black">{totalViews}</p>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Total Views</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-zinc-900/50 border-slate-100 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm">
          <CardContent className="p-8 flex flex-col justify-between h-40">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 w-fit">
              <BarChart3 size={24} className="text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <p className="text-4xl font-black text-slate-900 dark:text-white">{totalContents}</p>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Total Contents</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900/50 border-slate-100 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm">
          <CardContent className="p-8 flex flex-col justify-between h-40">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 w-fit">
              <Clock size={24} className="text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <p className="text-4xl font-black text-slate-900 dark:text-white">Active</p>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Growth Status</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-serif font-bold dark:text-white flex items-center gap-3">
          <Activity size={24} className="text-primary" />
          Content Performance
        </h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        ) : stats.length > 0 ? (
          <div className="grid gap-4">
            {stats.map((doc) => (
              <Card key={doc.id} className="bg-white dark:bg-zinc-900/50 border-slate-100 dark:border-zinc-800 overflow-hidden hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all rounded-3xl border-none shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{doc.title}</h3>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-black">{doc.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 font-black">
                        <Eye size={16} className="text-slate-400" />
                        {doc.views?.[0]?.count || 0}
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Views</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 dark:bg-zinc-900/30 rounded-[48px] border-2 border-dashed border-slate-200 dark:border-zinc-800/50">
            <Activity size={64} className="mx-auto text-slate-300 dark:text-zinc-700 mb-6" />
            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">No analytics data yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
              Insights will appear here once your content starts receiving views.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
