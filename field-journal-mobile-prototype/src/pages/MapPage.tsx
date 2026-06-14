import { useEffect, useRef, useState } from 'react';
import { animate, motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, Lightbulb } from 'lucide-react';
import { Challenge } from '../data/challenges';
import { AssetImage } from '../components/AssetImage';

const CARD_WIDTH = 232;
const CARD_GAP = 22;
const CARD_STEP = CARD_WIDTH + CARD_GAP;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function MapChallengeCard({
  challenge,
  index,
  trackX,
  centerOffset,
  active,
  onOpen,
}: {
  challenge: Challenge;
  index: number;
  trackX: ReturnType<typeof useMotionValue<number>>;
  centerOffset: number;
  active: boolean;
  onOpen: () => void;
}) {
  const previewAsset = challenge.cardAssets?.unsolvedPreview ?? challenge.artifact;
  const focusedX = centerOffset - index * CARD_STEP;
  const scale = useTransform(
    trackX,
    [focusedX - CARD_STEP, focusedX, focusedX + CARD_STEP],
    [0.88, 1.12, 0.88],
  );
  const opacity = useTransform(
    trackX,
    [focusedX - CARD_STEP, focusedX, focusedX + CARD_STEP],
    [0.68, 1, 0.68],
  );

  return (
    <motion.button
      className={`map-challenge-card ${active ? 'active' : ''}`}
      style={{ scale, opacity }}
      onClick={onOpen}
      type="button"
    >
      <span className="map-card-name">{challenge.cardTitle}</span>
      <AssetImage asset={previewAsset} className="map-card-art" />
      <span className="map-card-date">
        {challenge.title}, {challenge.period}
      </span>
    </motion.button>
  );
}

export function MapPage({
  challenges,
  completed,
  totalChallenges,
  activeIndex,
  onChange,
  onOpen,
  onBack,
}: {
  challenges: Challenge[];
  completed: string[];
  totalChallenges: number;
  activeIndex: number;
  onChange: (i: number) => void;
  onOpen: (c: Challenge) => void;
  onBack: () => void;
}) {
  const active = challenges[activeIndex];
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackX = useMotionValue(0);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const centerOffset = Math.max(0, carouselWidth / 2 - CARD_WIDTH / 2);
  const maxIndex = Math.max(0, challenges.length - 1);

  useEffect(() => {
    const element = carouselRef.current;
    if (!element) return;

    const updateWidth = () => setCarouselWidth(element.clientWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!carouselWidth) return;
    const controls = animate(trackX, centerOffset - activeIndex * CARD_STEP, {
      type: 'spring',
      stiffness: 360,
      damping: 34,
      mass: 0.9,
    });
    return controls.stop;
  }, [activeIndex, carouselWidth, centerOffset, trackX]);

  function snapTo(index: number) {
    const nextIndex = clamp(index, 0, maxIndex);
    onChange(nextIndex);
  }

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const projectedIndex = Math.round((centerOffset - trackX.get()) / CARD_STEP);
    const intent =
      Math.abs(info.velocity.x) > 520
        ? activeIndex + (info.velocity.x < 0 ? 1 : -1)
        : projectedIndex;

    snapTo(intent);
  }

  return (
    <div className="map-page">
      <section className="map-stage" aria-label="Exhibition map">
        <div className="map-progress-row">
          <span>
            {completed.length} of {totalChallenges} pages completed
          </span>
          <span>CHAPTER 1</span>
        </div>
        <div className="map-progress-track">
          <div style={{ width: `${(completed.length / totalChallenges) * 100}%` }} />
        </div>

        <div className="parchment-map">
          {active?.mapAsset && <AssetImage asset={active.mapAsset} className="map-image" />}
        </div>
      </section>

      {active ? (
        <section className="map-carousel-section" aria-label="Challenge selector">
          <div className="map-carousel-window" ref={carouselRef}>
            <motion.div
              className="map-carousel-track"
              style={{ x: trackX }}
              drag="x"
              dragConstraints={{
                left: centerOffset - maxIndex * CARD_STEP,
                right: centerOffset,
              }}
              dragElastic={0.08}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
            >
              {challenges.map((challenge, index) => (
                <MapChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  index={index}
                  trackX={trackX}
                  centerOffset={centerOffset}
                  active={index === activeIndex}
                  onOpen={() => onOpen(challenge)}
                />
              ))}
            </motion.div>
          </div>
        </section>
      ) : (
        <div className="map-empty">
          <strong>All journal pages unlocked</strong>
          <span>Newly completed pages are removed from the map and saved in your collection.</span>
        </div>
      )}

      <nav className="map-bottom-nav" aria-label="Map controls">
        <button className="map-nav-button" onClick={onBack} type="button" aria-label="Back home">
          <ChevronLeft size={22} />
        </button>
        <button className="map-nav-button" type="button" aria-label="Hint">
          <Lightbulb size={20} />
        </button>
      </nav>
    </div>
  );
}
