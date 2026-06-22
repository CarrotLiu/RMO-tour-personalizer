import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { motion, PanInfo, useDragControls } from 'framer-motion';
import { Check } from 'lucide-react';
import { Challenge, ChallengeOption } from '../data/challenges';
import { AssetImage } from './AssetImage';

type TargetId = 'face' | 'chest' | 'right-pelvis' | 'lower-pelvis';

type Target = {
  id: TargetId;
  label: string;
  x: number;
  y: number;
  size: number;
  dropSrc: string;
};

const targets: Target[] = [
  {
    id: 'face',
    label: 'Face',
    x: 54.5,
    y: 16.8,
    size: 16,
    dropSrc: 'assets/artifacts/stone-tomb/challenges/image-high/options/drop/coin.png',
  },
  {
    id: 'chest',
    label: 'Chest',
    x: 51.8,
    y: 42.5,
    size: 17,
    dropSrc: 'assets/artifacts/stone-tomb/challenges/image-high/options/drop/crucifix.png',
  },
  {
    id: 'right-pelvis',
    label: 'Right pelvis',
    x: 63,
    y: 74,
    size: 16,
    dropSrc: 'assets/artifacts/stone-tomb/challenges/image-high/options/drop/finger_ring.png',
  },
  {
    id: 'lower-pelvis',
    label: 'Lower pelvis',
    x: 47,
    y: 89.5,
    size: 16,
    dropSrc: 'assets/artifacts/stone-tomb/challenges/image-high/options/drop/padlock.png',
  },
];

function pointInRect(point: { x: number; y: number }, rect: DOMRect) {
  return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
}

export function StoneTombGapChallenge({
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

  function handleDrop(option: ChallengeOption, target: Target | undefined) {
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
    <div className="stone-gap-page">
      <div className="stone-gap-card">
        <AssetImage
          asset={challenge.cardAssets?.unsolvedChallenge ?? challenge.artifact}
          className="stone-gap-base"
        />
        {targets.map((target) => {
          const isPlaced = Boolean(placed[target.id]);
          return (
            <div
              key={target.id}
              ref={(element) => {
                targetRefs.current[target.id] = element;
              }}
              className={`stone-gap-target ${hoverTarget === target.id ? 'is-hovered' : ''} ${
                wrongTarget === target.id ? 'is-wrong' : ''
              } ${isPlaced ? 'is-placed' : ''}`}
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                width: `${target.size}%`,
                aspectRatio: '1 / 1',
              }}
              aria-label={target.label}
            >
              {isPlaced && (
                <motion.img
                  className="stone-gap-drop"
                  src={`${import.meta.env.BASE_URL}${target.dropSrc}`}
                  alt=""
                  initial={{ opacity: 0, scale: 0.72 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                />
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

      <div className="stone-option-grid">
        {challenge.options.map((option) => (
          <StoneGapOption
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

function StoneGapOption({
  option,
  disabled,
  targetAtPoint,
  onHover,
  onDrop,
}: {
  option: ChallengeOption;
  disabled: boolean;
  targetAtPoint: (point: { x: number; y: number }) => Target | undefined;
  onHover: (targetId: string | null) => void;
  onDrop: (option: ChallengeOption, target: Target | undefined) => void;
}) {
  const dragControls = useDragControls();
  const timer = useRef<number | null>(null);
  const pointerDown = useRef(false);
  const dragging = useRef(false);
  const [dragReady, setDragReady] = useState(false);

  function startHold(event: ReactPointerEvent<HTMLButtonElement>) {
    if (disabled) return;
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
      className={`stone-gap-option ${dragReady ? 'is-drag-ready' : ''}`}
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
