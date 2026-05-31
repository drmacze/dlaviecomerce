import { MotionConfig } from "framer-motion";
import { ReactNode, useEffect } from "react";
import { DlavieCommandPalette } from "@/components/dlavie-command-palette";
import { DlavieGsapEngine } from "@/components/dlavie-gsap-engine";
import { DlavieHypermotionEngine } from "@/components/dlavie-hypermotion-engine";
import { DlavieMaterialLayer } from "@/components/dlavie-material-layer";
import { DlavieMotionObserver } from "@/components/dlavie-motion-observer";
import { DlaviePageProgress } from "@/components/dlavie-page-progress";
import { DlavieSiteDock } from "@/components/dlavie-site-dock";
import { dlavieExperience } from "@/lib/dlavie-experience";

export function DlavieExperienceShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.dlavieEngine = "hypermotion-3";
  }, []);

  return (
    <MotionConfig
      reducedMotion="user"
      transition={{
        duration: dlavieExperience.motion.normal,
        ease: dlavieExperience.motion.easing,
      }}
    >
      <DlaviePageProgress />
      <DlavieMotionObserver />
      <DlavieGsapEngine />
      <DlavieHypermotionEngine />
      <DlavieMaterialLayer />
      <div className="dlavie-experience-shell min-h-screen pb-28 md:pb-32">
        {children}
      </div>
      <DlavieSiteDock />
      <DlavieCommandPalette />
    </MotionConfig>
  );
}
