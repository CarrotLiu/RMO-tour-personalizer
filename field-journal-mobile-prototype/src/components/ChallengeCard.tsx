import { LockKeyhole, Sparkles } from 'lucide-react';
import { Challenge } from '../data/challenges';
import { AssetImage } from './AssetImage';

export function ChallengeCard({
  challenge,
  completed,
  onClick,
}: {
  challenge: Challenge;
  completed: boolean;
  onClick: () => void;
}) {
  return (
    <button className={`challenge-card ${completed ? 'completed' : ''}`} onClick={onClick} type="button">
      <AssetImage asset={challenge.artifact} className="challenge-art" />
      <strong>{challenge.cardTitle}</strong>
      <span>{challenge.title}</span>
      <em>
        {completed ? <Sparkles size={14} /> : <LockKeyhole size={14} />}
        {completed ? 'Journal page saved' : 'Unsolved'}
      </em>
    </button>
  );
}
