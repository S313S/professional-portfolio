import WorksDetailSection from './components/WorksDetailSection';

export default function WorksDetailDebugPage() {
  return (
    <main className="min-h-screen bg-black">
      <WorksDetailSection
        initialPhase="settled"
        initialTransitionProgress={1}
        initialView="detail"
        initialDetailMode="design"
      />
    </main>
  );
}
