'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Twitter, 
  Linkedin, 
  Facebook, 
  Send, 
  Copy, 
  Check,
  MessageCircle
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function ShareDialog({ isOpen, onClose, url, title }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const shareOptions = [
    {
      name: 'X (Twitter)',
      icon: <Twitter size={20} />,
      color: 'bg-black text-white',
      link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin size={20} />,
      color: 'bg-[#0077b5] text-white',
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={20} />,
      color: 'bg-[#25d366] text-white',
      link: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`
    },
    {
      name: 'Facebook',
      icon: <Facebook size={20} />,
      color: 'bg-[#1877f2] text-white',
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    }
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Share this story</DialogTitle>
          <DialogDescription>
            Share with your network or copy the link to your clipboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-4">
          {shareOptions.map((option) => (
            <a
              key={option.name}
              href={option.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 hover:scale-[1.02] transition-all hover:bg-slate-50 dark:hover:bg-zinc-900`}
            >
              <div className={`p-2 rounded-lg ${option.color}`}>
                {option.icon}
              </div>
              <span className="font-bold text-sm">{option.name}</span>
            </a>
          ))}
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <div className="grid flex-1 gap-2">
            <div className="flex items-center bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2">
              <span className="text-xs text-slate-500 truncate select-all">{url}</span>
            </div>
          </div>
          <Button 
            type="submit" 
            size="sm" 
            className="px-6 rounded-xl font-bold h-10" 
            onClick={handleCopyLink}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span className="ml-2">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
