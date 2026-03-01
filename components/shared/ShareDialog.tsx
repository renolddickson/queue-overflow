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
  Facebook, 
  Copy, 
  Check,
  MessageCircle,
  Mail,
  Link as LinkIcon,
  Pin
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={20} className="text-white fill-white/10" />,
      labelColor: 'text-[#25D366]',
      bgColor: 'bg-[#25D366]',
      link: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`
    },
    {
      name: 'Facebook',
      icon: <Facebook size={20} className="text-white fill-white" />,
      labelColor: 'text-[#1877F2]',
      bgColor: 'bg-[#1877F2]',
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      name: 'X',
      icon: <Twitter size={20} className="text-white" />,
      labelColor: 'text-black dark:text-white',
      bgColor: 'bg-black',
      link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
    },
    {
      name: 'Pinterest',
      icon: <Pin size={20} className="text-white fill-white" />,
      labelColor: 'text-[#BD081C]',
      bgColor: 'bg-[#BD081C]',
      link: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`
    },
    {
      name: 'Email',
      icon: <Mail size={20} className="text-white" />,
      labelColor: 'text-[#F5A623]',
      bgColor: 'bg-[#F5A623]',
      link: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
    },
    {
      name: 'Copy',
      icon: copied ? <Check size={20} className="text-white" /> : <LinkIcon size={20} className="text-white" />,
      labelColor: 'text-[#607D8B]',
      bgColor: 'bg-[#607D8B]',
      onClick: handleCopyLink
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-serif text-slate-800 dark:text-slate-200">Share this post:</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between gap-1 py-6 overflow-x-auto no-scrollbar">
          {shareOptions.map((option) => (
            <div key={option.name} className="flex flex-col items-center gap-2 min-w-[56px]">
              {option.link ? (
                <a
                  href={option.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-11 h-11 rounded-full ${option.bgColor} flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all duration-200`}
                >
                  {option.icon}
                </a>
              ) : (
                <button
                  onClick={option.onClick}
                  className={`w-11 h-11 rounded-full ${option.bgColor} flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all duration-200`}
                >
                  {option.icon}
                </button>
              )}
              <span className={`text-[11px] font-semibold tracking-tight ${option.labelColor}`}>
                {option.name}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
