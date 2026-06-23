import { Challenge, ChallengeCompletionRecord } from '../data/challenges';
import { JournalCard } from '../components/JournalCard';

export function CollectionPage({
  unlocked,
  allChallenges,
  completionRecords,
}: {
  unlocked: Challenge[];
  allChallenges: Challenge[];
  completionRecords: Record<string, ChallengeCompletionRecord>;
}) {
  return (
    <div className="collection page-scroll">
      <div className="collection-banner">
        <strong>{unlocked.length} pages completed</strong>
        <span>{allChallenges.length - unlocked.length} pages to unlock</span>
      </div>

      <div className="grid">
        {allChallenges.map((challenge) =>
          unlocked.some((item) => item.id === challenge.id) ? (
            <JournalCard
              key={challenge.id}
              challenge={challenge}
              completion={completionRecords[challenge.id]}
            />
          ) : (
            <div className="collection-lock" key={challenge.id}>
              🔒
            </div>
          ),
        )}
      </div>
    </div>
  );
}
