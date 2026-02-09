import { Button } from "@/components/ui/button";
import { Check, FileText, BookOpen, Users, Image, Code, AlertTriangle } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Dynamic Post Engine",
    description: "Create stunning, high-performance posts with our advanced rich-text editor and built-in SEO tools.",
    color: "bg-blue-500/10",
    iconColor: "text-blue-600",
    gradient: "from-blue-50 to-indigo-50",
  },
  {
    icon: BookOpen,
    title: "Multi-layered Docs",
    description: "Organize complex information into beautiful, structured documentation with automatic nested navigation.",
    color: "bg-purple-500/10",
    iconColor: "text-purple-600",
    gradient: "from-purple-50 to-fuchsia-50",
  },
  {
    icon: Image,
    title: "Smart Media Asset",
    description: "Effortlessly manage and optimize images, videos, and interactive embeds for a richer reader experience.",
    color: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    gradient: "from-emerald-50 to-teal-50",
  },
  {
    icon: Code,
    title: "Dev-first Code Blocks",
    description: "First-class support for 100+ languages with syntax highlighting, copy-to-clipboard, and line focusing.",
    color: "bg-amber-500/10",
    iconColor: "text-amber-600",
    gradient: "from-amber-50 to-orange-50",
  },
  {
    icon: AlertTriangle,
    title: "Visual Callouts",
    description: "Drive attention to critical notes, warnings, and tips with beautifully designed, customizable callout boxes.",
    color: "bg-rose-500/10",
    iconColor: "text-rose-600",
    gradient: "from-rose-50 to-pink-50",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "Work seamlessly with your team in real-time. Comments, suggestions, and version control built-in.",
    color: "bg-cyan-500/10",
    iconColor: "text-cyan-600",
    gradient: "from-cyan-50 to-sky-50",
  },
];

const FeatureSection = () => {
  return (
    <section id="features" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Scale Knowledge</h2>
          <p className="text-lg text-gray-600">
            Stop juggling multiple tools. WriteVerse provides a unified platform for all your documentation and content needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Masterfully Crafted for Modern Teams</h3>

            <div className="space-y-4">
              {[
                { title: "Universal Search", desc: "Find anything across all your documents instantly with AI-powered search." },
                { title: "Custom Domains", desc: "Publish your content on your own domain with automatic SSL certificates." },
                { title: "Granular Permissions", desc: "Full control over who can view, edit, or publish your content." },
                { title: "Export Anywhere", desc: "Export to Markdown, PDF, or HTML with a single click." }
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-gray-900">{item.title}</h5>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <FileText size={20} />
              </div>
              <div>
                <div className="h-4 w-32 bg-gray-100 rounded mb-1" />
                <div className="h-3 w-48 bg-gray-50 rounded" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-11/12" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-24 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center justify-center mt-4">
                <div className="flex flex-col items-center gap-1 opacity-50">
                  <Image size={24} className="text-blue-500" />
                  <span className="text-[10px] font-medium text-blue-600">Media Optimized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Adding this for the FileImage icon since it's used in the component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FileImage = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <circle cx="10" cy="13" r="2" />
    <path d="m20 17-1.5-1.5-2.5 2.5-1-1-2 2" />
  </svg>
);

export default FeatureSection;