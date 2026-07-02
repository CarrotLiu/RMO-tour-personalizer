import { FirebaseApp, initializeApp } from 'firebase/app';
import { getFirestore, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadString } from 'firebase/storage';
import type { Challenge } from '../data/challenges';
import type { VisitorProfile } from '../pages/OnboardingPage';

type VisitorRecord = {
  sessionId: string;
  username: string;
};

let app: FirebaseApp | null = null;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function hasFirebaseConfig() {
  return Object.values(firebaseConfig).every(Boolean);
}

function getFirebaseApp() {
  if (!hasFirebaseConfig()) return null;
  app ??= initializeApp(firebaseConfig);
  return app;
}

function visitorDoc(sessionId: string) {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  return doc(getFirestore(firebaseApp), 'visitorSessions', sessionId);
}

export function isFirebaseReady() {
  return Boolean(getFirebaseApp());
}

export async function saveVisitorRegistration({ sessionId, username }: VisitorRecord) {
  const target = visitorDoc(sessionId);
  if (!target) return;

  await setDoc(
    target,
    {
      sessionId,
      username,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function saveVisitorProfile(sessionId: string, profile: VisitorProfile) {
  const target = visitorDoc(sessionId);
  if (!target) return;

  await setDoc(
    target,
    {
      profile,
      motivationTypes: profile.motivation,
      aspectTypes: profile.aspect ?? [],
      challengeFormatType: profile.challengeFormat,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function saveAcceptedArtifactPhoto({
  sessionId,
  username,
  challenge,
  photoDataUrl,
}: {
  sessionId: string;
  username: string;
  challenge: Challenge;
  photoDataUrl: string;
}) {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return;

  const storage = getStorage(firebaseApp);
  const safeChallengeId = challenge.id.replace(/[^a-z0-9-]/gi, '-');
  const takenAt = new Date().toISOString();
  const storagePath = `visitorSessions/${sessionId}/acceptedPhotos/${safeChallengeId}-${Date.now()}.jpg`;
  const photoRef = ref(storage, storagePath);

  await uploadString(photoRef, photoDataUrl, 'data_url', {
    contentType: 'image/jpeg',
    customMetadata: {
      sessionId,
      username,
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      takenAt,
    },
  });

  const downloadUrl = await getDownloadURL(photoRef);
  const target = doc(getFirestore(firebaseApp), 'visitorSessions', sessionId, 'acceptedPhotos', safeChallengeId);

  await setDoc(
    target,
    {
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      photoUrl: downloadUrl,
      storagePath,
      takenAt,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}
