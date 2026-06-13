import { motion, PanInfo } from 'framer-motion';
import { Challenge } from '../data/challenges';
import { ChallengeCard } from '../components/ChallengeCard';

export function MapPage({
  challenges,
  completed,
  totalChallenges,
  activeIndex,
  onChange,
  onOpen,
}: {
  challenges: Challenge[];
  completed: string[];
  totalChallenges: number;
  activeIndex: number;
  onChange: (i: number) => void;
  onOpen: (c: Challenge) => void;
}) {
  const active = challenges[activeIndex];

  function onDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (info.offset.x < -50) onChange(Math.min(challenges.length - 1, activeIndex + 1));
    if (info.offset.x > 50) onChange(Math.max(0, activeIndex - 1));
  }

  return (
    <div className="map-page">
      <div className="map-card">
        {active && (
          <span
            className="map-cross"
            style={{ left: `${active.location.x}%`, top: `${active.location.y}%` }}
          >
            x
          </span>
        )}
        <div className="map-frame">
          <span>Entrance</span>
          <span>Gallery</span>
          <span>Challenge route</span>
        </div>
      </div>
      <div className="progress-row">
        <span>
          {completed.length} of {totalChallenges} pages completed
        </span>
        <span>{challenges.length} left</span>
      </div>
      <div className="progress-track">
        <div style={{ width: `${(completed.length / totalChallenges) * 100}%` }} />
      </div>
      {active ? (
        <>
          <motion.div
            className="challenge-carousel"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragMomentum={false}
            onDragEnd={onDragEnd}
          >
            <ChallengeCard challenge={active} completed={false} onClick={() => onOpen(active)} />
          </motion.div>
          <p className="swipe-hint">Swipe left or right to change the current challenge.</p>
        </>
      ) : (
        <div className="map-empty">
          <strong>All journal pages unlocked</strong>
          <span>Newly completed pages are removed from the map and saved in your collection.</span>
        </div>
      )}
    </div>
  );
}
