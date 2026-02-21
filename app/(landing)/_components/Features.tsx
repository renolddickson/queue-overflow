import { 
  FileText, 
  Shield, 
  Zap, 
  Users, 
  Layers, 
  Globe 
} from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="py-32 px-4">
      <div className="max-w-7xl mx-auto space-y-24">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything you need to ship world-class docs</h2>
          <p className="text-slate-500 dark:text-slate-400">Stop fighting with static site generators. Our block-based editor makes it easy for anyone to contribute.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="text-orange-500" />,
              title: "Incredibly Fast",
              desc: "Built on Next.js 15 for sub-second page loads and instant search transitions."
            },
            {
              icon: <FileText className="text-blue-500" />,
              title: "Block-Based Editor",
              desc: "Powerful blocks for code snippets, warning boxes, and complex media layouts."
            },
            {
              icon: <Shield className="text-green-500" />,
              title: "Secure by Default",
              desc: "Enterprise-grade security with role-based access and secure data isolation."
            },
            {
              icon: <Users className="text-purple-500" />,
              title: "Team Collaboration",
              desc: "Invite your team, share drafts, and publish together with version control."
            },
            {
              icon: <Layers className="text-red-500" />,
              title: "Custom Themes",
              desc: "Fully brandable docs that match your product's identity with zero effort."
            },
            {
              icon: <Globe className="text-cyan-500" />,
              title: "Global CDN",
              desc: "Documents are cached at the edge, ensuring users get data from the nearest node."
            }
          ].map((feature, i) => (
            <div key={i} className="group p-8 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
