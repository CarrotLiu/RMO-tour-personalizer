import { Challenge } from '../data/challenges';
import { AssetImage } from './AssetImage';

export function JournalCard({ challenge }: { challenge: Challenge }) {
  const previewAsset = challenge.cardAssets?.solvedPreview ?? challenge.artifact;

  return (
    <article className="journal-card">
      <AssetImage asset={previewAsset} className="journal-art" />
      <h3>{challenge.title}</h3>
    </article>
  );
}
