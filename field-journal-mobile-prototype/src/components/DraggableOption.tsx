import { useRef, useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { ChallengeAsset } from '../data/challenges';
import { AssetImage } from './AssetImage';

function pointInRect(point: { x: number; y: number }, rect: DOMRect | null) {
  if (!rect) return false;
  return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
}

export function DraggableOption({
  label,
  asset,
  flipText,
  compact = false,
  getDropRect,
  onHoverChange,
  onDrop,
}: {
  label: string;
  asset?: ChallengeAsset;
  flipText?: string;
  compact?: boolean;
  getDropRect: () => DOMRect | null;
  onHoverChange?: (isHovering: boolean) => void;
  onDrop: (label: string) => void;
}) {
  const timer = useRef<number | null>(null);
  const wasDragging = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [flipped, setFlipped] = useState(false);

  function startHold() {
    timer.current = window.setTimeout(() => {
      wasDragging.current = true;
      setEnabled(true);
    }, 280);
  }

  function clearHold() {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }

  function handleTap() {
    if (wasDragging.current) {
      wasDragging.current = false;
      return;
    }
    if (flipText) setFlipped((value) => !value);
  }

  function handleDrag(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    onHoverChange?.(pointInRect(info.point, getDropRect()));
  }

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const dropped = pointInRect(info.point, getDropRect());
    setEnabled(false);
    onHoverChange?.(false);
    if (dropped) onDrop(label);
  }

  return (
    <motion.button
      className={`drag-option ${compact ? 'compact' : ''} ${flipped ? 'is-flipped' : ''}`}
      drag={enabled}
      dragMomentum={false}
      dragSnapToOrigin
      onClick={handleTap}
      onPointerDown={startHold}
      onPointerUp={clearHold}
      onPointerCancel={clearHold}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.06, zIndex: 20 }}
      type="button"
    >
      <span className="option-face option-front">
        {asset && <AssetImage asset={asset} className="option-art" />}
        <span>{label}</span>
      </span>
      {flipText && <span className="option-face option-back">{flipText}</span>}
    </motion.button>
  );
}
