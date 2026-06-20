import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import {
  createRecognitionChannel,
  getJudgeServer,
  getJudgeSession,
  RecognitionDecision,
  RecognitionRequest,
  sendRecognitionDecision,
} from '../app/recognitionRelay';

export function JudgePage() {
  const [request, setRequest] = useState<RecognitionRequest | null>(null);
  const [lastDecision, setLastDecision] = useState<string | null>(null);
  const server = getJudgeServer();
  const session = getJudgeSession();

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

  async function decide(decision: RecognitionDecision) {
    if (!request) return;

    await sendRecognitionDecision(request, decision);
    setLastDecision(decision === 'correct' ? 'Marked correct' : 'Marked wrong');
    setRequest(null);
  }

  return (
    <main className="judge-shell">
      <section className="judge-panel">
        <p className="judge-kicker">Artifact recognition control</p>
        <h1>{request ? request.challengeTitle : 'Waiting for photo submit'}</h1>
        <p className="judge-session">Session: {session}</p>

        {request ? (
          <div className="judge-actions">
            <button className="judge-button correct" onClick={() => decide('correct')} type="button">
              <Check size={28} />
              Correct
            </button>
            <button className="judge-button wrong" onClick={() => decide('wrong')} type="button">
              <X size={28} />
              Wrong
            </button>
          </div>
        ) : (
          <p className="judge-waiting">{lastDecision ?? 'Submit a captured photo on the visitor app.'}</p>
        )}
      </section>
    </main>
  );
}
