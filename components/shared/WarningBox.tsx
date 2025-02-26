import React from 'react';
import { Info, AlertTriangle, XCircle, Lightbulb } from 'lucide-react';

interface WarningBoxContent {
  config: {
    type: 'info' | 'warning' | 'error' | 'note' | 'tip';
    design: 1 | 2
  };
  data: string;
}

interface WarningBoxProps {
  content: WarningBoxContent;
}

const typeStyles = {
  info: {
    styles: 'bg-blue-50 border-blue-500',
    text: 'text-blue-600',
    heading: 'Info',
    icon: <Info className="h-5 w-5 text-blue-600" />,
  },
  warning: {
    styles: 'bg-yellow-50 border-yellow-500',
    text: 'text-yellow-600',
    heading: 'Warning',
    icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
  },
  error: {
    styles: 'bg-red-50 border-red-500',
    text: 'text-red-600',
    heading: 'Error',
    icon: <XCircle className="h-5 w-5 text-red-600" />,
  },
  note: {
    styles: 'bg-gray-50 border-gray-500',
    text: 'text-gray-600',
    heading: 'Note',
    icon: <Info className="h-5 w-5 text-gray-600" />,
  },
  tip: {
    styles: 'bg-green-50 border-green-500',
    text: 'text-green-600',
    heading: 'Tip',
    icon: <Lightbulb className="h-5 w-5 text-green-600" />,
  },
};

export default function WarningBox({ content }: WarningBoxProps) {
  const styleData = typeStyles[content.config.type] || typeStyles.info;
  
  return (
    <div className={`mb-8 ${styleData.styles} p-4 ${content.config.design == 2 ? 'border-l-2' : 'rounded-md'}`}>
      <div className='flex flex-col'>
      <div className="flex items-center gap-3">
        {styleData.icon}
          <h4 className={`font-semibold capitalize ${styleData.text}`}>{styleData.heading}</h4>
      </div>
      <p className='text-gray-600' dangerouslySetInnerHTML={{ __html: content.data }}></p>
      </div>
    </div>
  );
}
