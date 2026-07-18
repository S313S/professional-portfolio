import WorksDetailSection from './components/WorksDetailSection';

export default function WorksDetailDebugPage() {
  const searchParams =
    typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);
  const initialDetailMode = searchParams.get('mode') === 'coding' ? 'coding' : 'design';
  const initialActiveCodingProjectId = searchParams.get('project');

  return (
    <main className="min-h-screen bg-black">
      <WorksDetailSection
        initialPhase="settled"
        initialTransitionProgress={1}
        initialView="detail"
        initialDetailMode={initialDetailMode}
        initialActiveCodingProjectId={initialActiveCodingProjectId}
      />
    </main>
  );
}
