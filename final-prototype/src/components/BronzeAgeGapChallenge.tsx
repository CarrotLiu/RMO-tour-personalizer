import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { motion, PanInfo, useDragControls } from 'framer-motion';
import { Check } from 'lucide-react';
import { Challenge, ChallengeOption } from '../data/challenges';
import { AssetImage } from './AssetImage';

type BronzeTargetId = 'cloak' | 'razor';

type BronzeTarget = {
  id: BronzeTargetId;
  label: string;
  answer: string;
  x: number;
  y: number;
  width: number;
  height: number;
  answerX: number;
  answerY: number;
  answerWidth: number;
  answerHeight: number;
};

const targets: BronzeTarget[] = [
  {
    id: 'cloak',
    label: 'Top blank',
    answer: 'cloak',
    x: 9.5,
    y: 16.2,
    width: 38,
    height: 10.5,
    answerX: 12.5,
    answerY: 18.4,
    answerWidth: 22,
    answerHeight: 6.2,
  },
  {
    id: 'razor',
    label: 'Lower blank',
    answer: 'razor',
    x: 57.5,
    y: 80.7,
    width: 35,
    height: 11,
    answerX: 61.5,
    answerY: 83.5,
    answerWidth: 27,
    answerHeight: 7.2,
  },
];

function pointInRect(point: { x: number; y: number }, rect: DOMRect) {
  return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
}

export function BronzeAgeGapChallenge({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: () => void;
}) {
  const targetRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [hoverTarget, setHoverTarget] = useState<string | null>(null);
  const [wrongTarget, setWrongTarget] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  function targetAtPoint(point: { x: number; y: number }) {
    return targets.find((target) => {
      const element = targetRefs.current[target.id];
      return element ? pointInRect(point, element.getBoundingClientRect()) : false;
    });
  }

  function handleDrop(option: ChallengeOption, target: BronzeTarget | undefined) {
    if (!target) return;

    if (option.targetId === target.id) {
      setPlaced((current) => {
        const next = { ...current, [target.id]: option.id };
        if (Object.keys(next).length === targets.length) {
          setCompleted(true);
          window.setTimeout(onComplete, 850);
        }
        return next;
      });
      return;
    }

    setWrongTarget(target.id);
    window.setTimeout(() => setWrongTarget(null), 650);
  }

  return (
    <div className="bronze-gap-page">
      <div className="bronze-gap-card">
        <AssetImage
          asset={challenge.cardAssets?.unsolvedChallenge ?? challenge.artifact}
          className="bronze-gap-base"
        />
        {targets.map((target) => {
          const optionId = placed[target.id];
          return (
            <div key={target.id}>
              <div
                ref={(element) => {
                  targetRefs.current[target.id] = element;
                }}
                className={`bronze-gap-hit ${hoverTarget === target.id ? 'is-hovered' : ''} ${
                  wrongTarget === target.id ? 'is-wrong' : ''
                }`}
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  width: `${target.width}%`,
                  height: `${target.height}%`,
                }}
                aria-label={target.label}
              />
              {optionId && (
                <motion.span
                  className="bronze-gap-answer"
                  style={{
                    left: `${target.answerX}%`,
                    top: `${target.answerY}%`,
                    width: `${target.answerWidth}%`,
                    height: `${target.answerHeight}%`,
                  }}
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                >
                  {target.answer}
                </motion.span>
              )}
            </div>
          );
        })}
        {completed && (
          <motion.span
            className="stone-gap-complete"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Check size={15} />
            Saved
          </motion.span>
        )}
      </div>

      <p className="challenge-prompt">{challenge.prompt}</p>

      <div className="bronze-option-grid">
        {challenge.options.map((option) => (
          <BronzeGapOption
            key={option.id}
            option={option}
            disabled={Object.values(placed).includes(option.id)}
            targetAtPoint={targetAtPoint}
            onHover={setHoverTarget}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}

function BronzeGapOption({
  option,
  disabled,
  targetAtPoint,
  onHover,
  onDrop,
}: {
  option: ChallengeOption;
  disabled: boolean;
  targetAtPoint: (point: { x: number; y: number }) => BronzeTarget | undefined;
  onHover: (targetId: string | null) => void;
  onDrop: (option: ChallengeOption, target: BronzeTarget | undefined) => void;
}) {
  const dragControls = useDragControls();
  const timer = useRef<number | null>(null);
  const pointerDown = useRef(false);
  const dragging = useRef(false);
  const [dragReady, setDragReady] = useState(false);

  function startHold(event: ReactPointerEvent<HTMLButtonElement>) {
    if (disabled) return;
    event.preventDefault();
    const pointerEvent = event.nativeEvent;
    pointerDown.current = true;
    timer.current = window.setTimeout(() => {
      if (!pointerDown.current) return;
      setDragReady(true);
      dragControls.start(pointerEvent);
    }, 140);
  }

  function clearHold() {
    pointerDown.current = false;
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    if (!dragging.current) {
      setDragReady(false);
      onHover(null);
    }
  }

  function handleDrag(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    dragging.current = true;
    setDragReady(false);
    onHover(targetAtPoint(info.point)?.id ?? null);
  }

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const target = targetAtPoint(info.point);
    pointerDown.current = false;
    dragging.current = false;
    setDragReady(false);
    onHover(null);
    onDrop(option, target);
  }

  return (
    <motion.button
      className={`stone-gap-option bronze-gap-option ${dragReady ? 'is-drag-ready' : ''}`}
      drag={!disabled}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragSnapToOrigin
      disabled={disabled}
      onPointerDown={startHold}
      onPointerUp={clearHold}
      onPointerCancel={clearHold}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.08, zIndex: 30 }}
      type="button"
    >
      {option.asset && <AssetImage asset={option.asset} className="stone-gap-option-art" />}
      <span>{option.label}</span>
    </motion.button>
  );
}
