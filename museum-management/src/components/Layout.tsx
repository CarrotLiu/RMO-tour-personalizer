import type { ReactNode } from 'react';
import {
  Bot,
  FileSpreadsheet,
  Landmark,
  Lock,
  Map,
  MapPin,
  Pencil,
  Shapes,
  Sparkles,
} from 'lucide-react';

export type SetupStepId = 'intro' | 'aspects' | 'datasheet' | 'floorplan';
export type DraftViewId = 'labels' | 'challenges' | 'map';
export type ViewId = SetupStepId | 'generating' | DraftViewId;

export const setupSteps: Array<{ id: SetupStepId; label: string; icon: typeof Landmark }> = [
  { id: 'intro', label: '1 · Introductions', icon: Landmark },
  { id: 'aspects', label: '2 · Aspect types', icon: Shapes },
  { id: 'datasheet', label: '3 · Artifact data sheet', icon: FileSpreadsheet },
  { id: 'floorplan', label: '4 · Floor plan', icon: Map },
];

const draftViews: Array<{ id: DraftViewId; label: string; icon: typeof Landmark }> = [
  { id: 'labels', label: 'Artifact labels', icon: Bot },
  { id: 'challenges', label: 'Challenges', icon: Pencil },
  { id: 'map', label: 'Map locations', icon: MapPin },
];

export function Layout({
  activeView,
  completedSteps,
  draftReady,
  onViewChange,
  children,
}: {
  activeView: ViewId;
  completedSteps: SetupStepId[];
  draftReady: boolean;
  onViewChange: (view: ViewId) => void;
  children: ReactNode;
}) {
  const navButton = (
    id: ViewId,
    label: string,
    Icon: typeof Landmark,
    opts: { locked?: boolean; done?: boolean } = {},
  ) => {
    const selected = id === activeView;
    return (
      <button
        key={id}
        onClick={() => !opts.locked && onViewChange(id)}
        className={`flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm font-bold transition ${
          selected
            ? 'bg-gold text-museum'
            : opts.locked
              ? 'cursor-not-allowed text-slate-500'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`}
        type="button"
      >
        <Icon size={18} />
        <span className="flex-1">{label}</span>
        {opts.locked && <Lock size={14} />}
        {opts.done && !selected && <span className="text-xs text-emerald-400">✓</span>}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col bg-museum px-5 py-6 text-white lg:flex">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">ArcheoQuest</p>
          <h1 className="mt-2 text-2xl font-black leading-tight">Museum Management</h1>
        </div>

        <p className="mb-2 px-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          Exhibition setup
        </p>
        <nav className="space-y-1.5">
          {setupSteps.map((step) =>
            navButton(step.id, step.label, step.icon, { done: completedSteps.includes(step.id) }),
          )}
        </nav>

        <p className="mb-2 mt-7 px-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          AI draft review
        </p>
        <nav className="space-y-1.5">
          {draftViews.map((view) => navButton(view.id, view.label, view.icon, { locked: !draftReady }))}
        </nav>

        <div className="mt-auto rounded-2xl bg-white/10 p-4 text-sm text-slate-300">
          <div className="flex items-center gap-2 text-gold">
            <Sparkles size={16} />
            <strong className="text-white">AI workspace</strong>
          </div>
          <p className="mt-1.5 leading-5">
            {draftReady
              ? 'Draft content generated. Review, edit, and place artifacts on the map.'
              : 'Complete the four setup pages, then let AI draft labels, challenges, and sketches.'}
          </p>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="section-heading">Rijksmuseum van Oudheden</p>
              <h2 className="mt-1 text-2xl font-black">The Archaeology of the Netherlands</h2>
            </div>
            <div className="rounded-full bg-museum px-4 py-2 text-sm font-bold text-white">
              Staff workspace
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
            {[...setupSteps, ...draftViews.map((v) => ({ ...v, locked: !draftReady }))].map((item) => (
              <button
                key={item.id}
                onClick={() => !('locked' in item && item.locked) && onViewChange(item.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${
                  item.id === activeView
                    ? 'bg-gold text-museum'
                    : 'locked' in item && item.locked
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-slate-100 text-slate-600'
                }`}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>
        <div className="px-5 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
