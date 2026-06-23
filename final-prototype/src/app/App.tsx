import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Lightbulb } from 'lucide-react';
import { challenges, Challenge, ChallengeCompletionRecord } from '../data/challenges';
import { HomePage } from '../pages/HomePage';
import { MapPage } from '../pages/MapPage';
import { CollectionPage } from '../pages/CollectionPage';
import { ChallengePage } from '../pages/ChallengePage';
import { JudgePage } from '../pages/JudgePage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { OnboardingPage, VisitorProfile } from '../pages/OnboardingPage';
import {
  saveAcceptedArtifactPhoto,
  saveVisitorProfile,
  saveVisitorRegistration,
} from './firebaseJournal';

type Screen = 'register' | 'onboarding' | 'home' | 'map' | 'collection' | 'challenge';

function createSessionId() {
  return crypto.randomUUID?.() ?? `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function App() {
  if (new URLSearchParams(window.location.search).has('judge')) {
    return <JudgePage />;
  }

  const [visitorSessionId] = useState(createSessionId);
  const [visitorName, setVisitorName] = useState('');
  const [, setVisitorProfile] = useState<VisitorProfile | null>(null);
  const [screen, setScreen] = useState<Screen>('register');
  const [activeIndex, setActiveIndex] = useState(0);
  const [mapIndex, setMapIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [completionRecords, setCompletionRecords] = useState<Record<string, ChallengeCompletionRecord>>({});

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

  function completeChallenge(id: string, record: ChallengeCompletionRecord) {
    setCompleted((previous) => (previous.includes(id) ? previous : [...previous, id]));
    setCompletionRecords((previous) => ({
      ...previous,
      [id]: previous[id] ?? record,
    }));
  }

  function registerVisitor(name: string) {
    setVisitorName(name);
    void saveVisitorRegistration({ sessionId: visitorSessionId, username: name }).catch((error) => {
      console.warn('Unable to save visitor registration to Firebase.', error);
    });
    setScreen('onboarding');
  }

  function completeOnboarding(profile: VisitorProfile) {
    setVisitorProfile(profile);
    void saveVisitorProfile(visitorSessionId, profile).catch((error) => {
      console.warn('Unable to save visitor profile to Firebase.', error);
    });
    setScreen('home');
  }

  return (
    <main className="app-shell">
      <div
        className={`phone ${isMapScreen ? 'map-mode' : ''} ${
          screen === 'register' || screen === 'onboarding' ? 'register-mode' : ''
        }`}
      >
        {!isMapScreen && screen !== 'register' && screen !== 'onboarding' && (
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
            {screen === 'register' && <RegistrationPage onRegister={registerVisitor} />}
            {screen === 'onboarding' && <OnboardingPage onComplete={completeOnboarding} />}
            {screen === 'home' && (
              <HomePage
                visitorName={visitorName}
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
              <CollectionPage
                unlocked={unlocked}
                allChallenges={challenges}
                completionRecords={completionRecords}
              />
            )}
            {screen === 'challenge' && (
              <ChallengePage
                challenge={activeChallenge}
                completed={completed.includes(activeChallenge.id)}
                onComplete={(record) => completeChallenge(activeChallenge.id, record)}
                onAcceptedPhoto={(photoDataUrl) =>
                  saveAcceptedArtifactPhoto({
                    sessionId: visitorSessionId,
                    username: visitorName,
                    challenge: activeChallenge,
                    photoDataUrl,
                  })
                }
              />
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </main>
  );
}
