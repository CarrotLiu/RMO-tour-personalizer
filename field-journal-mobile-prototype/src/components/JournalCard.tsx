import { Challenge } from '../data/challenges';
import { AssetImage } from './AssetImage';

export function JournalCard({ challenge }: { challenge: Challenge }) {
  return (
    <article className="journal-card">
      <AssetImage asset={challenge.artifact} className="journal-art" />
      <h3>{challenge.cardTitle}</h3>
      <p>{challenge.title}</p>
    </article>
  );
}
