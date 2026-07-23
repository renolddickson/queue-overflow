import Link from "next/link";

const Brand = ({ href = "/" }: { href?: string }) => {
  return (
    <Link href={href} className="flex items-center gap-2 group select-none transition-opacity hover:opacity-90">
      <div className="flex flex-col -space-y-1">
        <span className="font-serif text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-slate-800 to-slate-950 dark:from-white dark:via-slate-200 dark:to-white">
          Novioc
        </span>
      </div>
    </Link>
  )
}

export default Brand;