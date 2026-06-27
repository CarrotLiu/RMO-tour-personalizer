import { useState } from 'react';
import type { CSSProperties, ReactNode, UIEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ChevronsDown, ChevronsRight, MapPin, Star } from 'lucide-react';
import { Challenge, challenges } from '../data/challenges';
import { AssetImage } from '../components/AssetImage';

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
  const [compact, setCompact] = useState(false);
  const featuredPages = ['dorestad-brooch', 'skeleton']
    .map((id) => challenges.find((challenge) => challenge.id === id))
    .filter((challenge): challenge is Challenge => Boolean(challenge));
  const journalPages = unlocked;
  const heroPages = featuredPages.length > 0 ? featuredPages : journalPages;
  const activeChallengeBackground = `${import.meta.env.BASE_URL}assets/exhibition_photo.jpg`;

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    setCompact(event.currentTarget.scrollTop > 80);
  }

  return (
    <div className={`home page-scroll ${compact ? 'is-compact' : ''}`} onScroll={handleScroll}>
      <header className="home-hero">
        <h1>My Field Journal</h1>
        <AnimatePresence mode="wait">
          {compact ? (
            <motion.div
              key="compact-subtitle"
              className="home-compact-heading"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
            >
              <p>THE ARCHEOLOGY OF THE NETHERLANDS</p>
              <ChevronsDown size={34} strokeWidth={2.4} />
            </motion.div>
          ) : (
            <motion.p
              key="home-byline"
              className="home-byline"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
            >
              By {visitorName || 'Username'}
            </motion.p>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence mode="wait">
        {!compact ? (
          <motion.section
            key="active-card"
            className="home-active-section"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <div className="section-title home-section-title">
              <span>Your Active Challenge</span>
            </div>
            <button
              className="active-challenge-card"
              onClick={onStart}
              style={{ '--active-bg': `url(${activeChallengeBackground})` } as CSSProperties}
              type="button"
            >
              <span className="active-challenge-copy">
                Explore the Archeology of
                <br />
                the Netherlands,
                <br />
                complete journal pages
                <br />
                about the early history of
                <br />
                the Netherlands!
              </span>
              <span className="active-page-stack" aria-hidden="true">
                {heroPages.slice(0, 3).map((challenge, index) => (
                  <span className={`active-page-mini page-${index + 1}`} key={challenge.id}>
                    <AssetImage
                      asset={challenge.cardAssets?.solvedPreview ?? challenge.artifact}
                      className="active-page-art"
                    />
                    <span>{challenge.cardTitle}</span>
                  </span>
                ))}
              </span>
              <span className="active-location">
                <MapPin size={22} strokeWidth={2.1} />
                RIJKSMUSEUM VAN OUDHEDEN
              </span>
            </button>
          </motion.section>
        ) : (
          <motion.button
            key="solve-pill"
            className="home-solve-pill"
            onClick={onStart}
            type="button"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <span className="solve-location-icon">
              <MapPin size={28} strokeWidth={2.2} />
            </span>
            <span>Solve Challenges Now!</span>
            <ChevronsRight className="solve-chevron" size={32} strokeWidth={2.4} />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="section-title home-section-title">
        <span>{compact ? 'Your Journal Pages' : 'Your Completed Pages'}</span>
        <button onClick={onCollection} type="button">
          See all ›
        </button>
      </div>

      <div className="horizontal-list home-journal-list">
        {journalPages.length > 0 ? (
          journalPages.map((challenge) => (
            <HomeJournalPreview key={challenge.id} challenge={challenge} />
          ))
        ) : (
          <div className="home-lock-card" aria-label="No completed journal pages yet">
            ?
          </div>
        )}
      </div>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="how-panel">
          <HowStep
            icon={<MapPin size={25} />}
            title="Find artifacts"
            text="Explore the museum and locate objects in each gallery"
          />
          <HowStep
            icon={<BookOpen size={25} />}
            title="Solve the challenges"
            text="Read exhibition labels or observe the artifacts to solve the challenge on the back of a page"
          />
          <HowStep
            icon={<Star size={25} />}
            title="Unlock your page collection"
            text="Correct answers add a page to your personal field journal"
          />
        </div>
      </section>
    </div>
  );
}

function HomeJournalPreview({ challenge }: { challenge: Challenge }) {
  const previewAsset = challenge.cardAssets?.solvedPreview ?? challenge.artifact;

  return (
    <button className="home-journal-card" type="button" aria-label={`${challenge.title} journal page`}>
      <span className="home-journal-title">{challenge.cardTitle}</span>
      <AssetImage asset={previewAsset} className="home-journal-art" />
      <span className="home-journal-period">{challenge.period}</span>
    </button>
  );
}

function HowStep({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="how-step">
      <span className="how-icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <em>{text}</em>
      </span>
    </div>
  );
}
