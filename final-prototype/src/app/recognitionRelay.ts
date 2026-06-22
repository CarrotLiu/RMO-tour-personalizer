export type RecognitionDecision = 'correct' | 'wrong';

export type DirectionHint = 'forward' | 'backward' | 'left' | 'right';

export type RecognitionResult = {
  decision: RecognitionDecision;
  hint?: DirectionHint;
};

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

export async function getPictureCheckingEnabled(): Promise<boolean> {
  const server = getJudgeServer();
  const session = getJudgeSession();

  if (server) {
    const response = await fetch(`${server}/settings?session=${encodeURIComponent(session)}`, {
      cache: 'no-store',
    });
    const data = (await response.json()) as { pictureCheckingEnabled?: boolean };
    return Boolean(data.pictureCheckingEnabled);
  }

  return localStorage.getItem(`pictureCheckingEnabled:${session}`) === 'true';
}

export async function setPictureCheckingEnabled(enabled: boolean) {
  const server = getJudgeServer();
  const session = getJudgeSession();

  localStorage.setItem(`pictureCheckingEnabled:${session}`, String(enabled));

  if (server) {
    await fetch(`${server}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session, pictureCheckingEnabled: enabled }),
    });
    return;
  }

  const channel = createRecognitionChannel();
  channel.postMessage({ type: 'settings', session, pictureCheckingEnabled: enabled });
  channel.close();
}

export async function requestRecognitionDecision(
  challengeId: string,
  challengeTitle: string,
): Promise<RecognitionResult> {
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
): Promise<RecognitionResult> {
  await fetch(`${server}/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session, ...request }),
  });

  return pollForDecision(server, request.requestId);
}

async function pollForDecision(server: string, requestId: string): Promise<RecognitionResult> {
  while (true) {
    const response = await fetch(
      `${server}/decision?requestId=${encodeURIComponent(requestId)}`,
      { cache: 'no-store' },
    );
    const data = (await response.json()) as null | {
      decision?: RecognitionDecision;
      hint?: DirectionHint;
    };

    if (data?.decision === 'correct' || data?.decision === 'wrong') {
      return { decision: data.decision, hint: data.hint };
    }

    await new Promise((resolve) => window.setTimeout(resolve, 900));
  }
}

function requestBroadcastDecision(
  session: string,
  request: RecognitionRequest,
): Promise<RecognitionResult> {
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
        resolve({
          decision: data.decision,
          hint: isDirectionHint(data.hint) ? data.hint : undefined,
        });
      }
    });

    channel.postMessage({ type: 'request', session, ...request });
  });
}

export async function sendRecognitionDecision(
  request: RecognitionRequest,
  result: RecognitionResult,
) {
  const server = getJudgeServer();
  const session = getJudgeSession();

  if (server) {
    await fetch(`${server}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session, requestId: request.requestId, ...result }),
    });
    return;
  }

  const channel = createRecognitionChannel();
  channel.postMessage({ type: 'decision', session, requestId: request.requestId, ...result });
  channel.close();
}

function isDirectionHint(value: unknown): value is DirectionHint {
  return value === 'forward' || value === 'backward' || value === 'left' || value === 'right';
}
