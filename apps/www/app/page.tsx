import { DlavieMarquee } from "../components/DlavieMarquee";
import { HeroShowcase } from "../components/HeroShowcase";
import { DlavieCinematicScroll } from "../components/sections/DlavieCinematicScroll";
import { RevealSection } from "../components/motion/RevealSection";
import { SmoothScrollProvider } from "../components/SmoothScrollProvider";
import { TopNav } from "../components/TopNav";

const ecosystemCards = [
  {
    eyebrow: "01 / Commerce OS",
    glyph: "CO",
    status: "Rails live",
    title: "Dlavie Commerce",
    copy: "PPOB and digital commerce infrastructure built for reliable digital transactions.",
    meta: "Catalog sync · Provider logs",
  },
  {
    eyebrow: "02 / Intelligence layer",
    glyph: "AI",
    status: "Workspace ready",
    title: "Dlavie AI",
    copy: "AI workspace and automation tools for creators, students, and sellers.",
    meta: "Prompt tools · Usage insight",
  },
  {
    eyebrow: "03 / Identity graph",
    glyph: "ID",
    status: "Identity mapped",
    title: "Dlavie Account",
    copy: "One secure identity layer for every product inside the Dlavie ecosystem.",
    meta: "Profiles · Roles · Trust",
  },
  {
    eyebrow: "04 / Automation fabric",
    glyph: "AF",
    status: "Signals armed",
    title: "Dlavie Automation",
    copy: "Workflow orchestration for repeatable operations, reminders, and multi-product actions.",
    meta: "Triggers · Workflows",
  },
  {
    eyebrow: "05 / Admin command",
    glyph: "AD",
    status: "Ops visible",
    title: "Dlavie Admin",
    copy: "Operational dashboards for support, commerce observability, and ecosystem governance.",
    meta: "Audit logs · Provider control",
  },
];

const roadmapItems = [
  "Cubic identity system",
  "Unified checkout rails",
  "AI workspace automation",
  "Partner admin cockpit",
];

export default function Page() {
  return (
    <SmoothScrollProvider>
      <main className="dlv-page">
        <TopNav />
        <HeroShowcase />
        <DlavieCinematicScroll />
        <DlavieMarquee />

        <section
          className="dlv-ecosystem-section"
          id="ecosystem"
          data-scroll-section
          aria-labelledby="ecosystem-title"
        >
          <div className="dlv-shell">
            <RevealSection className="dlv-section-kicker">
              Connected product constellation
            </RevealSection>
            <div className="dlv-section-heading">
              <RevealSection as="h2" id="ecosystem-title">
                One parent brand, multiple products for modern digital life.
              </RevealSection>
              <RevealSection as="p" delay={0.12}>
                Dlavie unifies commerce, AI, account identity, automation, and
                admin systems into a premium ecosystem designed to scale from
                everyday transactions to intelligent business workflows.
              </RevealSection>
            </div>

            <div className="dlv-ecosystem-grid">
              {ecosystemCards.map((card, index) => (
                <article
                  className="dlv-ecosystem-card"
                  key={card.title}
                  data-motion="depth-card"
                  data-delay={index * 0.06}
                >
                  <div className="dlv-ecosystem-card-head">
                    <i aria-hidden="true">{card.glyph}</i>
                    <em>{card.status}</em>
                  </div>
                  <span>{card.eyebrow}</span>
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                  <small>{card.meta}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="dlv-roadmap-section"
          id="roadmap"
          data-scroll-section
          aria-labelledby="roadmap-title"
        >
          <div className="dlv-shell dlv-roadmap-grid">
            <div className="dlv-roadmap-copy">
              <RevealSection className="dlv-section-kicker">
                Product rail / 2026 rhythm
              </RevealSection>
              <RevealSection as="h2" id="roadmap-title" delay={0.08}>
                A kinetic operating layer for every Dlavie product.
              </RevealSection>
              <RevealSection as="p" delay={0.16}>
                The parent site now exposes an interaction convention that
                future product sections can reuse without turning motion into
                one-off animation spaghetti.
              </RevealSection>
            </div>
            <div className="dlv-product-rail" aria-label="Dlavie roadmap rail">
              {roadmapItems.map((item, index) => (
                <div
                  className="dlv-rail-item"
                  key={item}
                  data-motion="depth-card"
                  data-delay={index * 0.08}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SmoothScrollProvider>
  );
}
