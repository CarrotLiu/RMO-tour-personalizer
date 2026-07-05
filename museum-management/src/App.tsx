import { useState } from 'react';
import { Layout, type SetupStepId, type ViewId } from './components/Layout';
import {
  initialAiLabels,
  initialArtifacts,
  initialAspects,
  initialChallenges,
  initialIntro,
} from './data/exhibition';
import type {
  ArtifactAiLabel,
  ArtifactEntry,
  AspectType,
  DraftChallenge,
  ExhibitionIntro,
  MapPosition,
} from './types/models';
import {
  AspectsStep,
  DataSheetStep,
  FloorPlanStep,
  GeneratingPage,
  IntroStep,
} from './pages/SetupPages';
import { DraftChallengesPage, DraftLabelsPage } from './pages/DraftPages';
import { DraftMapPage } from './pages/DraftMapPage';

export function App() {
  const [view, setView] = useState<ViewId>('intro');
  const [completedSteps, setCompletedSteps] = useState<SetupStepId[]>([]);
  const [draftReady, setDraftReady] = useState(false);

  const [intro, setIntro] = useState<ExhibitionIntro>(initialIntro);
  const [aspects, setAspects] = useState<AspectType[]>(initialAspects);
  const [artifacts, setArtifacts] = useState<ArtifactEntry[]>(initialArtifacts);

  const [aiLabels, setAiLabels] = useState<Record<string, ArtifactAiLabel>>(initialAiLabels);
  const [challenges, setChallenges] = useState<DraftChallenge[]>(initialChallenges);
  const [positions, setPositions] = useState<Record<string, MapPosition>>({});
  const [selectedArtifactId, setSelectedArtifactId] = useState(initialArtifacts[0]?.id ?? '');

  function completeStep(step: SetupStepId, next: ViewId) {
    setCompletedSteps((current) => (current.includes(step) ? current : [...current, step]));
    setView(next);
  }

  function updateLabel(artifactId: string, patch: Partial<ArtifactAiLabel>) {
    setAiLabels((current) => ({
      ...current,
      [artifactId]: { ...current[artifactId], ...patch },
    }));
  }

  function updateChallenge(id: string, patch: Partial<DraftChallenge>) {
    setChallenges((current) =>
      current.map((challenge) => (challenge.id === id ? { ...challenge, ...patch } : challenge)),
    );
  }

  let content: React.ReactNode;
  switch (view) {
    case 'intro':
      content = (
        <IntroStep
          intro={intro}
          onChange={(patch) => setIntro((current) => ({ ...current, ...patch }))}
          onNext={() => completeStep('intro', 'aspects')}
        />
      );
      break;
    case 'aspects':
      content = (
        <AspectsStep
          aspects={aspects}
          onChange={setAspects}
          onBack={() => setView('intro')}
          onNext={() => completeStep('aspects', 'datasheet')}
        />
      );
      break;
    case 'datasheet':
      content = (
        <DataSheetStep
          artifacts={artifacts}
          onChange={setArtifacts}
          onBack={() => setView('aspects')}
          onNext={() => completeStep('datasheet', 'floorplan')}
        />
      );
      break;
    case 'floorplan':
      content = (
        <FloorPlanStep
          onBack={() => setView('datasheet')}
          onGenerate={() => completeStep('floorplan', 'generating')}
        />
      );
      break;
    case 'generating':
      content = (
        <GeneratingPage
          onDone={() => {
            setDraftReady(true);
            setView('labels');
          }}
        />
      );
      break;
    case 'labels':
      content = (
        <DraftLabelsPage
          artifacts={artifacts}
          aspects={aspects}
          labels={aiLabels}
          onUpdateLabel={updateLabel}
        />
      );
      break;
    case 'challenges':
      content = (
        <DraftChallengesPage
          artifacts={artifacts}
          challenges={challenges}
          selectedArtifactId={selectedArtifactId}
          onSelectArtifact={setSelectedArtifactId}
          onUpdateChallenge={updateChallenge}
        />
      );
      break;
    case 'map':
      content = (
        <DraftMapPage
          artifacts={artifacts}
          positions={positions}
          onPlace={(artifactId, position) =>
            setPositions((current) => ({ ...current, [artifactId]: position }))
          }
          onRemove={(artifactId) =>
            setPositions((current) => {
              const next = { ...current };
              delete next[artifactId];
              return next;
            })
          }
        />
      );
      break;
  }

  return (
    <Layout
      activeView={view}
      completedSteps={completedSteps}
      draftReady={draftReady}
      onViewChange={setView}
    >
      {content}
    </Layout>
  );
}
