import React from 'react'
import Image from '../common/Image'
import { ImageBlockContent } from '@/types'
import { cn } from '@/lib/utils'

const ImageBlock = ({ content }: { content: ImageBlockContent | string | null }) => {
  const isObject = typeof content === 'object' && content !== null;
  const src = isObject ? (content as ImageBlockContent).data : (content as string);
  const config = isObject ? (content as ImageBlockContent).config : null;

  return (
    <div className={`flex flex-col items-center my-6 w-full ${config?.position === 'left' ? 'items-start' : config?.position === 'right' ? 'items-end' : 'items-center'}`}>
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
        <Image 
          src={src || '/assets/no-image.jpg'} 
          alt={config?.alt || config?.caption || "img"} 
          className={cn(
            "w-full h-auto transition-transform duration-500 hover:scale-[1.02]",
            config?.fit === 'contain' ? 'object-contain' : 'object-cover aspect-video'
          )}
        />
      </div>
      {(config?.caption || config?.alt) && (
        <div className="mt-3 flex flex-col items-center">
            {config?.caption && (
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                {config.caption}
                </p>
            )}
            {config?.alt && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    {config.alt}
                </p>
            )}
        </div>
      )}
    </div>
  )
}

export default ImageBlock