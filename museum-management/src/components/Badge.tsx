import type { ReactNode } from 'react';

const toneMap = {
  gold: 'bg-gold/15 text-amber-800',
  green: 'bg-emerald-100 text-emerald-800',
  blue: 'bg-blue-100 text-blue-800',
  slate: 'bg-slate-100 text-slate-700',
  red: 'bg-red-100 text-red-800',
};

export function Badge({
  children,
  tone = 'slate',
}: {
  children: ReactNode;
  tone?: keyof typeof toneMap;
}) {
  return <span className={`pill ${toneMap[tone]}`}>{children}</span>;
}
