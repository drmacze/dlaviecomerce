'use client';

import { useEffect, useMemo, useState } from 'react';
import { playDlavieClinkFromGesture, setupDlavieClink } from '../../lib/audio/dlavieClink';

type InstallTutorialProps = {
  enabled: boolean;
};

type InstallSlide = {
  imageSrc: string;
  eyebrow: string;
  title: string;
  description: string;
};

const STORAGE_KEY = 'dlavie-install-tutorial-dismissed-v1';

const slides: InstallSlide[] = [
  {
    imageSrc: '/onboarding/install-welcome.png',
    eyebrow: 'DLAVIE UPDATE',
    title: 'Selamat datang di DLAVIE',
    description: 'Kenali DLavie sebagai pusat AI, commerce, automation, dan pengalaman produk yang terhubung.',
  },
  {
    imageSrc: '/onboarding/install-step-share.png',
    eyebrow: 'INSTALL DLAVIE',
    title: 'Buka menu Share',
    description: 'Ketuk tombol Share di browser untuk mulai menambahkan DLavie ke layar utama perangkatmu.',
  },
  {
    imageSrc: '/onboarding/install-step-home-screen.png',
    eyebrow: 'HOME SCREEN',
    title: 'Tambahkan sebagai app',
    description: 'Pilih Add to Home Screen, lalu buka DLavie langsung dari ikon aplikasi di perangkatmu.',
  },
];

function isStandaloneMode() {
  if (typeof window === 'undefined') return false;

  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true;
}

function shouldShowInstallTutorial() {
  if (typeof window === 'undefined') return false;
  if (isStandaloneMode()) return false;

  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'true';
  } catch {
    return true;
  }
}

function rememberDismissed() {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // Storage can be unavailable in private mode; dismissal still works for this render.
  }
}

export function InstallTutorial({ enabled }: InstallTutorialProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = slides[activeSlide];
  const isLastSlide = activeSlide === slides.length - 1;
  const showSkip = slides.length > 2 && activeSlide === 1;

  const slideLabel = useMemo(() => `${activeSlide + 1} of ${slides.length}`, [activeSlide]);

  useEffect(() => setupDlavieClink(), []);

  useEffect(() => {
    if (!enabled || !shouldShowInstallTutorial()) return;

    const showTimer = window.setTimeout(() => {
      setIsVisible(true);
    }, 520);

    return () => window.clearTimeout(showTimer);
  }, [enabled]);

  if (!isVisible) return null;

  const closeTutorial = (playClink = false) => {
    rememberDismissed();
    if (playClink) {
      playDlavieClinkFromGesture();
    }
    setIsVisible(false);
  };

  const handleNext = () => {
    if (isLastSlide) {
      closeTutorial(true);
      return;
    }

    setActiveSlide((current) => Math.min(current + 1, slides.length - 1));
  };

  return (
    <div className="dlavie-install-tutorial" role="dialog" aria-modal="true" aria-labelledby="dlavie-install-title">
      <button
        className="dlavie-install-tutorial__scrim"
        aria-label="Close DLavie install tutorial"
        onClick={() => closeTutorial(false)}
      />
      <section className="dlavie-install-tutorial__panel">
        <div className="dlavie-install-tutorial__media" aria-hidden="true">
          <img src={slide.imageSrc} alt="" draggable="false" />
        </div>

        <div className="dlavie-install-tutorial__dots" aria-label={`Tutorial step ${slideLabel}`}>
          {slides.map((item, index) => (
            <button
              key={item.imageSrc}
              type="button"
              className="dlavie-install-tutorial__dot"
              data-active={index === activeSlide ? 'true' : 'false'}
              aria-label={`Go to tutorial step ${index + 1}`}
              aria-current={index === activeSlide ? 'step' : undefined}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>

        <div className="dlavie-install-tutorial__copy">
          <p className="dlavie-install-tutorial__eyebrow">{slide.eyebrow}</p>
          <h2 id="dlavie-install-title">{slide.title}</h2>
          <p>{slide.description}</p>
        </div>

        <div className="dlavie-install-tutorial__actions">
          {showSkip ? (
            <button className="dlavie-install-tutorial__skip" type="button" onClick={() => closeTutorial(false)}>
              Skip
            </button>
          ) : (
            <span aria-hidden="true" />
          )}
          <button className="dlavie-install-tutorial__next" type="button" onClick={handleNext}>
            {isLastSlide ? 'Finish' : 'Next'}
          </button>
        </div>
      </section>
    </div>
  );
}
