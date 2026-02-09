import React from 'react'
import Image from '../common/Image'
import { ImageBlockContent } from '@/types'

const ImageBlock = ({ content }: { content: ImageBlockContent | string | null }) => {
  const isObject = typeof content === 'object' && content !== null;
  const src = isObject ? (content as ImageBlockContent).data : (content as string);
  const config = isObject ? (content as ImageBlockContent).config : null;

  return (
    <div className={`flex flex-col items-center my-6 w-full ${config?.position === 'left' ? 'items-start' : config?.position === 'right' ? 'items-end' : 'items-center'}`}>
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
        <Image 
          src={src || 'assets/no-image.jpg'} 
          alt={config?.caption || "img"} 
          className={`w-full h-auto transition-transform duration-500 hover:scale-[1.02] ${config?.fit === 'cover' ? 'object-cover aspect-video' : config?.fit === 'contain' ? 'object-contain' : ''}`}
        />
      </div>
      {config?.caption && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 font-medium italic border-l-2 border-slate-200 dark:border-slate-700 pl-3">
          {config.caption}
        </p>
      )}
    </div>
  )
}

export default ImageBlock