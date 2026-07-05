import { RefreshCw, Sparkles } from 'lucide-react';
import type {
  ArtifactAiLabel,
  ArtifactEntry,
  AspectType,
  DraftChallenge,
} from '../types/models';
import { effortOrder, formatOrder } from '../data/exhibition';
import { Badge } from '../components/Badge';

const effortTone = { low: 'green', medium: 'gold', high: 'red' } as const;

export function DraftLabelsPage({
  artifacts,
  aspects,
  labels,
  onUpdateLabel,
}: {
  artifacts: ArtifactEntry[];
  aspects: AspectType[];
  labels: Record<string, ArtifactAiLabel>;
  onUpdateLabel: (artifactId: string, patch: Partial<ArtifactAiLabel>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="section-heading">AI draft · artifact labels</p>
        <h3 className="mt-2 text-2xl font-black">Review how AI labelled each artifact</h3>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          AI read every label text and assigned aspect types, a highlight, and sketch card covers.
          Toggle aspects on or off and rewrite the highlight where the AI missed the point.
        </p>
      </div>

      {artifacts.map((artifact) => {
        const label = labels[artifact.id];
        if (!label) return null;
        return (
          <section key={artifact.id} className="card p-5">
            <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
              <div>
                <div className="flex items-start gap-3">
                  <img
                    src={artifact.photo}
                    alt={artifact.name}
                    className="h-16 w-16 rounded-xl border border-slate-200 bg-panel object-contain p-1"
                  />
                  <div>
                    <h4 className="font-black leading-tight">{artifact.name}</h4>
                    <p className="text-sm text-slate-500">{artifact.time}</p>
                  </div>
                </div>
                <p className="field-label mt-4">AI card covers · field-journal sketch</p>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <figure>
                    <div className="sketch-panel flex h-32 items-center justify-center p-2">
                      <img src={artifact.covers.unsolved} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                    <figcaption className="mt-1 text-center text-[11px] font-bold text-slate-500">
                      Unsolved cover
                    </figcaption>
                  </figure>
                  <figure>
                    <div className="sketch-panel flex h-32 items-center justify-center p-2">
                      <img src={artifact.covers.solved} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                    <figcaption className="mt-1 text-center text-[11px] font-bold text-slate-500">
                      Solved cover
                    </figcaption>
                  </figure>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="field-label">Aspect labels · tap to toggle</span>
                    <span className="text-xs font-bold text-slate-400">
                      AI confidence {(label.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {aspects.map((aspect) => {
                      const active = label.aspects.includes(aspect.name);
                      return (
                        <button
                          key={aspect.id}
                          onClick={() =>
                            onUpdateLabel(artifact.id, {
                              aspects: active
                                ? label.aspects.filter((name) => name !== aspect.name)
                                : [...label.aspects, aspect.name],
                            })
                          }
                          className={`pill border transition ${
                            active
                              ? 'border-gold bg-gold/15 text-yellow-800'
                              : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                          }`}
                          type="button"
                        >
                          {aspect.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <label className="block">
                  <span className="field-label">Highlight · the hook AI builds challenges around</span>
                  <input
                    className="input mt-1"
                    value={label.highlight}
                    onChange={(event) => onUpdateLabel(artifact.id, { highlight: event.target.value })}
                  />
                </label>
                <div className="rounded-xl bg-slate-100 px-4 py-3 text-xs leading-5 text-slate-500">
                  <span className="flex items-center gap-1.5 font-black text-slate-600">
                    <Sparkles size={13} className="text-gold" /> Why AI chose these labels
                  </span>
                  {label.evidence}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function DraftChallengesPage({
  artifacts,
  challenges,
  selectedArtifactId,
  onSelectArtifact,
  onUpdateChallenge,
}: {
  artifacts: ArtifactEntry[];
  challenges: DraftChallenge[];
  selectedArtifactId: string;
  onSelectArtifact: (id: string) => void;
  onUpdateChallenge: (id: string, patch: Partial<DraftChallenge>) => void;
}) {
  const selected = artifacts.find((artifact) => artifact.id === selectedArtifactId) ?? artifacts[0];
  const artifactChallenges = challenges.filter((challenge) => challenge.artifactId === selected.id);

  return (
    <div className="space-y-5">
      <div>
        <p className="section-heading">AI draft · challenges</p>
        <h3 className="mt-2 text-2xl font-black">Edit the six challenges per artifact</h3>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          AI drafted a text and an image challenge at three effort levels. Sketches for scenes,
          options, and covers were generated in the style of the current challenges.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {artifacts.map((artifact) => (
          <button
            key={artifact.id}
            onClick={() => onSelectArtifact(artifact.id)}
            className={`flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-bold transition ${
              artifact.id === selected.id
                ? 'border-gold bg-gold/15 text-slate-900'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
            }`}
            type="button"
          >
            <img src={artifact.covers.unsolved} alt="" className="h-7 w-7 object-contain" />
            {artifact.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {formatOrder.flatMap((format) =>
          effortOrder.map((effort) => {
            const challenge = artifactChallenges.find(
              (item) => item.format === format && item.effort === effort,
            );
            if (!challenge) return null;
            return (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onUpdate={(patch) => onUpdateChallenge(challenge.id, patch)}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}

function ChallengeCard({
  challenge,
  onUpdate,
}: {
  challenge: DraftChallenge;
  onUpdate: (patch: Partial<DraftChallenge>) => void;
}) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge tone={challenge.format === 'image' ? 'blue' : 'slate'}>{challenge.format} challenge</Badge>
          <Badge tone={effortTone[challenge.effort]}>{challenge.effort} effort</Badge>
        </div>
        <select
          className="input max-w-36 py-1.5 text-xs font-bold"
          value={challenge.status}
          onChange={(event) => onUpdate({ status: event.target.value as DraftChallenge['status'] })}
        >
          <option value="draft">AI draft</option>
          <option value="edited">Edited</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {challenge.sketch && (
        <div className="sketch-panel mb-4 flex h-44 items-center justify-center p-2">
          <img src={challenge.sketch} alt="Generated challenge sketch" className="max-h-full max-w-full object-contain" />
        </div>
      )}

      <label className="block">
        <span className="field-label">Prompt</span>
        <textarea
          className="input mt-1 min-h-16 text-sm"
          value={challenge.prompt}
          onChange={(event) => onUpdate({ prompt: event.target.value })}
        />
      </label>

      <div className="mt-3">
        <span className="field-label">Options</span>
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {challenge.options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 ${
                option.label === challenge.correctAnswer
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {option.image && (
                <img src={option.image} alt="" className="h-9 w-9 rounded-lg bg-panel object-contain p-0.5" />
              )}
              <input
                className="w-full bg-transparent text-sm font-semibold outline-none"
                value={option.label}
                onChange={(event) =>
                  onUpdate({
                    options: challenge.options.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, label: event.target.value } : item,
                    ),
                    correctAnswer:
                      option.label === challenge.correctAnswer ? event.target.value : challenge.correctAnswer,
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label>
          <span className="field-label">Correct answer</span>
          <select
            className="input mt-1 text-sm"
            value={challenge.correctAnswer}
            onChange={(event) => onUpdate({ correctAnswer: event.target.value })}
          >
            {!challenge.options.some((option) => option.label === challenge.correctAnswer) && (
              <option value={challenge.correctAnswer}>{challenge.correctAnswer}</option>
            )}
            {challenge.options.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Explanation shown after solving</span>
          <textarea
            className="input mt-1 min-h-10 text-sm"
            value={challenge.explanation}
            onChange={(event) => onUpdate({ explanation: event.target.value })}
          />
        </label>
      </div>

      <button
        className="mt-4 flex items-center gap-1.5 text-xs font-bold text-slate-400 transition hover:text-gold"
        type="button"
      >
        <RefreshCw size={13} /> Ask AI to regenerate this challenge
      </button>
    </section>
  );
}
