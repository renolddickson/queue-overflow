import { Twitter, Youtube, Github } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="py-10 px-4 bg-white dark:bg-[#020617] border-t border-slate-100 dark:border-slate-900">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-8">
        
        {/* Main Text Section */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Made with <span className="inline-block hover:scale-125 transition-transform cursor-default text-rose-500">❤️</span> from India
          </p>
        </div>

        {/* Social Link Section */}
        <div className="flex items-center gap-4">
          {[
            { Icon: Github, href: "#" },
            { Icon: Youtube, href: "#" },
            { Icon: Twitter, href: "#" },
          ].map((item, i) => (
            <Link 
              key={i}
              href={item.href}
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 transform hover:-translate-y-1"
            >
              <item.Icon size={18} strokeWidth={1.5} />
            </Link>
          ))}
        </div>

        {/* Bottom Metadata */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-[1px] w-8 bg-slate-200 dark:bg-slate-800" />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-600 pl-[0.25em]">
            Novioc &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
