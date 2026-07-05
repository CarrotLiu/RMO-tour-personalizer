import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { CheckCircle2, GripVertical, MapPin, X } from 'lucide-react';
import type { ArtifactEntry, MapPosition } from '../types/models';
import { EmptyMapSvg } from '../components/MapArt';

export function DraftMapPage({
  artifacts,
  positions,
  onPlace,
  onRemove,
}: {
  artifacts: ArtifactEntry[];
  positions: Record<string, MapPosition>;
  onPlace: (artifactId: string, position: MapPosition) => void;
  onRemove: (artifactId: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [saved, setSaved] = useState(false);

  const unplaced = artifacts.filter((artifact) => !positions[artifact.id]);
  const placedCount = artifacts.length - unplaced.length;

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    const artifactId = event.dataTransfer.getData('text/artifact-id');
    const rect = mapRef.current?.getBoundingClientRect();
    if (!artifactId || !rect) return;
    const x = Math.min(96, Math.max(4, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(94, Math.max(4, ((event.clientY - rect.top) / rect.height) * 100));
    onPlace(artifactId, { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
    setSaved(false);
  }

  function startDrag(event: DragEvent, artifactId: string) {
    event.dataTransfer.setData('text/artifact-id', artifactId);
    event.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="section-heading">AI draft · map locations</p>
        <h3 className="mt-2 text-2xl font-black">Place each artifact on the treasure map</h3>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          AI redrew your floor plan as the empty map below. Drag each artifact dot to the spot where
          it stands in the gallery. Drag a placed dot again to correct it.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-4">
          <section className="card p-4">
            <p className="section-heading">Artifacts to place</p>
            {unplaced.length === 0 ? (
              <p className="mt-3 flex items-center gap-2 text-sm font-bold text-emerald-600">
                <CheckCircle2 size={17} /> All artifacts are on the map.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {unplaced.map((artifact) => (
                  <li
                    key={artifact.id}
                    draggable
                    onDragStart={(event) => startDrag(event, artifact.id)}
                    className="flex cursor-grab items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-gold active:cursor-grabbing"
                  >
                    <GripVertical size={15} className="text-slate-300" />
                    <span className="h-3 w-3 shrink-0 rounded-full border-2 border-[#5a4a2f] bg-gold" />
                    {artifact.name}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-4">
            <p className="section-heading">Registered locations</p>
            <ul className="mt-3 space-y-1.5">
              {artifacts
                .filter((artifact) => positions[artifact.id])
                .map((artifact) => {
                  const position = positions[artifact.id];
                  return (
                    <li key={artifact.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <MapPin size={14} className="text-gold" /> {artifact.name}
                      </span>
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        {position.x.toFixed(0)}, {position.y.toFixed(0)}
                        <button
                          onClick={() => {
                            onRemove(artifact.id);
                            setSaved(false);
                          }}
                          className="text-slate-300 transition hover:text-red-500"
                          type="button"
                          aria-label={`Remove ${artifact.name} from map`}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    </li>
                  );
                })}
              {placedCount === 0 && <li className="text-sm text-slate-400">Nothing placed yet.</li>}
            </ul>
          </section>

          <button
            onClick={() => setSaved(true)}
            disabled={placedCount < artifacts.length}
            className="w-full rounded-xl bg-museum px-5 py-3 font-black text-white transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            type="button"
          >
            {saved
              ? 'Locations saved ✓'
              : `Save locations (${placedCount}/${artifacts.length} placed)`}
          </button>
        </div>

        <section
          className={`card relative overflow-hidden transition ${dragOver ? 'ring-4 ring-gold/40' : ''}`}
        >
          <div
            ref={mapRef}
            className="relative"
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <EmptyMapSvg className="w-full" />
            {artifacts.map((artifact) => {
              const position = positions[artifact.id];
              if (!position) return null;
              return (
                <div
                  key={artifact.id}
                  draggable
                  onDragStart={(event) => startDrag(event, artifact.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                >
                  <span className="mx-auto block h-4 w-4 rounded-full border-[3px] border-[#5a4a2f] bg-gold shadow-md" />
                  <span className="mt-1 block whitespace-nowrap rounded-full border border-[#5a4a2f]/30 bg-[#fdf8ec]/95 px-2 py-0.5 text-[11px] font-black text-[#5a4a2f] shadow-sm">
                    {artifact.name}
                  </span>
                </div>
              );
            })}
            {dragOver && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gold/10 text-sm font-black text-[#5a4a2f]">
                Drop to register the location
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
