import { ChallengeAsset } from '../data/challenges';

export function AssetImage({
  asset,
  className = '',
}: {
  asset: ChallengeAsset;
  className?: string;
}) {
  if (asset.src) {
    return <img className={className} src={asset.src} alt={asset.alt} />;
  }

  return (
    <span className={`${className} asset-fallback`} aria-label={asset.alt} role="img">
      {asset.fallback}
    </span>
  );
}
