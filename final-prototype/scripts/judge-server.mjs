import http from 'node:http';

const port = Number(process.env.PORT || 8787);
const clients = new Map();
const pendingRequests = new Map();
const decisions = new Map();
const settings = new Map();

function send(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function addClient(session, res) {
  const list = clients.get(session) ?? new Set();
  list.add(res);
  clients.set(session, list);

  res.on('close', () => {
    list.delete(res);
    if (list.size === 0) clients.delete(session);
  });
}

function broadcast(session, event, data) {
  clients.get(session)?.forEach((res) => send(res, event, data));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (error) {
        reject(error);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname === '/events') {
    const session = url.searchParams.get('session') || 'field-journal';
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    send(res, 'ready', { session });
    addClient(session, res);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/request') {
    const body = await readJson(req);
    const session = body.session || 'field-journal';
    pendingRequests.set(session, {
      requestId: body.requestId,
      challengeId: body.challengeId,
      challengeTitle: body.challengeTitle,
    });
    broadcast(body.session || 'field-journal', 'request', {
      requestId: body.requestId,
      challengeId: body.challengeId,
      challengeTitle: body.challengeTitle,
    });
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname === '/pending') {
    const session = url.searchParams.get('session') || 'field-journal';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(pendingRequests.get(session) ?? null));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/settings') {
    const session = url.searchParams.get('session') || 'field-journal';
    const sessionSettings = settings.get(session);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        pictureCheckingEnabled: Boolean(sessionSettings?.pictureCheckingEnabled),
        updatedAt: sessionSettings?.updatedAt,
      }),
    );
    return;
  }

  if (req.method === 'POST' && url.pathname === '/settings') {
    const body = await readJson(req);
    const session = body.session || 'field-journal';
    settings.set(session, {
      pictureCheckingEnabled: Boolean(body.pictureCheckingEnabled),
      updatedAt: Number(body.updatedAt) || Date.now(),
    });
    broadcast(session, 'settings', settings.get(session));
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && url.pathname === '/decision') {
    const body = await readJson(req);
    const session = body.session || 'field-journal';
    pendingRequests.delete(session);
    decisions.set(body.requestId, {
      decision: body.decision,
      hint: body.hint,
    });
    broadcast(session, 'decision', {
      requestId: body.requestId,
      decision: body.decision,
      hint: body.hint,
    });
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname === '/decision') {
    const requestId = url.searchParams.get('requestId');
    const result = requestId ? decisions.get(requestId) : null;

    if (requestId && result) {
      decisions.delete(requestId);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result ? { requestId, ...result } : null));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Judge relay listening on http://0.0.0.0:${port}`);
});
