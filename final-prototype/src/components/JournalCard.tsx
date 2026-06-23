import { useMemo, useState } from 'react';
import { Challenge, ChallengeCompletionRecord } from '../data/challenges';
import { AssetImage } from './AssetImage';

function formatCompletedAt(timestamp?: string) {
  if (!timestamp) return 'Saved just now';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Saved just now';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function JournalCard({
  challenge,
  completion,
}: {
  challenge: Challenge;
  completion?: ChallengeCompletionRecord;
}) {
  const [flipped, setFlipped] = useState(false);
  const previewAsset = challenge.cardAssets?.solvedPreview ?? challenge.artifact;
  const completedAsset =
    challenge.cardAssets?.solvedChallenge ??
    challenge.capture?.journalNote ??
    challenge.cardAssets?.solvedPreview ??
    challenge.artifact;
  const completedAt = useMemo(
    () => formatCompletedAt(completion?.completedAt),
    [completion?.completedAt],
  );

  return (
    <button
      className={`journal-card journal-card-button ${flipped ? 'is-flipped' : ''}`}
      onClick={() => setFlipped((value) => !value)}
      type="button"
      aria-pressed={flipped}
      aria-label={`${challenge.title} completed journal card`}
    >
      <span className="journal-card-inner">
        <span className="journal-card-face journal-card-front">
          <AssetImage asset={previewAsset} className="journal-art" />
          <h3>{challenge.title}</h3>
        </span>

        <span className="journal-card-face journal-card-back">
          <AssetImage asset={completedAsset} className="journal-completed-art" />
          <span className="journal-proof">
            {completion?.photoDataUrl ? (
              <img
                className="journal-proof-photo"
                src={completion.photoDataUrl}
                alt={`Captured artifact for ${challenge.title}`}
              />
            ) : (
              <span className="journal-proof-placeholder">No photo saved</span>
            )}
            <span className="journal-proof-time">{completedAt}</span>
          </span>
        </span>
      </span>
    </button>
  );
}
