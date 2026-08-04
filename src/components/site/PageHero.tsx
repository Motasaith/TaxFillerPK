export function PageHero({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <section className="border-b border-line-dark bg-forest-950 text-paper">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-[12.5px] font-medium uppercase tracking-wider text-brass-400">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.2rem,4.5vw,3.4rem)] font-normal leading-[1.1] text-paper">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-[16.5px] leading-relaxed text-forest-300">{body}</p>
      </div>
    </section>
  );
}
