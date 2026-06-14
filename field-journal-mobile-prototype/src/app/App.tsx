import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Lightbulb } from 'lucide-react';
import { challenges, Challenge } from '../data/challenges';
import { HomePage } from '../pages/HomePage';
import { MapPage } from '../pages/MapPage';
import { CollectionPage } from '../pages/CollectionPage';
import { ChallengePage } from '../pages/ChallengePage';

type Screen = 'home' | 'map' | 'collection' | 'challenge';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeIndex, setActiveIndex] = useState(0);
  const [mapIndex, setMapIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  const activeChallenge = challenges[activeIndex];
  const isMapScreen = screen === 'map';
  const unlocked = useMemo(
    () => challenges.filter((challenge) => completed.includes(challenge.id)),
    [completed],
  );
  const mapChallenges = useMemo(
    () => challenges.filter((challenge) => !completed.includes(challenge.id)),
    [completed],
  );

  useEffect(() => {
    setMapIndex((index) => Math.min(index, Math.max(0, mapChallenges.length - 1)));
  }, [mapChallenges.length]);

  function openChallenge(challenge: Challenge) {
    const challengeIndex = challenges.findIndex((item) => item.id === challenge.id);
    if (challengeIndex >= 0) {
      setActiveIndex(challengeIndex);
      setScreen('challenge');
    }
  }

  function completeChallenge(id: string) {
    setCompleted((previous) => (previous.includes(id) ? previous : [...previous, id]));
  }

  return (
    <main className="app-shell">
      <div className={`phone ${isMapScreen ? 'map-mode' : ''}`}>
        {!isMapScreen && (
          <header className={`top-bar ${screen === 'home' ? 'home-top-bar' : ''}`}>
            {screen !== 'home' ? (
              <button
                className="icon-button"
                onClick={() => setScreen(screen === 'challenge' ? 'map' : 'home')}
                type="button"
              >
                <ChevronLeft size={18} />
              </button>
            ) : (
              <span aria-hidden="true" />
            )}
            <div>
              <h1>My Field Journal</h1>
              <p>The Archaeology of the Netherlands</p>
            </div>
            {screen !== 'home' ? (
              <button className="icon-button" type="button">
                <Lightbulb size={18} />
              </button>
            ) : (
              <span aria-hidden="true" />
            )}
          </header>
        )}

        <AnimatePresence mode="wait">
          <motion.section
            key={`${screen}-${activeChallenge.id}-${mapChallenges.length}`}
            className="screen"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
          >
            {screen === 'home' && (
              <HomePage
                unlocked={unlocked}
                onStart={() => setScreen('map')}
                onCollection={() => setScreen('collection')}
              />
            )}
            {screen === 'map' && (
              <MapPage
                challenges={mapChallenges}
                completed={completed}
                totalChallenges={challenges.length}
                activeIndex={mapIndex}
                onChange={setMapIndex}
                onOpen={openChallenge}
                onBack={() => setScreen('home')}
              />
            )}
            {screen === 'collection' && (
              <CollectionPage unlocked={unlocked} allChallenges={challenges} />
            )}
            {screen === 'challenge' && (
              <ChallengePage
                challenge={activeChallenge}
                completed={completed.includes(activeChallenge.id)}
                onComplete={() => completeChallenge(activeChallenge.id)}
              />
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </main>
  );
}
