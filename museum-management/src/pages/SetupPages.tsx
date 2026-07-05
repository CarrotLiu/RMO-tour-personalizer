import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  ImagePlus,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import type { ArtifactEntry, AspectType, ExhibitionIntro } from '../types/models';
import { FloorPlanSvg } from '../components/MapArt';

const WORD_LIMIT = 30;

function countWords(text: string) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

function StepHeader({ step, title, text }: { step: number; title: string; text: string }) {
  return (
    <div>
      <p className="section-heading">Exhibition setup · step {step} of 4</p>
      <h3 className="mt-2 text-2xl font-black">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">{text}</p>
    </div>
  );
}

function StepFooter({
  onBack,
  onNext,
  nextLabel = 'Save and continue',
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
      {onBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-bold text-slate-600 transition hover:border-slate-400"
          type="button"
        >
          <ArrowLeft size={17} /> Back
        </button>
      ) : (
        <span />
      )}
      <button
        onClick={onNext}
        className="flex items-center gap-2 rounded-xl bg-museum px-5 py-2.5 font-black text-white transition hover:bg-slate-800"
        type="button"
      >
        {nextLabel} <ArrowRight size={17} />
      </button>
    </div>
  );
}

function IntroBlock({
  heading,
  nameLabel,
  name,
  intro,
  website,
  onName,
  onIntro,
  onWebsite,
}: {
  heading: string;
  nameLabel: string;
  name: string;
  intro: string;
  website: string;
  onName: (value: string) => void;
  onIntro: (value: string) => void;
  onWebsite: (value: string) => void;
}) {
  const words = countWords(intro);
  const over = words > WORD_LIMIT;

  return (
    <section className="card p-6">
      <p className="section-heading">{heading}</p>
      <div className="mt-4 grid gap-4">
        <label>
          <span className="field-label">{nameLabel}</span>
          <input className="input mt-1" value={name} onChange={(event) => onName(event.target.value)} />
        </label>
        <label>
          <div className="flex items-center justify-between">
            <span className="field-label">Introduction (max {WORD_LIMIT} words)</span>
            <span className={`text-xs font-bold ${over ? 'text-red-600' : 'text-slate-400'}`}>
              {words}/{WORD_LIMIT} words
            </span>
          </div>
          <textarea
            className={`input mt-1 min-h-24 ${over ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
            value={intro}
            onChange={(event) => onIntro(event.target.value)}
          />
          {over && (
            <p className="mt-1 text-xs font-bold text-red-600">
              Please shorten the introduction to {WORD_LIMIT} words. Visitors read it on a phone screen.
            </p>
          )}
        </label>
        <label>
          <span className="field-label">Website link</span>
          <div className="mt-1 flex items-center gap-2">
            <input className="input" value={website} onChange={(event) => onWebsite(event.target.value)} />
            <a
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold"
              href={website}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </label>
      </div>
    </section>
  );
}

export function IntroStep({
  intro,
  onChange,
  onNext,
}: {
  intro: ExhibitionIntro;
  onChange: (patch: Partial<ExhibitionIntro>) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <StepHeader
        step={1}
        title="Introduce the museum and the exhibition"
        text="These short texts open the visitor app. Keep each introduction within 30 words and add the website link visitors can tap for more."
      />
      <div className="grid gap-5 xl:grid-cols-2">
        <IntroBlock
          heading="Museum"
          nameLabel="Museum name"
          name={intro.museumName}
          intro={intro.museumIntro}
          website={intro.museumWebsite}
          onName={(value) => onChange({ museumName: value })}
          onIntro={(value) => onChange({ museumIntro: value })}
          onWebsite={(value) => onChange({ museumWebsite: value })}
        />
        <IntroBlock
          heading="Exhibition"
          nameLabel="Exhibition name"
          name={intro.exhibitionName}
          intro={intro.exhibitionIntro}
          website={intro.exhibitionWebsite}
          onName={(value) => onChange({ exhibitionName: value })}
          onIntro={(value) => onChange({ exhibitionIntro: value })}
          onWebsite={(value) => onChange({ exhibitionWebsite: value })}
        />
      </div>
      <StepFooter onNext={onNext} />
    </div>
  );
}

export function AspectsStep({
  aspects,
  onChange,
  onBack,
  onNext,
}: {
  aspects: AspectType[];
  onChange: (aspects: AspectType[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  function update(id: string, patch: Partial<AspectType>) {
    onChange(aspects.map((aspect) => (aspect.id === id ? { ...aspect, ...patch } : aspect)));
  }

  function remove(id: string) {
    onChange(aspects.filter((aspect) => aspect.id !== id));
  }

  function add() {
    onChange([
      ...aspects,
      {
        id: `aspect-${Date.now()}`,
        name: 'New aspect type',
        image: '',
        description: 'Describe what this aspect covers.',
      },
    ]);
  }

  return (
    <div className="space-y-6">
      <StepHeader
        step={2}
        title="Define aspect types for the exhibition"
        text="Aspect types are the thematic lenses visitors choose from. AI uses them to label every artifact, so name them the way your curators talk about the exhibition."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {aspects.map((aspect) => (
          <section key={aspect.id} className="card overflow-hidden">
            <div className="flex h-32 items-center justify-center bg-panel p-3">
              {aspect.image ? (
                <img src={aspect.image} alt={aspect.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="flex items-center gap-2 text-sm font-bold text-slate-400">
                  <ImagePlus size={17} /> Example photo
                </span>
              )}
            </div>
            <div className="space-y-3 p-4">
              <input
                className="input font-black"
                value={aspect.name}
                onChange={(event) => update(aspect.id, { name: event.target.value })}
              />
              <textarea
                className="input min-h-16 text-sm"
                value={aspect.description}
                onChange={(event) => update(aspect.id, { description: event.target.value })}
              />
              <button
                onClick={() => remove(aspect.id)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 transition hover:text-red-600"
                type="button"
              >
                <Trash2 size={14} /> Remove aspect
              </button>
            </div>
          </section>
        ))}
        <button
          onClick={add}
          className="card flex min-h-56 flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 bg-transparent text-slate-400 shadow-none transition hover:border-gold hover:text-gold"
          type="button"
        >
          <Plus size={26} />
          <span className="font-black">Add aspect type</span>
        </button>
      </div>
      <StepFooter onBack={onBack} onNext={onNext} />
    </div>
  );
}

const photoViews: Array<{ label: string; style: CSSProperties }> = [
  { label: 'Top', style: { transform: 'rotate(-90deg) scale(0.9)' } },
  { label: 'Front', style: {} },
  { label: 'Left side', style: { transform: 'scaleX(-1) rotate(3deg)' } },
  { label: 'Right side', style: { transform: 'rotate(-3deg)' } },
  { label: 'Back', style: { transform: 'scaleX(-1)', filter: 'brightness(0.9)' } },
];

export function DataSheetStep({
  artifacts,
  onChange,
  onBack,
  onNext,
}: {
  artifacts: ArtifactEntry[];
  onChange: (artifacts: ArtifactEntry[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  function update(id: string, patch: Partial<ArtifactEntry>) {
    onChange(artifacts.map((artifact) => (artifact.id === id ? { ...artifact, ...patch } : artifact)));
  }

  return (
    <div className="space-y-6">
      <StepHeader
        step={3}
        title="Provide the artifact data sheet"
        text="One row per artifact: name, label text, time, and five photos taken from the top, front, left side, right side, and back. AI reads the label text to label and build challenges."
      />

      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 text-gold">
            <FileSpreadsheet size={20} />
          </span>
          <div>
            <p className="font-black">archaeology_nl_datasheet.xlsx</p>
            <p className="text-xs font-bold text-emerald-600">
              Imported · {artifacts.length} artifacts · {artifacts.length * 5} photos matched
            </p>
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-gold">
          <UploadCloud size={16} /> Replace sheet
          <input type="file" className="hidden" />
        </label>
      </div>

      <div className="space-y-4">
        {artifacts.map((artifact, index) => (
          <section key={artifact.id} className="card p-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_460px]">
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
                  <label>
                    <span className="field-label">Artifact name</span>
                    <input
                      className="input mt-1 font-bold"
                      value={artifact.name}
                      onChange={(event) => update(artifact.id, { name: event.target.value })}
                    />
                  </label>
                  <label>
                    <span className="field-label">Artifact time</span>
                    <input
                      className="input mt-1"
                      value={artifact.time}
                      onChange={(event) => update(artifact.id, { time: event.target.value })}
                    />
                  </label>
                </div>
                <label>
                  <span className="field-label">Artifact label text</span>
                  <textarea
                    className="input mt-1 min-h-28 text-sm leading-6"
                    value={artifact.labelText}
                    onChange={(event) => update(artifact.id, { labelText: event.target.value })}
                  />
                </label>
              </div>
              <div>
                <span className="field-label">Photos · 5 views</span>
                <div className="mt-1 grid grid-cols-5 gap-2">
                  {photoViews.map((view) => (
                    <figure key={view.label} className="text-center">
                      <div className="flex h-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-panel p-1">
                        <img
                          src={artifact.photo}
                          alt={`${artifact.name} – ${view.label}`}
                          className="max-h-full max-w-full object-contain"
                          style={view.style}
                        />
                      </div>
                      <figcaption className="mt-1 text-[11px] font-bold text-slate-500">{view.label}</figcaption>
                    </figure>
                  ))}
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <CheckCircle2 size={14} /> Row {index + 1} complete
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>
      <StepFooter onBack={onBack} onNext={onNext} />
    </div>
  );
}

export function FloorPlanStep({
  onBack,
  onGenerate,
}: {
  onBack: () => void;
  onGenerate: () => void;
}) {
  return (
    <div className="space-y-6">
      <StepHeader
        step={4}
        title="Provide the exhibition floor plan"
        text="AI redraws the floor plan as the hand-drawn treasure map visitors explore. You will place each artifact on that map in the next step."
      />

      <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="card flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                <UploadCloud size={20} />
              </span>
              <div>
                <p className="font-black">RMO_level1_floorplan.pdf</p>
                <p className="text-xs font-bold text-emerald-600">Uploaded · converted to plan preview</p>
              </div>
            </div>
            <label className="cursor-pointer text-sm font-bold text-slate-500 underline-offset-2 hover:underline">
              Replace
              <input type="file" className="hidden" />
            </label>
          </div>
          <div className="card p-5 text-sm leading-6 text-slate-500">
            <p className="font-black text-slate-800">What happens next?</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>AI labels every artifact with your aspect types.</li>
              <li>AI writes six challenges per artifact: text and image, at three effort levels.</li>
              <li>AI sketches challenge scenes, options, and card covers in the field-journal style.</li>
              <li>AI redraws this floor plan as an empty treasure map for placing artifacts.</li>
            </ol>
          </div>
        </div>
        <section className="card overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-3">
            <p className="section-heading">Floor plan preview</p>
          </div>
          <FloorPlanSvg className="w-full" />
        </section>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-bold text-slate-600 transition hover:border-slate-400"
          type="button"
        >
          <ArrowLeft size={17} /> Back
        </button>
        <button
          onClick={onGenerate}
          className="flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-base font-black text-museum shadow-lg shadow-gold/30 transition hover:brightness-105"
          type="button"
        >
          <Sparkles size={19} /> Generate draft with AI
        </button>
      </div>
    </div>
  );
}

export function GeneratingPage({ onDone }: { onDone: () => void }) {
  const steps = useMemo(
    () => [
      'Reading the artifact data sheet',
      'Labelling artifacts with your aspect types',
      'Writing 6 challenges per artifact (text · image × low · medium · high)',
      'Sketching challenge scenes, options, and card covers',
      'Redrawing the floor plan as an empty treasure map',
    ],
    [],
  );
  const [done, setDone] = useState(0);

  useEffect(() => {
    const timers = steps.map((_, index) =>
      window.setTimeout(() => setDone(index + 1), 650 * (index + 1)),
    );
    timers.push(window.setTimeout(onDone, 650 * steps.length + 700));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-xl py-12">
      <div className="card p-8 text-center">
        <span className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gold/20 text-gold">
          <Sparkles size={30} />
        </span>
        <h3 className="mt-5 text-2xl font-black">AI is drafting your exhibition content</h3>
        <p className="mt-2 text-sm text-slate-500">
          Everything stays a draft until your team reviews and approves it.
        </p>
        <ul className="mt-7 space-y-3 text-left">
          {steps.map((step, index) => (
            <li key={step} className="flex items-center gap-3 text-sm font-bold">
              {index < done ? (
                <CheckCircle2 className="shrink-0 text-emerald-500" size={19} />
              ) : (
                <span
                  className={`h-[19px] w-[19px] shrink-0 rounded-full border-2 ${
                    index === done ? 'animate-spin border-gold border-t-transparent' : 'border-slate-200'
                  }`}
                />
              )}
              <span className={index < done ? 'text-slate-800' : 'text-slate-400'}>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
