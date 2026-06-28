import { Fragment, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { motion, PanInfo, useDragControls } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Globe, Sparkles } from 'lucide-react';

type MuseumId = 'rmo' | 'haarlem';
type MotivationId = 'explore' | 'knowledge' | 'fun' | 'social';

export type VisitorProfile = {
  museum: MuseumId;
  exhibition: string;
  motivation: MotivationId[];
  aspect?: string[];
  challengeFormat: 'image' | 'text' | 'both';
};

type StepId = 'museum' | 'exhibition' | 'motivation' | 'aspect' | 'format' | 'print-choice';
type MuseumOptionId = 'rmo' | 'haarlem';
type ExhibitionOptionId = 'netherlands' | 'egypt' | 'classical' | 'middle-east';
type FormatOptionId = VisitorProfile['challengeFormat'];
type MuseumTutorialStage = 'tap-detail' | 'tap-back' | 'select' | 'deselect' | 'reselect' | 'complete';
type AspectOptionId =
  | 'trade'
  | 'power'
  | 'rituals'
  | 'farming'
  | 'fashion'
  | 'daily-life'
  | 'technology'
  | 'all-aspects';
type SelectableOptionId = MuseumOptionId | ExhibitionOptionId | MotivationId | AspectOptionId | FormatOptionId;

const museums: { id: MuseumId; label: string; shortLabel: string; available: boolean; exhibitions: string[] }[] = [
  {
    id: 'rmo',
    label: 'The National Museum of Antiques (Rijksmuseum van Oudheden)',
    shortLabel: 'The National Museum of Antiques (RMO)',
    available: true,
    exhibitions: ['The Archeology of the Netherlands'],
  },
  {
    id: 'haarlem',
    label: 'Archeological Museum Haarlem',
    shortLabel: 'Archeological Museum Haarlem',
    available: false,
    exhibitions: [],
  },
];

const motivations: { id: MotivationId; label: string; detail: string; tone: 'olive' | 'rust' | 'blue' | 'purple' }[] = [
  {
    id: 'social',
    label: 'visit highlighted collections',
    detail: "I want to see the museum's most important or unique collections about early history of the Netherlands.",
    tone: 'olive',
  },
  {
    id: 'explore',
    label: 'explore interesting things and expand my horizon',
    detail: 'I want to discover new ideas, cultures, perspectives, and topics that broaden my mind and curiosity.',
    tone: 'rust',
  },
  {
    id: 'knowledge',
    label: 'learn specific knowledge',
    detail: 'I want to gain deeper insights / knowledge about specific aspects of early Dutch histories / archeology',
    tone: 'blue',
  },
  {
    id: 'fun',
    label: 'relax and wander around',
    detail: 'I want to refresh my brain and have fun, taking in the surroundings and exhibits at a leisurely pace.',
    tone: 'purple',
  },
];

const formats: {
  id: FormatOptionId;
  label: string;
  answerLabel: string;
  detail: string;
  tone: 'rust' | 'blue' | 'green';
}[] = [
  {
    id: 'image',
    label: 'using images and visual clues',
    answerLabel: 'using images and visual clues',
    detail: 'spotting details, matching images, and solving visual puzzles.',
    tone: 'rust',
  },
  {
    id: 'text',
    label: 'using text and written clues',
    answerLabel: 'using text and written clues',
    detail: 'reading clues, interpreting information, and answering questions based on descriptions.',
    tone: 'blue',
  },
  {
    id: 'both',
    label: 'using both visual and textual clues',
    answerLabel: 'using both visual and textual clues',
    detail: 'A combination of visual puzzles and textual reasoning',
    tone: 'green',
  },
];

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const aspectOptions: {
  id: AspectOptionId;
  label: string;
  answerLabel: string;
  detail: string;
  image: string;
  tone: 'olive' | 'rust' | 'blue' | 'green' | 'purple' | 'pink' | 'sky' | 'orange';
}[] = [
  {
    id: 'trade',
    label: 'Trade & Exchange',
    answerLabel: 'trade & exchange',
    detail: 'economy, market, cross-cultural transaction',
    image: assetUrl('assets/aspects/trade&exchange.png'),
    tone: 'olive',
  },
  {
    id: 'power',
    label: 'Power & Authority',
    answerLabel: 'power & authority',
    detail: 'ruling, hierarchy, military, empire',
    image: assetUrl('assets/aspects/power&authority.png'),
    tone: 'rust',
  },
  {
    id: 'rituals',
    label: 'Rituals & Beliefs',
    answerLabel: 'rituals & beliefs',
    detail: 'burial, religion, animal/human remains',
    image: assetUrl('assets/aspects/rituals&beliefs.png'),
    tone: 'blue',
  },
  {
    id: 'farming',
    label: 'Survival & Farming',
    answerLabel: 'survival & farming',
    detail: 'farming, hunting, agriculture, livestock',
    image: assetUrl('assets/aspects/survival&farming.png'),
    tone: 'green',
  },
  {
    id: 'fashion',
    label: 'Fashion & Identity',
    answerLabel: 'fashion & identity',
    detail: 'jewelry, clothing, cosmetics',
    image: assetUrl('assets/aspects/fashion&identity.png'),
    tone: 'purple',
  },
  {
    id: 'daily-life',
    label: 'Social & Daily Life',
    answerLabel: 'social & daily life',
    detail: 'furniture, leisure, domestic life, education',
    image: assetUrl('assets/aspects/social&dailylife.png'),
    tone: 'pink',
  },
  {
    id: 'technology',
    label: 'Technology & Craftsmanship',
    answerLabel: 'technology & craftsmanship',
    detail: 'tools, materials, craftsmanship',
    image: assetUrl('assets/aspects/technology&craftsmanship.png'),
    tone: 'sky',
  },
  {
    id: 'all-aspects',
    label: 'All The Aspects',
    answerLabel: 'all the aspects',
    detail: 'all the aspects mentioned above',
    image: '',
    tone: 'orange',
  },
];

