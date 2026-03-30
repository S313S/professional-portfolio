export default function WorksDetailSection() {
  return (
    <section
      id="works-detail-section"
      aria-labelledby="works-detail-title"
      className="relative min-h-[100dvh] overflow-hidden bg-[#efe3d4] text-[#2d2017]"
    >
      <div className="mx-auto flex min-h-[100dvh] max-w-[1200px] flex-col justify-center px-6 py-16 md:px-10">
        <p className="text-[0.82rem] uppercase tracking-[0.26em] text-[#8a6b56]">Works Detail</p>
        <h2
          id="works-detail-title"
          className="mt-4 font-serif text-[2.7rem] font-semibold tracking-[-0.04em] md:text-[4.4rem]"
        >
          Works Showcase Is Coming Next
        </h2>
        <p className="mt-6 max-w-[42rem] text-[1rem] leading-[1.7] text-[#5b4434] md:text-[1.08rem]">
          This section is the reserved landing zone for the upcoming work collection details.
          The lobby button now scrolls here directly so the entry flow is fully gated.
        </p>
      </div>
    </section>
  );
}
