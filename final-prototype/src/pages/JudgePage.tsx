import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import {
  createRecognitionChannel,
  DirectionHint,
  getChallengeMapUnlocked,
  getPictureCheckingEnabled,
  getJudgeServer,
  getJudgeSession,
  RecognitionRequest,
  sendRecognitionDecision,
  setChallengeMapUnlocked,
  setPictureCheckingEnabled,
} from '../app/recognitionRelay';

export function JudgePage() {
  const [request, setRequest] = useState<RecognitionRequest | null>(null);
  const [lastDecision, setLastDecision] = useState<string | null>(null);
  const [checkingEnabled, setCheckingEnabled] = useState(false);
  const [mapUnlocked, setMapUnlocked] = useState(false);
  const server = getJudgeServer();
  const session = getJudgeSession();

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      const [enabled, unlocked] = await Promise.all([getPictureCheckingEnabled(), getChallengeMapUnlocked()]);
      if (!cancelled) {
        setCheckingEnabled(enabled);
        setMapUnlocked(unlocked);
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [server, session]);

  useEffect(() => {
    if (server) {
      const timer = window.setInterval(async () => {
        const response = await fetch(
          `${server}/pending?session=${encodeURIComponent(session)}`,
          { cache: 'no-store' },
        );
        const data = (await response.json()) as RecognitionRequest | null;

        if (data?.requestId) {
          setRequest(data);
          setLastDecision(null);
        }
      }, 900);

      return () => window.clearInterval(timer);
    }

    const channel = createRecognitionChannel();
    channel.addEventListener('message', (event) => {
      const data = event.data as Record<string, unknown>;

      if (data.type === 'request' && data.session === session) {
        setRequest({
          requestId: String(data.requestId),
          challengeId: String(data.challengeId),
          challengeTitle: String(data.challengeTitle),
        });
        setLastDecision(null);
      }
    });

    return () => channel.close();
  }, [server, session]);

  async function updateCheckingEnabled(enabled: boolean) {
    setCheckingEnabled(enabled);
    await setPictureCheckingEnabled(enabled);
    setLastDecision(enabled ? 'Picture checking enabled' : 'Picture checking disabled');
  }

  async function updateMapUnlocked(unlocked: boolean) {
    setMapUnlocked(unlocked);
    await setChallengeMapUnlocked(unlocked);
    setLastDecision(unlocked ? 'Challenge map unlocked' : 'Challenge map locked');
  }

  async function markCorrect() {
    if (!request) return;

    await sendRecognitionDecision(request, { decision: 'correct' });
    setLastDecision('Marked correct');
    setRequest(null);
  }

  async function sendWrongHint(hint: DirectionHint) {
    if (!request) return;

    await sendRecognitionDecision(request, { decision: 'wrong', hint });
    setLastDecision(hintCopy[hint]);
    setRequest(null);
  }

  return (
    <main className="judge-shell">
      <section className="judge-panel">
        <p className="judge-kicker">Artifact recognition control</p>
        <h1>{request ? request.challengeTitle : 'Waiting for photo submit'}</h1>
        <p className="judge-session">Session: {session}</p>

        <label className="judge-toggle">
          <input
            type="checkbox"
            checked={mapUnlocked}
            onChange={(event) => updateMapUnlocked(event.currentTarget.checked)}
          />
          <span>
            <strong>Challenge map</strong>
            <em>{mapUnlocked ? 'Unlocked for visitors' : 'Locked until museum arrival'}</em>
          </span>
        </label>

        <label className="judge-toggle">
          <input
            type="checkbox"
            checked={checkingEnabled}
            onChange={(event) => updateCheckingEnabled(event.currentTarget.checked)}
          />
          <span>
            <strong>Picture checking</strong>
            <em>{checkingEnabled ? 'Enabled' : 'Disabled by default'}</em>
          </span>
        </label>

        {request && checkingEnabled ? (
          <div className="judge-actions">
            <button className="judge-button correct" onClick={markCorrect} type="button">
              <Check size={28} />
              Correct
            </button>
            <button className="judge-button wrong" onClick={() => sendWrongHint('forward')} type="button">
              <X size={28} />
              Look forward!
              <span>It's in front of you</span>
            </button>
            <button className="judge-button wrong" onClick={() => sendWrongHint('backward')} type="button">
              <X size={28} />
              Look backward!
              <span>It's behind you</span>
            </button>
            <button className="judge-button wrong" onClick={() => sendWrongHint('left')} type="button">
              <X size={28} />
              Look left!
              <span>It's on your left</span>
            </button>
            <button className="judge-button wrong" onClick={() => sendWrongHint('right')} type="button">
              <X size={28} />
              Look right!
              <span>It's on your right</span>
            </button>
          </div>
        ) : (
          <p className="judge-waiting">
            {lastDecision ??
              (checkingEnabled
                ? 'Submit a captured photo on the visitor app.'
                : 'Visitor photo submits will continue automatically.')}
          </p>
        )}
      </section>
    </main>
  );
}

const hintCopy: Record<DirectionHint, string> = {
  forward: "Look forward! It's in front of you",
  backward: "Look backward! It's behind you",
  left: "Look left! It's on your left",
  right: "Look right! It's on your right",
};
