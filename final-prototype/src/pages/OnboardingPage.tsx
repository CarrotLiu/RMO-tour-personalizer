import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Camera, Check, Move, Sparkles } from 'lucide-react';

type MuseumId = 'rmo' | 'rijksmuseum' | 'mauritshuis';
type MotivationId = 'explore' | 'knowledge' | 'fun' | 'social';

export type VisitorProfile = {
  museum: MuseumId;
  exhibition: string;
  motivation: MotivationId;
  aspect?: string;
  challengeFormat: 'image' | 'text' | 'both';
};

type StepId = 'tutorial-capture' | 'tutorial-drag' | 'museum' | 'exhibition' | 'motivation' | 'aspect' | 'format';

const museums: { id: MuseumId; label: string; exhibitions: string[] }[] = [
  {
    id: 'rmo',
    label: 'Rijksmuseum van Oudheden',
    exhibitions: ['Archaeology of the Netherlands', 'Egypt', 'Classical World'],
  },
  {
    id: 'rijksmuseum',
    label: 'Rijksmuseum',
    exhibitions: ['Gallery of Honour', 'Special Collections', 'Asian Pavilion'],
  },
  {
    id: 'mauritshuis',
    label: 'Mauritshuis',
    exhibitions: ['Dutch Masters', 'Vermeer', 'Royal Cabinet'],
  },
];

const motivations: { id: MotivationId; label: string; detail: string }[] = [
  { id: 'explore', label: 'Explore freely', detail: 'I want to wander and discover surprises.' },
  { id: 'knowledge', label: 'Learn specific knowledge', detail: 'I want focused stories about certain topics.' },
  { id: 'fun', label: 'Have a playful visit', detail: 'I prefer light challenges and game-like moments.' },
  { id: 'social', label: 'Share with others', detail: 'I want things I can discuss with my group.' },
];

const aspects = ['Trade', 'Power', 'Farming', 'Ritual', 'Fashion', 'Daily life', 'Technology'];

const formats: { id: VisitorProfile['challengeFormat']; label: string; detail: string }[] = [
  { id: 'image', label: 'Image', detail: 'Sketches, visual matching, and object placement.' },
  { id: 'text', label: 'Text', detail: 'Reading clues and filling missing words.' },
  { id: 'both', label: 'Both', detail: 'A balanced mix of image and text challenges.' },
];