const exhibitionOptions: {
  id: ExhibitionOptionId;
  label: string;
  answerLabel: string;
  available: boolean;
  details?: string;
  link?: string;
  tone: 'olive' | 'rust' | 'blue' | 'green';
}[] = [
  {
    id: 'netherlands',
    label: 'The Archeology of the Netherlands',
    answerLabel: 'The Archeology of the Netherlands',
    available: true,
    details:
      'Exhibits Dutch discoveries begins in early prehistory, leads through the Roman period, followed by the early and late Middle Ages, and ends in the modern era.',
    link: 'the-archeology-of-the-netherlands',
    tone: 'olive',
  },
  {
    id: 'egypt',
    label: 'Egypt & Nubia',
    answerLabel: 'Egypt & Nubia',
    available: false,
    tone: 'rust',
  },
  {
    id: 'classical',
    label: 'Classical World',
    answerLabel: 'Classical World',
    available: false,
    tone: 'blue',
  },
  {
    id: 'middle-east',
    label: 'The Ancient Middle East',
    answerLabel: 'The Ancient Middle East',
    available: false,
    tone: 'green',
  },
];

function pointInRect(point: { x: number; y: number }, rect: DOMRect | null) {
  if (!rect) return false;
  return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
}

export function OnboardingPage({ onComplete }: { onComplete: (profile: VisitorProfile) => void }) {
  const [step, setStep] = useState<StepId>('museum');
  const [museum, setMuseum] = useState<MuseumId | null>(null);
  const [museumTutorialStage, setMuseumTutorialStage] = useState<MuseumTutorialStage>('tap-detail');
  const [museumHovering, setMuseumHovering] = useState(false);
  const [museumWrong, setMuseumWrong] = useState(false);
  const [exhibition, setExhibition] = useState('');
  const [exhibitionHovering, setExhibitionHovering] = useState(false);
  const [exhibitionWrong, setExhibitionWrong] = useState(false);
  const [motivationsSelected, setMotivationsSelected] = useState<MotivationId[]>([]);
  const [motivationHovering, setMotivationHovering] = useState(false);
  const [motivationWrong, setMotivationWrong] = useState(false);
  const [aspectsSelected, setAspectsSelected] = useState<AspectOptionId[]>([]);
  const [aspectHovering, setAspectHovering] = useState(false);
  const [aspectWrong, setAspectWrong] = useState(false);
  const [challengeFormat, setChallengeFormat] = useState<VisitorProfile['challengeFormat'] | null>(null);
  const [formatHovering, setFormatHovering] = useState(false);
  const [formatWrong, setFormatWrong] = useState(false);
  const museumDropRef = useRef<HTMLSpanElement>(null);
  const exhibitionDropRef = useRef<HTMLSpanElement>(null);
  const motivationDropRef = useRef<HTMLSpanElement>(null);
  const aspectDropRef = useRef<HTMLSpanElement>(null);
  const formatDropRef = useRef<HTMLSpanElement>(null);
  const museumCardRef = useRef<HTMLDivElement>(null);
  const exhibitionCardRef = useRef<HTMLDivElement>(null);
  const motivationCardRef = useRef<HTMLDivElement>(null);
  const aspectCardRef = useRef<HTMLDivElement>(null);
  const formatCardRef = useRef<HTMLDivElement>(null);

  const selectedMuseum = useMemo(
    () => museums.find((item) => item.id === museum) ?? null,
    [museum],
  );
  const selectedFormat = useMemo(
    () => formats.find((item) => item.id === challengeFormat) ?? null,
    [challengeFormat],
  );
  const shouldShowAspectProfiling = motivationsSelected.includes('knowledge');

  function museumDropRect() {
    return museumCardRef.current?.getBoundingClientRect() ?? museumDropRef.current?.getBoundingClientRect() ?? null;
  }

  function exhibitionDropRect() {
    return exhibitionCardRef.current?.getBoundingClientRect() ?? exhibitionDropRef.current?.getBoundingClientRect() ?? null;
  }

  function motivationDropRect() {
    return motivationCardRef.current?.getBoundingClientRect() ?? motivationDropRef.current?.getBoundingClientRect() ?? null;
  }

  function aspectDropRect() {
    return aspectCardRef.current?.getBoundingClientRect() ?? aspectDropRef.current?.getBoundingClientRect() ?? null;
  }

  function formatDropRect() {
    return formatCardRef.current?.getBoundingClientRect() ?? formatDropRef.current?.getBoundingClientRect() ?? null;
  }

  function chooseMuseum(optionId: MuseumOptionId) {
    if (museumTutorialStage !== 'select' && museumTutorialStage !== 'reselect') return;

    const option = museums.find((item) => item.id === optionId);
    if (!option?.available) {
      setMuseumWrong(true);
      window.setTimeout(() => setMuseumWrong(false), 1200);
      return;
    }

    setMuseum(option.id);
    setMuseumTutorialStage((current) => (current === 'reselect' ? 'complete' : 'deselect'));
    setMuseumHovering(false);
  }

  function handleMuseumOptionFlip(optionId: SelectableOptionId, flipped: boolean) {
    if (optionId !== 'rmo') return;
    if (museumTutorialStage === 'tap-detail' && flipped) {
      setMuseumTutorialStage('tap-back');
    }
    if (museumTutorialStage === 'tap-back' && !flipped) {
      setMuseumTutorialStage('select');
    }
  }

  function deselectMuseum() {
    setMuseum(null);
    setExhibition('');
    setMuseumTutorialStage((current) => (current === 'complete' || current === 'deselect' ? 'reselect' : current));
  }

  function chooseExhibition(optionId: ExhibitionOptionId) {
    const option = exhibitionOptions.find((item) => item.id === optionId);
    if (!option?.available) {
      setExhibitionWrong(true);
      window.setTimeout(() => setExhibitionWrong(false), 1200);
      return;
    }

    setExhibition(option.answerLabel);
    setExhibitionHovering(false);
  }

  function chooseMotivation(optionId: MotivationId) {
    setMotivationsSelected((current) => {
      if (current.includes(optionId)) return current;
      if (current.length >= 2) {
        setMotivationWrong(true);
        window.setTimeout(() => setMotivationWrong(false), 1200);
        return current;
      }
      setMotivationHovering(false);
      return [...current, optionId];
    });
  }

  function deselectMotivation(optionId: MotivationId) {
    setMotivationsSelected((current) => {
      const next = current.filter((motivationId) => motivationId !== optionId);
      if (!next.includes('knowledge')) {
        setAspectsSelected([]);
      }
      return next;
    });
  }

  function showAspectLockedError() {
    setAspectWrong(true);
    window.setTimeout(() => setAspectWrong(false), 1400);
  }

  function chooseAspect(optionId: AspectOptionId) {
    setAspectsSelected((current) => {
      if (current.includes('all-aspects') && optionId !== 'all-aspects') {
        showAspectLockedError();
        return current;
      }
      if (optionId === 'all-aspects') {
        setAspectHovering(false);
        return ['all-aspects'];
      }
      if (current.includes(optionId)) return current;

      const regularSelections = current.filter((item) => item !== 'all-aspects');
      if (regularSelections.length >= 6) {
        setAspectHovering(false);
        return ['all-aspects'];
      }

      setAspectHovering(false);
      return [...regularSelections, optionId];
    });
  }

  function chooseFormat(optionId: FormatOptionId) {
    if (challengeFormat && challengeFormat !== optionId) {
      setFormatWrong(true);
      window.setTimeout(() => setFormatWrong(false), 1400);
      return;
    }
    setChallengeFormat(optionId);
    setFormatHovering(false);
  }

  function profilePayload(): VisitorProfile | null {
    if (!museum || !exhibition || motivationsSelected.length === 0 || !challengeFormat) return null;

    return {
      museum,
      exhibition,
      motivation: motivationsSelected,
      aspect: shouldShowAspectProfiling
        ? aspectsSelected.map(
            (item) => aspectOptions.find((option) => option.id === item)?.answerLabel ?? item,
          )
        : undefined,
      challengeFormat,
    };
  }

  function completeOnboarding() {
    const profile = profilePayload();
    if (!profile) return;
    onComplete(profile);
  }

  function downloadBlob(filename: string, blob: Blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function downloadMapPdf() {
    const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 420 594] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 126 >>
stream
BT
/F1 24 Tf
72 500 Td
(My Field Journal Map) Tj
/F1 14 Tf
0 -34 Td
(Print this physical map before your museum visit.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000241 00000 n 
0000000418 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
488
%%EOF`;
    downloadBlob('my-field-journal-map.pdf', new Blob([pdf], { type: 'application/pdf' }));
  }

  function downloadMuseumQr() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
  <rect width="640" height="640" fill="#fff8df"/>
  <text x="320" y="76" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#6d5a35">My Field Journal</text>
  <g transform="translate(112 112)" fill="#111827">
    <rect width="416" height="416" rx="24" fill="#fff"/>
    <path d="M32 32h112v112H32zM272 32h112v112H272zM32 272h112v112H32z"/>
    <path fill="#fff" d="M60 60h56v56H60zM300 60h56v56h-56zM60 300h56v56H60z"/>
    <path d="M184 56h32v32h-32zM224 56h32v72h-32zM176 136h72v32h-72zM280 176h32v32h-32zM328 176h56v32h-56zM176 216h32v80h-32zM224 216h88v32h-88zM344 240h40v40h-40zM224 288h32v32h-32zM280 288h64v32h-64zM176 344h32v40h-32zM240 352h32v32h-32zM296 344h88v40h-88z"/>
  </g>
  <text x="320" y="576" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#6d5a35">Show this at the museum to print your map</text>
</svg>`;
    downloadBlob('museum-map-qr.svg', new Blob([svg], { type: 'image/svg+xml' }));
  }

  function choosePrintOption(option: 'continue' | 'home' | 'museum') {
    if (option === 'home') downloadMapPdf();
    if (option === 'museum') downloadMuseumQr();
    completeOnboarding();
  }

  function goBack() {
    if (step === 'print-choice') {
      setStep('format');
      return;
    }
    if (step === 'format') {
      setStep(shouldShowAspectProfiling ? 'aspect' : 'motivation');
      return;
    }
    if (step === 'aspect') {
      setStep('motivation');
      return;
    }
    if (step === 'motivation') {
      setStep('exhibition');
      return;
    }
    if (step === 'exhibition') {
      setStep('museum');
    }
  }

  function goNext() {
    if (step === 'museum' && museum) {
      setExhibition('');
      setStep('exhibition');
      return;
    }
    if (step === 'exhibition' && exhibition) {
      setStep('motivation');
      return;
    }
    if (step === 'motivation' && motivationsSelected.length > 0) {
      setStep(shouldShowAspectProfiling ? 'aspect' : 'format');
      return;
    }
    if (step === 'aspect' && aspectsSelected.length > 0) {
      setStep('format');
      return;
    }
    if (step === 'format' && challengeFormat) {
      setStep('print-choice');
    }
  }

  function canContinue() {
    if (step === 'museum') return Boolean(museum) && museumTutorialStage === 'complete';
    if (step === 'exhibition') return Boolean(exhibition);
    if (step === 'motivation') return motivationsSelected.length > 0;
    if (step === 'aspect') return aspectsSelected.length > 0;
    if (step === 'print-choice') return false;
    return Boolean(challengeFormat);
  }

  const isMuseumDragTutorial = step === 'museum' && !museum && (
    museumTutorialStage === 'select' || museumTutorialStage === 'reselect'
  );
  const isMuseumTapTutorial = step === 'museum' && !museum && (
    museumTutorialStage === 'tap-detail' || museumTutorialStage === 'tap-back'
  );
  const shouldHighlightMuseumOption =
    step === 'museum' &&
    !museum &&
    (museumTutorialStage === 'tap-detail' ||
      museumTutorialStage === 'tap-back' ||
      museumTutorialStage === 'select' ||
      museumTutorialStage === 'reselect');

  return (
    <div
      className={`onboarding-page profiling-page ${
        step === 'museum' || step === 'exhibition' ? 'museum-tutorial-page' : ''
      }`}
    >
      {step === 'museum' ? (
        <>
          {museumWrong && <p className="museum-unavailable-note">Sorry! This museum is not yet ready...</p>}

          <motion.div
            ref={museumCardRef}
            className={`prompt-card museum-gap-card ${museum ? 'is-complete' : ''} ${museumWrong ? 'is-wrong' : ''} ${
              isMuseumDragTutorial ? 'tutorial-glow' : ''
            }`}
            animate={museumWrong ? { x: [0, -8, 8, -4, 4, 0] } : {}}
          >
            <p className="prompt-sentence">
              <span>I'm traveling to </span>
              {museum && selectedMuseum ? (
                <button
                  className={`filled-gap ${museumTutorialStage === 'deselect' ? 'tutorial-glow-inline' : ''}`}
                  onClick={deselectMuseum}
                  type="button"
                >
                  The National Museum of Antiques (RMO)
                </button>
              ) : (
                <span
                  ref={museumDropRef}
                  className={`gap-placeholder ${museumHovering ? 'is-hovered' : ''}`}
                >
                  select a museum
                </span>
              )}
              <span> to visit </span>
              <span className="gap-placeholder museum-exhibition-placeholder" aria-hidden="true">
                select an exhibition
              </span>
            </p>
            {museumWrong && <div className="museum-wrong-fill">Archeological Museum Haarlem</div>}
          </motion.div>

          {museumTutorialStage === 'deselect' && museum && (
            <p className="museum-tutorial-note deselect-note">
              Click the filled-in option to deselect
              <span aria-hidden="true">↑</span>
            </p>
          )}

          {museumTutorialStage === 'reselect' && !museum && (
            <p className="museum-tutorial-note reselect-note">
              Now that you learn how to select and deselect an option. Select again to continue.
            </p>
          )}

          {!museum ? (
            <>
              {museumTutorialStage === 'tap-detail' && (
                <p className="museum-tutorial-note tap-note">
                  Tap an option to see its detailed description
                </p>
              )}
              {museumTutorialStage === 'tap-back' && (
                <p className="museum-tutorial-note tap-note">
                  You can tap again to go back to the option
                </p>
              )}
              {museumTutorialStage === 'select' && (
                <p className="museum-tutorial-note drag-note">
                  Drag the option to the gap to select
                </p>
              )}
              <div className="museum-option-list">
                <MuseumOptionCard
                  id="rmo"
                  label="The National Museum of Antiques (Rijksmuseum van Oudheden)"
                  details="An archeological museum that houses ancient discoveries from Egypt, the Classical World, the ancient Near East, and the Netherlands in prehistoric, Roman, and medieval times"
                  link="rmo.nl"
                  tone="olive"
                  getDropRect={museumDropRect}
                  onHoverChange={setMuseumHovering}
                  onSelect={(id) => chooseMuseum(id as MuseumOptionId)}
                  onFlipChange={handleMuseumOptionFlip}
                  dragEnabled={!isMuseumTapTutorial}
                  highlighted={shouldHighlightMuseumOption}
                />
                <MuseumOptionCard
                  id="haarlem"
                  label="Archeological Museum Haarlem"
                  tone="rust"
                  getDropRect={museumDropRect}
                  onHoverChange={setMuseumHovering}
                  onSelect={(id) => chooseMuseum(id as MuseumOptionId)}
                  dragEnabled={!isMuseumTapTutorial}
                />
              </div>
            </>
          ) : museumTutorialStage === 'complete' ? (
            <div className="museum-complete-copy">
              <p>Congrats!</p>
              <p>You have learned how to write a journal page!</p>
            </div>
          ) : null}
        </>
      ) : step === 'exhibition' && selectedMuseum ? (
        <>
          <motion.div
            ref={exhibitionCardRef}
            className={`prompt-card museum-gap-card exhibition-gap-card ${exhibition ? 'is-complete' : ''} ${
              exhibitionWrong ? 'is-wrong' : ''
            }`}
            animate={exhibitionWrong ? { x: [0, -8, 8, -4, 4, 0] } : {}}
          >
            <p className="prompt-sentence">
              <span>I'm traveling to </span>
              <span className="filled-gap static-answer">
                the National Museum of Antiques
              </span>
              <span> to visit </span>
              {exhibition ? (
                <button
                  className="filled-gap exhibition-filled-answer"
                  onClick={() => setExhibition('')}
                  type="button"
                >
                  {exhibition}
                </button>
              ) : (
                <span
                  ref={exhibitionDropRef}
                  className={`gap-placeholder exhibition-gap-drop ${
                    exhibitionHovering ? 'is-hovered' : ''
                  }`}
                >
                  select an exhibition
                </span>
              )}
            </p>
          </motion.div>

          <div className="museum-option-list exhibition-option-list">
            {exhibitionOptions
              .filter((option) => option.answerLabel !== exhibition)
              .map((option) => (
                <MuseumOptionCard
                  key={option.id}
                  id={option.id}
                  label={option.label}
                  details={option.details}
                  link={option.link}
                  tone={option.tone}
                  getDropRect={exhibitionDropRect}
                  onHoverChange={setExhibitionHovering}
                  onSelect={(id) => chooseExhibition(id as ExhibitionOptionId)}
                />
              ))}
          </div>
        </>
      ) : step === 'motivation' ? (
        <>
          {motivationWrong && <p className="museum-unavailable-note">Select at most 2 motivations!</p>}

          <motion.div
            ref={motivationCardRef}
            className={`prompt-card museum-gap-card motivation-gap-card ${
              motivationsSelected.length > 0 ? 'is-complete' : ''
            } ${motivationWrong ? 'is-wrong' : ''}`}
            animate={motivationWrong ? { x: [0, -8, 8, -4, 4, 0] } : {}}
          >
            <p className="prompt-sentence">
              <span>I want to </span>
              {motivationsSelected.length === 0 ? (
                <span
                  ref={motivationDropRef}
                  className={`gap-placeholder motivation-gap-drop ${
                    motivationHovering ? 'is-hovered' : ''
                  }`}
                >
                  choose at most two motivations
                </span>
              ) : (
                <>
                  {motivationsSelected.map((item, index) => {
                    const selected = motivations.find((motivationOption) => motivationOption.id === item);
                    if (!selected) return null;
                    return (
                      <Fragment key={item}>
                        {index > 0 && <span> and </span>}
                        <button
                          className="filled-gap motivation-filled-answer"
                          onClick={() => deselectMotivation(item)}
                          type="button"
                        >
                          {selected.label}
                        </button>
                      </Fragment>
                    );
                  })}
                  {motivationsSelected.length === 1 && (
                    <>
                      <span> and </span>
                      <span
                        ref={motivationDropRef}
                        className={`gap-placeholder motivation-gap-drop ${
                          motivationHovering ? 'is-hovered' : ''
                        }`}
                      >
                        choose one more
                      </span>
                    </>
                  )}
                  {motivationsSelected.length === 2 && (
                    <span
                      ref={motivationDropRef}
                      className={`motivation-full-drop ${motivationHovering ? 'is-hovered' : ''}`}
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
              <span> in this exhibition about the past of the Netherlands.</span>
            </p>
          </motion.div>

          <div className="museum-option-list motivation-option-list">
            {motivations
              .filter((option) => !motivationsSelected.includes(option.id))
              .map((option) => (
                <MuseumOptionCard
                  key={option.id}
                  id={option.id}
                  label={option.label}
                  details={option.detail}
                  tone={option.tone}
                  getDropRect={motivationDropRect}
                  onHoverChange={setMotivationHovering}
                  onSelect={(id) => chooseMotivation(id as MotivationId)}
                />
              ))}
          </div>
        </>
      ) : step === 'aspect' ? (
        <>
          {aspectWrong && <p className="museum-unavailable-note">Deselect “all the aspect” please!</p>}

          <motion.div
            ref={aspectCardRef}
            className={`prompt-card museum-gap-card aspect-gap-card ${
              aspectsSelected.length > 0 ? 'is-complete' : ''
            } ${aspectWrong ? 'is-wrong' : ''}`}
            animate={aspectWrong ? { x: [0, -8, 8, -4, 4, 0] } : {}}
          >
            <p className="prompt-sentence">
              <span>I'm interested in </span>
              {aspectsSelected.includes('all-aspects') ? (
                <button
                  className="filled-gap aspect-filled-answer"
                  onClick={() => setAspectsSelected([])}
                  type="button"
                >
                  all the aspects
                </button>
              ) : aspectsSelected.length === 0 ? (
                <span
                  ref={aspectDropRef}
                  className={`gap-placeholder aspect-gap-drop ${aspectHovering ? 'is-hovered' : ''}`}
                >
                  choose all the aspects you are interested in
                </span>
              ) : (
                <>
                  {aspectsSelected.map((item, index) => {
                    const selected = aspectOptions.find((option) => option.id === item);
                    if (!selected) return null;
                    return (
                      <Fragment key={item}>
                        {index > 0 && <span>{index === aspectsSelected.length - 1 ? ', and' : ','}</span>}
                        <button
                          className="filled-gap aspect-filled-answer"
                          onClick={() =>
                            setAspectsSelected((current) =>
                              current.filter((aspectId) => aspectId !== item),
                            )
                          }
                          type="button"
                        >
                          {selected.answerLabel}
                        </button>
                      </Fragment>
                    );
                  })}
                  {aspectsSelected.length < 6 && (
                    <>
                      <span>{aspectsSelected.length === 1 ? 'and' : ', and'}</span>
                      <span
                        ref={aspectDropRef}
                        className={`gap-placeholder aspect-gap-drop ${
                          aspectHovering ? 'is-hovered' : ''
                        }`}
                      >
                        choose more...
                      </span>
                    </>
                  )}
                  {aspectsSelected.length >= 6 && (
                    <span
                      ref={aspectDropRef}
                      className={`motivation-full-drop ${aspectHovering ? 'is-hovered' : ''}`}
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
              <span> in early Dutch history.</span>
            </p>
          </motion.div>

          <div className="museum-option-list aspect-option-list">
            {aspectOptions
              .filter((option) =>
                aspectsSelected.includes('all-aspects')
                  ? option.id !== 'all-aspects'
                  : !aspectsSelected.includes(option.id),
              )
              .map((option) => (
                <MuseumOptionCard
                  key={option.id}
                  id={option.id}
                  label={option.label}
                  details={option.detail}
                  image={option.image}
                  tone={option.tone}
                  getDropRect={aspectDropRect}
                  onHoverChange={setAspectHovering}
                  onSelect={(id) => chooseAspect(id as AspectOptionId)}
                />
              ))}
          </div>
        </>
      ) : step === 'format' ? (
        <>
          {formatWrong && (
            <p className="museum-unavailable-note">
              Deselect your current option first to change selection!
            </p>
          )}

          <motion.div
            ref={formatCardRef}
            className={`prompt-card museum-gap-card format-gap-card ${
              challengeFormat ? 'is-complete' : ''
            } ${formatWrong ? 'is-wrong' : ''}`}
            animate={formatWrong ? { x: [0, -8, 8, -4, 4, 0] } : {}}
          >
            <p className="prompt-sentence">
              <span>I enjoy solving treasure hunt challenges by </span>
              {selectedFormat ? (
                <>
                  <button
                    className="filled-gap format-filled-answer"
                    onClick={() => setChallengeFormat(null)}
                    type="button"
                  >
                    {selectedFormat.answerLabel}
                  </button>
                  <span
                    ref={formatDropRef}
                    className={`motivation-full-drop ${formatHovering ? 'is-hovered' : ''}`}
                    aria-hidden="true"
                  />
                </>
              ) : (
                <span
                  ref={formatDropRef}
                  className={`gap-placeholder format-gap-drop ${formatHovering ? 'is-hovered' : ''}`}
                >
                  choose your preferred challenge format
                </span>
              )}
              <span>.</span>
            </p>
          </motion.div>

          <div className="museum-option-list format-option-list">
            {formats
              .filter((option) => option.id !== challengeFormat)
              .map((option) => (
                <MuseumOptionCard
                  key={option.id}
                  id={option.id}
                  label={option.label}
                  details={option.detail}
                  tone={option.tone}
                  getDropRect={formatDropRect}
                  onHoverChange={setFormatHovering}
                  onSelect={(id) => chooseFormat(id as FormatOptionId)}
                />
              ))}
          </div>
        </>
      ) : step === 'print-choice' ? (
        <div className="print-choice-page">
          <button className="print-choice-button rust" type="button" onClick={() => choosePrintOption('continue')}>
            Continue with this App
          </button>
          <button className="print-choice-button blue" type="button" onClick={() => choosePrintOption('home')}>
            Print a Physical Map at home
          </button>
          <button className="print-choice-button green" type="button" onClick={() => choosePrintOption('museum')}>
            Print a Physical Map at the museum
          </button>
        </div>
      ) : null}

      {step !== 'print-choice' && (
        <div className="profiling-nav">
          <button
            className="profiling-arrow"
            disabled={step === 'museum'}
            onClick={goBack}
            type="button"
            aria-label="Previous profiling step"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="profiling-next-group">
            {step === 'museum' && museumTutorialStage === 'complete' && (
              <span className="profiling-next-note">Continue to enjoy your journey ahead.</span>
            )}
            <button
              className={`profiling-arrow ${
                step === 'museum' && museumTutorialStage === 'complete' ? 'tutorial-glow-control' : ''
              }`}
              disabled={!canContinue()}
              onClick={goNext}
              type="button"
              aria-label="Next profiling step"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MuseumOptionCard({
  id,
  label,
  details,
  image,
  link,
  tone,
  getDropRect,
  onHoverChange,
  onSelect,
  onFlipChange,
  dragEnabled = true,
  highlighted = false,
}: {
  id: SelectableOptionId;
  label: string;
  details?: string;
  image?: string;
  link?: string;
  tone: 'olive' | 'rust' | 'blue' | 'green' | 'purple' | 'pink' | 'sky' | 'orange';
  getDropRect: () => DOMRect | null;
  onHoverChange: (isHovering: boolean) => void;
  onSelect: (id: SelectableOptionId) => void;
  onFlipChange?: (id: SelectableOptionId, flipped: boolean) => void;
  dragEnabled?: boolean;
  highlighted?: boolean;
}) {
  const dragControls = useDragControls();
  const timer = useRef<number | null>(null);
  const wasDragging = useRef(false);
  const isPointerDown = useRef(false);
  const isDraggingRef = useRef(false);
  const [flipped, setFlipped] = useState(false);
  const [dragReady, setDragReady] = useState(false);

  function startHold(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragEnabled) return;
    event.preventDefault();
    const pointerEvent = event.nativeEvent;
    isPointerDown.current = true;
    timer.current = window.setTimeout(() => {
      if (!isPointerDown.current) return;
      wasDragging.current = true;
      setDragReady(true);
      dragControls.start(pointerEvent);
    }, 140);
  }

  function clearHold() {
    isPointerDown.current = false;
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    if (!isDraggingRef.current) {
      setDragReady(false);
      onHoverChange(false);
    }
  }

  function handleTap() {
    if (wasDragging.current) {
      wasDragging.current = false;
      return;
    }
    if (!details) return;
    setFlipped((value) => {
      const next = !value;
      onFlipChange?.(id, next);
      return next;
    });
  }

  function handleDrag(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (!dragEnabled) return;
    isDraggingRef.current = true;
    setDragReady(false);
    onHoverChange(pointInRect(info.point, getDropRect()));
  }

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (!dragEnabled) return;
    const dropped = pointInRect(info.point, getDropRect());
    isPointerDown.current = false;
    isDraggingRef.current = false;
    setDragReady(false);
    onHoverChange(false);
    if (dropped) onSelect(id);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleTap();
  }

  return (
    <motion.div
      className={`museum-option-card ${tone} ${flipped ? 'is-flipped' : ''} ${
        dragReady ? 'is-drag-ready' : ''
      } ${highlighted ? 'tutorial-glow' : ''}`}
      drag={dragEnabled}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragSnapToOrigin
      onClick={handleTap}
      onPointerDown={startHold}
      onPointerUp={clearHold}
      onPointerCancel={clearHold}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      whileDrag={{ scale: 1.04, zIndex: 40 }}
    >
      <span className="museum-option-inner">
        <span className="museum-option-face museum-option-front">
          {image && <img className="museum-option-image" src={image} alt="" aria-hidden="true" />}
          <span className="museum-option-label">{label}</span>
        </span>
        {details && (
          <span className="museum-option-face museum-option-back">
            <span>{details}</span>
            {link && (
              <a
                className="museum-option-link"
                href="https://www.rmo.nl/"
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <Globe size={14} />
                {link}
              </a>
            )}
          </span>
        )}
      </span>
    </motion.div>
  );
}

function ChoiceStep({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="choice-step">
      <h2>{title}</h2>
      <p>{subtitle}</p>
      <div className="choice-list">{children}</div>
    </div>
  );
}

function ChoiceButton({
  selected,
  label,
  detail,
  onClick,
}: {
  selected: boolean;
  label: string;
  detail?: string;
  onClick: () => void;
}) {
  return (
    <button className={`choice-button ${selected ? 'is-selected' : ''}`} onClick={onClick} type="button">
      <span>{label}</span>
      {detail && <small>{detail}</small>}
      {selected && <Check size={16} />}
    </button>
  );
}
