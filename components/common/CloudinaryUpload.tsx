"use client";

import React from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface CloudinaryUploadProps {
  onSuccess: (url: string) => void;
  folder?: string;
  buttonText?: string;
  className?: string;
}

const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({ 
  onSuccess, 
  folder = 'novioc', 
  buttonText = 'Upload Image',
  className = ""
}) => {
  return (
    <CldUploadWidget 
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "novioc_unsigned"}
      onSuccess={(result: any) => {
        if (result.event === 'success') {
          onSuccess(result.info.secure_url);
        }
      }}
      options={{
        folder: folder,
        multiple: false,
        resourceType: 'image',
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
