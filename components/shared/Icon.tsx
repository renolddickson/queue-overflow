import * as LucideIcons from "lucide-react";

interface IconProps {
  name: string;
  className?: string;
}

const Icon = ({ name, className = "h-4 w-4" }: IconProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LucideIcon = (LucideIcons as any)[name] || LucideIcons.FileText; // Default fallback
  return <LucideIcon className={className} />;
};

export default Icon;