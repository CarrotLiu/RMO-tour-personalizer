import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Check, Sparkles, X } from 'lucide-react';
import { Challenge, ChallengeCompletionRecord } from '../data/challenges';
import { AssetImage } from '../components/AssetImage';
import { BronzeAgeGapChallenge } from '../components/BronzeAgeGapChallenge';
import { DraggableOption } from '../components/DraggableOption';
import { StoneTombGapChallenge } from '../components/StoneTombGapChallenge';
import { TextGapChallenge } from '../components/TextGapChallenge';
import {
  DirectionHint,
  getPictureCheckingEnabled,
  requestRecognitionDecision,
} from '../app/recognitionRelay';

type ChallengePhase = 'capture' | 'review' | 'recognizing' | 'challenge' | 'done';
type FeedbackStatus = 'idle' | 'correct' | 'wrong' | 'done';

export function ChallengePage({
  challenge,
  completed,
  onComplete,
  onAcceptedPhoto,
}: {
  challenge: Challenge;
  completed: boolean;
  onComplete: (record: ChallengeCompletionRecord) => void;
  onAcceptedPhoto?: (photoDataUrl: string) => Promise<void>;
}) {
  const dropTargetRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<ChallengePhase>(completed ? 'done' : 'capture');
  const [status, setStatus] = useState<FeedbackStatus>(completed ? 'done' : 'idle');
  const [isHoveringTarget, setIsHoveringTarget] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [recognitionHint, setRecognitionHint] = useState<string | null>(null);
  const isTextChallenge = challenge.kind === 'text';
  const isImageChallenge = challenge.kind !== 'text' && challenge.kind !== 'capture';
  const unsolvedChallengeAsset = challenge.cardAssets?.unsolvedChallenge;
  const solvedChallengeAsset = challenge.cardAssets?.solvedChallenge;
  const hasFollowUpChallenge = Boolean(unsolvedChallengeAsset || challenge.options.length > 0);

  function createCompletionRecord(): ChallengeCompletionRecord {
    return {
      completedAt: new Date().toISOString(),
      photoDataUrl: photoSrc ?? undefined,
    };
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  useEffect(() => {
    setPhase(completed ? 'done' : 'capture');
    setStatus(completed ? 'done' : 'idle');
    setIsHoveringTarget(false);
    setHasPhoto(false);
    setPhotoSrc(null);
    setCameraError(null);
    setRecognitionHint(null);
  }, [challenge.id, completed]);

  useEffect(() => {
    let isMounted = true;

    async function startCamera() {
      if (completed || phase !== 'capture' || hasPhoto) {
        stopCamera();
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera access is not available in this browser.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 1920 },
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        setCameraError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        if (isMounted) {
          setCameraError('Camera permission is needed to capture this artifact.');
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [completed, hasPhoto, phase]);

  function getDropRect() {
    return dropTargetRef.current?.getBoundingClientRect() ?? null;
  }

  function handleDrop(answer: string) {
    const isCorrect = answer === challenge.correctAnswer || challenge.options.length === 1;
    if (!isCorrect) {
      setStatus('wrong');
      window.setTimeout(() => setStatus('idle'), 650);
      return;
    }

    setStatus('correct');
    window.setTimeout(() => {
      setPhase('done');
      setStatus('done');
      onComplete(createCompletionRecord());
    }, 650);
  }

  async function handleCaptureSubmit() {
    if (!hasPhoto) return;

    stopCamera();
    setPhase('recognizing');
    setStatus('idle');
    setRecognitionHint(null);

    try {
      const checkingEnabled = await getPictureCheckingEnabled();

      if (!checkingEnabled) {
        void handleAcceptedArtifactPhoto();
        advanceAfterRecognized();
        return;
      }

      const result = await requestRecognitionDecision(challenge.id, challenge.title);

      if (result.decision === 'wrong') {
        setRecognitionHint(result.hint ? hintCopy[result.hint] : 'Wrong artifact, try another one!');
        setStatus('wrong');
        window.setTimeout(() => {
          setPhotoSrc(null);
          setHasPhoto(false);
          setStatus('idle');
          setRecognitionHint(null);
          setPhase('capture');
        }, 3000);
        return;
      }

      void handleAcceptedArtifactPhoto();
      advanceAfterRecognized();
    } catch {
      setStatus('wrong');
      window.setTimeout(() => {
        setStatus('idle');
        setPhase('review');
      }, 3000);
    }
  }

  function advanceAfterRecognized() {
    setStatus('correct');
    window.setTimeout(() => {
      if (hasFollowUpChallenge) {
        setPhase('challenge');
        setStatus('idle');
        return;
      }

      setPhase('done');
      setStatus('done');
      onComplete(createCompletionRecord());
    }, 700);
  }

  async function handleAcceptedArtifactPhoto() {
    if (!photoSrc || !onAcceptedPhoto) return;

    try {
      await onAcceptedPhoto(photoSrc);
    } catch (error) {
      console.warn('Unable to save accepted artifact photo to Firebase.', error);
    }
  }

  function handleCapturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhotoSrc(canvas.toDataURL('image/jpeg', 0.92));
    setHasPhoto(true);
    setPhase('review');
    stopCamera();
  }

  function handleDeletePhoto() {
    setPhotoSrc(null);
    setHasPhoto(false);
    setPhase('capture');
  }

  function handleChallengeComplete() {
    setPhase('done');
    setStatus('done');
    onComplete(createCompletionRecord());
  }

  if (phase === 'capture' || phase === 'review' || phase === 'recognizing') {
    return (
      <div className="challenge-page capture-page">
        <motion.div
          className={`capture-card ${status}`}
          animate={status === 'correct' ? { scale: [1, 1.045, 1] } : {}}
          transition={{ duration: 0.42, ease: 'easeOut' }}
        >
          {hasPhoto && photoSrc ? (
            <img className="camera-image" src={photoSrc} alt={`Captured ${challenge.title} photo`} />
          ) : (
            <div className="camera-view">
              <video
                ref={videoRef}
                className="camera-video"
                autoPlay
                muted
                playsInline
                aria-label="Live camera preview"
              />
              <div className="camera-grid" aria-hidden="true" />
              {cameraError && <p className="camera-error">{cameraError}</p>}
            </div>
          )}
          <canvas ref={canvasRef} className="sr-only" aria-hidden="true" />
        </motion.div>

        {status === 'wrong' && (
          <p className="capture-feedback wrong">
            {recognitionHint ?? 'Wrong artifact, try another one!'}
          </p>
        )}

        {phase === 'recognizing' && status !== 'wrong' ? (
          <p className="capture-feedback">Checking artifact...</p>
        ) : hasPhoto ? (
          <div className="capture-actions">
            <button className="capture-action submit" onClick={handleCaptureSubmit} type="button">
              <span>Submit</span>
              <Check size={54} strokeWidth={1.7} />
            </button>
            <button className="capture-action delete" onClick={handleDeletePhoto} type="button">
              <span>Delete</span>
              <X size={54} strokeWidth={1.7} />
            </button>
          </div>
        ) : (
          <>
            <p className="capture-instruction">Capture the artifact for {challenge.title}.</p>
            <button
              className="shutter-button"
              onClick={handleCapturePhoto}
              type="button"
              disabled={Boolean(cameraError)}
            >
              <Camera size={24} />
              <span className="sr-only">Capture photo</span>
            </button>
          </>
        )}
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="challenge-page capture-page">
        <motion.div className="capture-card done" animate={{ scale: [1, 1.045, 1] }}>
          <AssetImage
            asset={solvedChallengeAsset ?? challenge.capture?.journalNote ?? challenge.artifact}
            className="journal-note-image"
          />
        </motion.div>
        <p className="capture-note">{challenge.explanation}</p>
      </div>
    );
  }

  if (challenge.id === 'pin') {
    return <BronzeAgeGapChallenge challenge={challenge} onComplete={handleChallengeComplete} />;
  }

  if (challenge.id === 'skeleton') {
    return <StoneTombGapChallenge challenge={challenge} onComplete={handleChallengeComplete} />;
  }

  if (isTextChallenge && !unsolvedChallengeAsset) {
    return <TextGapChallenge challenge={challenge} onComplete={handleChallengeComplete} />;
  }

  return (
    <div className="challenge-page">
      <motion.div
        className={`artifact-card ${status}`}
        animate={status === 'wrong' ? { x: [0, -8, 8, -4, 4, 0] } : {}}
      >
        {isTextChallenge ? (
          <p className="text-challenge-prompt">
            {status === 'done' ? challenge.explanation : challenge.prompt}
          </p>
        ) : (
          <div className="artifact-hero">
            <AssetImage
              asset={
                status === 'done'
                  ? solvedChallengeAsset ?? challenge.artifact
                  : unsolvedChallengeAsset ?? challenge.artifact
              }
              className="artifact-symbol"
            />
            {status === 'done' && (
              <span className="complete-badge">
                <Check size={15} />
                Saved
              </span>
            )}
          </div>
        )}
        {isTextChallenge && status === 'done' && (
          <span className="complete-badge text-complete-badge">
            <Check size={15} />
            Saved
          </span>
        )}
        <div
          ref={dropTargetRef}
          className={`drop-zone ${isHoveringTarget || status === 'correct' ? 'ripple' : ''}`}
        >
          {status === 'done' ? (
            <>
              <Sparkles size={16} />
              Unlocked
            </>
          ) : (
            challenge.targetLabel
          )}
        </div>
      </motion.div>

      {status !== 'done' ? (
        <>
          {!isTextChallenge && <p className="challenge-prompt">{challenge.prompt}</p>}
          <div className={`option-grid ${isImageChallenge ? 'image-options' : ''}`}>
            {challenge.options.map((option) => (
              <DraggableOption
                key={option.id}
                label={option.label}
                asset={option.asset}
                flipText={isImageChallenge ? option.explanation : undefined}
                getDropRect={getDropRect}
                onHoverChange={setIsHoveringTarget}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="completion-card">
          <h2>Journal page unlocked</h2>
          <p>{challenge.explanation}</p>
        </div>
      )}

      <p className="gesture-note">
        {isImageChallenge
          ? 'Tap an option to inspect it. Long press, then drag it into the dotted target.'
          : 'Long press, then drag the phrase into the dotted target.'}
      </p>
    </div>
  );
}

const hintCopy: Record<DirectionHint, string> = {
  forward: "Look forward! It's in front of you",
  backward: "Look backward! It's behind you",
  left: "Look left! It's on your left",
  right: "Look right! It's on your right",
};
