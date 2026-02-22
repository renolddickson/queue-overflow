import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-40 px-4 text-center">
      <div className="max-w-2xl mx-auto space-y-12">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Ready to build <br /> knowledge together?</h2>
        <div className="flex flex-center justify-center">
          <Link href="/auth/register">
            <button className="inline-flex items-center justify-center h-16 px-10 rounded-full text-xl font-bold bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
              Get Started Free
            </button>
          </Link>
        </div>
        <p className="text-slate-400">No credit card required. Start creating in minutes.</p>
      </div>
    </section>
  );
}
