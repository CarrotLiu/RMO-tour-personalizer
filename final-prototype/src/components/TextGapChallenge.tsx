import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Challenge } from '../data/challenges';
import { DraggableOption } from './DraggableOption';

type TextGapStatus = 'idle' | 'hover' | 'wrong' | 'correct';

function splitPrompt(prompt: string) {
  const [before = prompt, after = ''] = prompt.split(/_{3,}/);
  return { before, after };
}

export function TextGapChallenge({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: () => void;
}) {
  const dropTargetRef = useRef<HTMLSpanElement>(null);
  const [status, setStatus] = useState<TextGapStatus>('idle');
  const [answer, setAnswer] = useState<string | null>(null);
  const promptParts = useMemo(() => splitPrompt(challenge.prompt), [challenge.prompt]);

  function getDropRect() {
    return dropTargetRef.current?.getBoundingClientRect() ?? null;
  }

  function handleDrop(label: string) {
    if (label !== challenge.correctAnswer) {
      setStatus('wrong');
      window.setTimeout(() => setStatus('idle'), 650);
      return;
    }

    setAnswer(label);
    setStatus('correct');
    window.setTimeout(onComplete, 900);
  }

  return (
    <div className="text-gap-page">
      <motion.div
        className={`text-gap-card ${status}`}
        animate={status === 'wrong' ? { x: [0, -8, 8, -4, 4, 0] } : {}}
      >
        <p className="text-gap-copy">
          {promptParts.before}
          {answer ? (
            <motion.span
              className="text-gap-answer"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            >
              {answer}
            </motion.span>
          ) : (
            <span
              ref={dropTargetRef}
              className={`text-gap-blank ${status === 'hover' ? 'is-hovered' : ''} ${
                status === 'wrong' ? 'is-wrong' : ''
              }`}
              aria-label={challenge.targetLabel}
            />
          )}
          {promptParts.after}
        </p>

        {answer && (
          <span className="text-gap-saved">
            <Check size={15} />
            Saved
          </span>
        )}
      </motion.div>

      {!answer && (
        <div className="text-gap-options">
          {challenge.options.map((option) => (
            <DraggableOption
              key={option.id}
              label={option.label}
              getDropRect={getDropRect}
              onHoverChange={(isHovering) => setStatus(isHovering ? 'hover' : 'idle')}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}
