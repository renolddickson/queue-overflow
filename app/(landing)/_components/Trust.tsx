export default function Trust() {
  return (
    <section className="py-20 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-slate-400 mb-12">
          Loved by innovative teams worldwide
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all">
          {['GitHub', 'Stripe', 'Vercel', 'Notion', 'Slack'].map((company) => (
            <span key={company} className="text-2xl font-bold tracking-tighter text-slate-600 dark:text-slate-300">
              {company}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