export function OnboardingPage({ onComplete }: { onComplete: (profile: VisitorProfile) => void }) {
  const [step, setStep] = useState<StepId>('tutorial-capture');
  const [museum, setMuseum] = useState<MuseumId | null>(null);
  const [exhibition, setExhibition] = useState('');
  const [motivation, setMotivation] = useState<MotivationId | null>(null);
  const [aspect, setAspect] = useState('');
  const [challengeFormat, setChallengeFormat] = useState<VisitorProfile['challengeFormat'] | null>(null);

  const selectedMuseum = useMemo(
    () => museums.find((item) => item.id === museum) ?? null,
    [museum],
  );

  function goNext() {
    if (step === 'tutorial-capture') {
      setStep('tutorial-drag');
      return;
    }
    if (step === 'tutorial-drag') {
      setStep('museum');
      return;
    }
    if (step === 'museum' && museum) {
      setExhibition('');
      setStep('exhibition');
      return;
    }
    if (step === 'exhibition' && exhibition) {
      setStep('motivation');
      return;
    }
    if (step === 'motivation' && motivation) {
      setStep(motivation === 'knowledge' ? 'aspect' : 'format');
      return;
    }
    if (step === 'aspect' && aspect) {
      setStep('format');
      return;
    }
    if (step === 'format' && museum && exhibition && motivation && challengeFormat) {
      onComplete({
        museum,
        exhibition,
        motivation,
        aspect: motivation === 'knowledge' ? aspect : undefined,
        challengeFormat,
      });
    }
  }

  function canContinue() {
    if (step.startsWith('tutorial')) return true;
    if (step === 'museum') return Boolean(museum);
    if (step === 'exhibition') return Boolean(exhibition);
    if (step === 'motivation') return Boolean(motivation);
    if (step === 'aspect') return Boolean(aspect);
    return Boolean(challengeFormat);
  }

  return (
    <div className="onboarding-page">
      <motion.div
        key={step}
        className="onboarding-panel"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        {step === 'tutorial-capture' && (
          <TutorialStep
            icon={<Camera size={34} />}
            title="Capture the artifact"
            copy="Each challenge starts by taking a photo of the object you found in the museum."
          />
        )}

        {step === 'tutorial-drag' && (
          <TutorialStep
            icon={<Move size={34} />}
            title="Long press and drag"
            copy="Hold an answer card, drag it into the highlighted gap, and release it to solve the page."
          />
        )}

        {step === 'museum' && (
          <ChoiceStep title="Choose museum" subtitle="Where are you visiting today?">
            {museums.map((item) => (
              <ChoiceButton
                key={item.id}
                selected={museum === item.id}
                label={item.label}
                onClick={() => setMuseum(item.id)}
              />
            ))}
          </ChoiceStep>
        )}

        {step === 'exhibition' && selectedMuseum && (
          <ChoiceStep title="Choose exhibition" subtitle={`Inside ${selectedMuseum.label}`}>
            {selectedMuseum.exhibitions.map((item) => (
              <ChoiceButton
                key={item}
                selected={exhibition === item}
                label={item}
                onClick={() => setExhibition(item)}
              />
            ))}
          </ChoiceStep>
        )}

        {step === 'motivation' && (
          <ChoiceStep title="What brings you here?" subtitle="This helps shape your field journal.">
            {motivations.map((item) => (
              <ChoiceButton
                key={item.id}
                selected={motivation === item.id}
                label={item.label}
                detail={item.detail}
                onClick={() => setMotivation(item.id)}
              />
            ))}
          </ChoiceStep>
        )}

        {step === 'aspect' && (
          <ChoiceStep title="Choose an aspect" subtitle="What kind of knowledge interests you most?">
            <div className="aspect-chip-grid">
              {aspects.map((item) => (
                <button
                  key={item}
                  className={`aspect-chip ${aspect === item ? 'is-selected' : ''}`}
                  onClick={() => setAspect(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </ChoiceStep>
        )}

        {step === 'format' && (
          <ChoiceStep title="Preferred challenge format" subtitle="What kind of challenge feels best?">
            {formats.map((item) => (
              <ChoiceButton
                key={item.id}
                selected={challengeFormat === item.id}
                label={item.label}
                detail={item.detail}
                onClick={() => setChallengeFormat(item.id)}
              />
            ))}
          </ChoiceStep>
        )}
      </motion.div>

      <div className="onboarding-footer">
        <ProgressDots step={step} />
        <button className="onboarding-next" disabled={!canContinue()} onClick={goNext} type="button">
          {step === 'format' ? 'Start journal' : 'Continue'}
          {step === 'format' ? <Sparkles size={17} /> : <Check size={17} />}
        </button>
      </div>
    </div>
  );
}

function TutorialStep({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return (
    <div className="tutorial-step">
      <div className="tutorial-icon">{icon}</div>
      <h2>{title}</h2>
      <p>{copy}</p>
    </div>
  );
}

function ChoiceStep({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="choice-step">
      <h2>{title}</h2>
      <p>{subtitle}</p>
      <div className="choice-list">{children}</div>
    </div>
  );
}

function ChoiceButton({
  selected,
  label,
  detail,
  onClick,
}: {
  selected: boolean;
  label: string;
  detail?: string;
  onClick: () => void;
}) {
  return (
    <button className={`choice-button ${selected ? 'is-selected' : ''}`} onClick={onClick} type="button">
      <span>{label}</span>
      {detail && <small>{detail}</small>}
    </button>
  );
}

function ProgressDots({ step }: { step: StepId }) {
  const visibleSteps: StepId[] = [
    'tutorial-capture',
    'tutorial-drag',
    'museum',
    'exhibition',
    'motivation',
    'aspect',
    'format',
  ];
  const currentIndex = visibleSteps.indexOf(step);

  return (
    <div className="onboarding-progress" aria-label={`Onboarding step ${currentIndex + 1}`}>
      {visibleSteps.map((item, index) => (
        <span key={item} className={index <= currentIndex ? 'is-active' : ''} />
      ))}
    </div>
  );
}
