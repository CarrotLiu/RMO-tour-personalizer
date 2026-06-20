export type RecognitionDecision = 'correct' | 'wrong';

export type RecognitionRequest = {
  requestId: string;
  challengeId: string;
  challengeTitle: string;
};

const CHANNEL_NAME = 'field-journal-recognition';
const DEFAULT_SESSION = 'field-journal';

function getSearchParams() {
  return new URLSearchParams(window.location.search);
}

export function getJudgeSession() {
  return getSearchParams().get('session') || localStorage.getItem('judgeSession') || DEFAULT_SESSION;
}

export function getJudgeServer() {
  const fromQuery = getSearchParams().get('judgeServer');
  if (fromQuery) {
    localStorage.setItem('judgeServer', fromQuery);
    return fromQuery.replace(/\/$/, '');
  }

  return localStorage.getItem('judgeServer')?.replace(/\/$/, '') ?? null;
}

export function createRecognitionChannel() {
  return new BroadcastChannel(CHANNEL_NAME);
}

export async function requestRecognitionDecision(
  challengeId: string,
  challengeTitle: string,
): Promise<RecognitionDecision> {
  const requestId = `${challengeId}-${Date.now()}`;
  const request: RecognitionRequest = { requestId, challengeId, challengeTitle };
  const server = getJudgeServer();
  const session = getJudgeSession();

  if (server) {
    return requestServerDecision(server, session, request);
  }

  return requestBroadcastDecision(session, request);
}

async function requestServerDecision(
  server: string,
  session: string,
  request: RecognitionRequest,
): Promise<RecognitionDecision> {
  await fetch(`${server}/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session, ...request }),
  });

  return pollForDecision(server, request.requestId);
}

async function pollForDecision(server: string, requestId: string): Promise<RecognitionDecision> {
  while (true) {
    const response = await fetch(
      `${server}/decision?requestId=${encodeURIComponent(requestId)}`,
      { cache: 'no-store' },
    );
    const data = (await response.json()) as null | {
      decision?: RecognitionDecision;
    };

    if (data?.decision === 'correct' || data?.decision === 'wrong') {
      return data.decision;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 900));
  }
}

function requestBroadcastDecision(
  session: string,
  request: RecognitionRequest,
): Promise<RecognitionDecision> {
  const channel = createRecognitionChannel();

  return new Promise((resolve) => {
    channel.addEventListener('message', (event) => {
      const data = event.data as Record<string, unknown>;

      if (
        data.type === 'decision' &&
        data.session === session &&
        data.requestId === request.requestId &&
        (data.decision === 'correct' || data.decision === 'wrong')
      ) {
        channel.close();
        resolve(data.decision);
      }
    });

    channel.postMessage({ type: 'request', session, ...request });
  });
}

export async function sendRecognitionDecision(
  request: RecognitionRequest,
  decision: RecognitionDecision,
) {
  const server = getJudgeServer();
  const session = getJudgeSession();

  if (server) {
    await fetch(`${server}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session, requestId: request.requestId, decision }),
    });
    return;
  }

  const channel = createRecognitionChannel();
  channel.postMessage({ type: 'decision', session, requestId: request.requestId, decision });
  channel.close();
}
