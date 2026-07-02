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
const CHECKING_SETTING_TTL_MS = 30 * 60 * 1000;
const SETTINGS_TIMEOUT_MS = 1200;

type PictureCheckingSetting = {
  pictureCheckingEnabled?: boolean;
  updatedAt?: number;
};

type ChallengeUnlockSetting = {
  challengeMapUnlocked?: boolean;
  challengeMapUpdatedAt?: number;
};

type ControlSettings = PictureCheckingSetting & ChallengeUnlockSetting;

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
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), SETTINGS_TIMEOUT_MS);

    try {
      const response = await fetch(`${server}/settings?session=${encodeURIComponent(session)}`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      const data = (await response.json()) as PictureCheckingSetting;
      return isFreshEnabledSetting(data);
    } catch {
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  return isFreshEnabledSetting(readLocalCheckingSetting(session));
}

export async function getChallengeMapUnlocked(): Promise<boolean> {
  const server = getJudgeServer();
  const session = getJudgeSession();

  if (server) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), SETTINGS_TIMEOUT_MS);

    try {
      const response = await fetch(`${server}/settings?session=${encodeURIComponent(session)}`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      const data = (await response.json()) as ChallengeUnlockSetting;
      return Boolean(data.challengeMapUnlocked);
    } catch {
      return readLocalChallengeUnlockSetting(session);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  return readLocalChallengeUnlockSetting(session);
}

export async function setPictureCheckingEnabled(enabled: boolean) {
  const server = getJudgeServer();
  const session = getJudgeSession();
  const setting: PictureCheckingSetting = {
    pictureCheckingEnabled: enabled,
    updatedAt: Date.now(),
  };

  localStorage.setItem(`pictureCheckingEnabled:${session}`, JSON.stringify(setting));

  if (server) {
    await fetch(`${server}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session, ...setting }),
    });
    return;
  }

  const channel = createRecognitionChannel();
  channel.postMessage({ type: 'settings', session, ...setting });
  channel.close();
}

export async function setChallengeMapUnlocked(unlocked: boolean) {
  const server = getJudgeServer();
  const session = getJudgeSession();
  const setting: ChallengeUnlockSetting = {
    challengeMapUnlocked: unlocked,
    challengeMapUpdatedAt: Date.now(),
  };

  localStorage.setItem(`challengeMapUnlocked:${session}`, JSON.stringify(setting));

  if (server) {
    await fetch(`${server}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session, ...setting }),
    });
    return;
  }

  const channel = createRecognitionChannel();
  channel.postMessage({ type: 'settings', session, ...setting });
  channel.close();
}

export function subscribeToControlSettings(onSettings: (settings: ControlSettings) => void) {
  const server = getJudgeServer();
  const session = getJudgeSession();

  if (server) {
    const events = new EventSource(`${server}/events?session=${encodeURIComponent(session)}`);

    events.addEventListener('settings', (event) => {
      onSettings(JSON.parse((event as MessageEvent).data) as ControlSettings);
    });

    return () => events.close();
  }

  const channel = createRecognitionChannel();

  channel.addEventListener('message', (event) => {
    const data = event.data as ControlSettings & { type?: string; session?: string };
    if (data.type === 'settings' && data.session === session) {
      onSettings(data);
    }
  });

  return () => channel.close();
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

function isFreshEnabledSetting(setting: PictureCheckingSetting | null) {
  if (!setting?.pictureCheckingEnabled || !setting.updatedAt) return false;
  return Date.now() - setting.updatedAt < CHECKING_SETTING_TTL_MS;
}

function readLocalCheckingSetting(session: string): PictureCheckingSetting | null {
  const raw = localStorage.getItem(`pictureCheckingEnabled:${session}`);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PictureCheckingSetting;
  } catch {
    return null;
  }
}

function readLocalChallengeUnlockSetting(session: string) {
  const raw = localStorage.getItem(`challengeMapUnlocked:${session}`);
  if (!raw) return false;

  try {
    return Boolean((JSON.parse(raw) as ChallengeUnlockSetting).challengeMapUnlocked);
  } catch {
    return false;
  }
}
