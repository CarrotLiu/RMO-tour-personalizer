import { motion, useScroll, useTransform } from 'framer-motion';
import { Challenge } from '../data/challenges';
import { JournalCard } from '../components/JournalCard';

export function HomePage({
  visitorName,
  unlocked,
  onStart,
  onCollection,
}: {
  visitorName: string;
  unlocked: Challenge[];
  onStart: () => void;
  onCollection: () => void;
}) {
  const { scrollY } = useScroll();
  const introOpacity = useTransform(scrollY, [0, 120], [1, 0.28]);

  return (
    <div className="home page-scroll">
      <motion.div className="intro-card" style={{ opacity: introOpacity }}>
        <div className="home-journal-heading">
          <h2>My Field Journal</h2>
          <p>by {visitorName}</p>
        </div>
        <p>
          Explore the exhibition, discover artifacts, and unlock pages of your field journal as you
          complete museum challenges.
        </p>
        <div className="paper-tilt">☠</div>
      </motion.div>

      <button className="primary-button" onClick={onStart} type="button">
        Solve Your Challenges Now <span>›››</span>
      </button>

      <div className="section-title">
        <span>Your Journal Pages</span>
        <button onClick={onCollection} type="button">
          See all ›
        </button>
      </div>

      <div className="horizontal-list">
        {unlocked.map((challenge) => (
          <JournalCard key={challenge.id} challenge={challenge} />
        ))}
        <div className="locked-card">?</div>
      </div>

      <div className="how-it-works">
        <h2>How it works</h2>
        <ol>
          <li>Find artifacts around the exhibition.</li>
          <li>Solve the challenge connected to each object.</li>
          <li>Unlock your page collection.</li>
        </ol>
      </div>
    </div>
  );
}
