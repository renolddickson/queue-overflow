"use client";

import React from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface CloudinaryUploadProps {
  onSuccess: (url: string, publicId?: string) => void;
  folder?: string;
  userId?: string;
  category?: 'banners' | 'articles' | 'profiles' | 'post-images';
  buttonText?: string;
  className?: string;
}

const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({ 
  onSuccess, 
  folder,
  userId,
  category = 'articles',
  buttonText = 'Upload Image',
  className = ""
}) => {
  // Construct structured folder: novioc/users/[uid]/[category]
  const finalFolder = folder || (userId ? `novioc/users/${userId}/${category}` : `novioc/${category}`);

  return (
    <CldUploadWidget 
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"}
      onSuccess={(result: any) => {
        if (result.event === 'success') {
          onSuccess(result.info.secure_url, result.info.public_id);
        }
      }}
      options={{
        folder: finalFolder,
        multiple: false,
        resourceType: 'image',
        clientAllowedFormats: ["jpg", "png", "jpeg", "webp"],
        maxFileSize: 2000000, // 2MB
      }}
    >
      {({ open }) => {
        return (
          <Button 
            variant="outline" 
            onClick={(e) => {
                e.preventDefault();
                open();
            }}
            className={className}
          >
            <Upload className="mr-2 h-4 w-4" />
            {buttonText}
          </Button>
        );
      }}
    </CldUploadWidget>
  );
};

export default CloudinaryUpload;
