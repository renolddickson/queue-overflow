import Link from "next/link";
import { Search, FileText, Zap, ChevronRight } from "lucide-react";

export default function Showcase() {
  return (
    <section
      id="showcase"
      className="relative overflow-hidden py-24 bg-[#020617]"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,120,40,0.18),transparent_35%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(30,64,175,0.25),transparent_40%)]" />

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* LEFT */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <h2 className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tight text-white">
              Manage documentation
              <br />
              <span className="text-slate-500">
                without the overhead.
              </span>
            </h2>

            <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
              Novioc provides a streamlined environment to write, organize,
              and publish your technical guides. No complex configurations —
              just clean, readable content.
            </p>

            <div className="space-y-4 pt-3">
              {[
                { icon: Search, label: "Instant search across all documents" },
                { icon: FileText, label: "Simple block-based content editor" },
                { icon: Zap, label: "Built-in versioning and metadata" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800/60 border border-slate-700 flex items-center justify-center text-orange-400">
                    <item.icon size={16} />
                  </div>
                  <span className="text-slate-300 font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link href="/feed">
                <button className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-white text-slate-950 font-bold hover:opacity-90 transition">
                  Browse Feed <ChevronRight size={16} />
                </button>
              </Link>
            </div>
          </div>

          {/* RIGHT MOCK UI */}
          <div className="flex-1 w-full relative">

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-48 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl" />
              <div className="h-48 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl" />
            </div>

            <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-slate-700" />
                <div className="space-y-2">
                  <div className="h-2 w-40 bg-slate-700 rounded" />
                  <div className="h-2 w-24 bg-slate-800 rounded" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-2 w-full bg-slate-700 rounded" />
                <div className="h-2 w-[85%] bg-slate-800 rounded" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}