import { Check, FileText, BookOpen, Users, Image, Code, AlertTriangle } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Blog Posts",
    description: "Create single-page articles with rich text and media elements for quick sharing.",
    color: "bg-blue-100",
    textColor: "text-blue-600",
  },
  {
    icon: BookOpen,
    title: "Multi-Page Documents",
    description: "Build comprehensive documentation with multiple pages and navigation.",
    color: "bg-purple-100",
    textColor: "text-purple-600",
  },
  {
    icon: Image,
    title: "Rich Media Support",
    description: "Embed images, videos, and other media to enhance your content.",
    color: "bg-green-100",
    textColor: "text-green-600",
  },
  {
    icon: Code,
    title: "Code Blocks",
    description: "Share code snippets with syntax highlighting for better readability.",
    color: "bg-amber-100",
    textColor: "text-amber-600",
  },
  {
    icon: AlertTriangle,
    title: "Warning Boxes",
    description: "Highlight important information with customized callout boxes.",
    color: "bg-orange-100",
    textColor: "text-orange-600",
  },
  {
    icon: Users,
    title: "Collaborative Editing",
    description: "Work together with your team to create and refine content.",
    color: "bg-cyan-100",
    textColor: "text-cyan-600",
  },
];

const FeatureSection = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Create Content Your Way</h2>
          <p className="text-xl text-gray-600">
            Everything you need to create professional documentation and blogs with ease
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                <feature.icon className={`h-6 w-6 ${feature.textColor}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-6">Powerful Tools for Content Creation</h3>
            
            <ul className="space-y-4">
              {[
                "Rich text editor with formatting options",
                "Drag and drop image uploads",
                "Video embeddings from popular platforms",
                "Custom code blocks with syntax highlighting",
                "Warning and info boxes for important notes",
                "Version history and change tracking"
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <div className="mr-3 mt-1 bg-blue-100 rounded-full p-1">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl -rotate-1"></div>
            <div className="absolute inset-0 bg-white rounded-xl shadow-lg rotate-1 overflow-hidden">
              <div className="h-12 bg-gray-100 flex items-center px-4 border-b">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="flex-grow"></div>
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
              </div>
              
              <div className="p-4">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5 mb-6"></div>
                
                <div className="h-48 bg-gray-100 rounded mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <FileImage className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <span className="text-gray-500">Drag and drop images</span>
                  </div>
                </div>
                
                <div className="bg-gray-800 text-gray-200 p-4 rounded text-sm font-mono mb-4">
                  <code>
                    <div className="text-pink-400">import</div> {'{ useState }'} <div className="text-pink-400">from</div> <div className="text-green-300">&apos;react&apos;</div>;
                    <br />
                    <br />
                    <div className="text-pink-400">function</div> <div className="text-blue-400">DocEditor</div>{'() {'} 
                    <br />
                    &nbsp;&nbsp;<div className="text-pink-400">return</div> {'('} 
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;{'<div>Editor</div>'}
                    <br />
                    &nbsp;&nbsp;{')'}
                    <br />
                    {'}'}
                  </code>
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-yellow-700">
                  Remember to save your changes before navigating away!
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
const FileImage = (props:any) => (
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