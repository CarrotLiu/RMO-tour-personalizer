import { ChevronLeft, Lock } from 'lucide-react';

export function LockedChallengePage({ onBack }: { onBack: () => void }) {
  return (
    <div className="locked-challenge-page">
      <div className="locked-challenge-content">
        <p>Your personalized challenge will be waiting when you arrive at the museum.</p>
        <div className="locked-challenge-icon" aria-hidden="true">
          <Lock size={54} strokeWidth={1.8} />
        </div>
      </div>

      <nav className="map-bottom-nav" aria-label="Locked challenge controls">
        <button className="map-nav-button" onClick={onBack} type="button" aria-label="Back to home">
          <ChevronLeft size={22} />
        </button>
      </nav>
    </div>
  );
}
