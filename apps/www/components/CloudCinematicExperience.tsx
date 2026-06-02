import type { CSSProperties } from "react";
import { CurvedLoop } from "./CurvedLoop";

const cinematicVideoSrc =
  "https://image-link.edgeone.app/1779986949558-05vmsy.mp4";

const osFeatures = [
  "Agent Workspace",
  "Prompt Systems",
  "Automation Flows",
  "Model Layer",
  "Usage Insights",
  "Secure Identity",
];

const commerceFeatures = [
  "PPOB Catalog",
  "Order State Engine",
  "Provider Routing",
  "Payment Flow",
  "Transaction Logs",
  "Admin Operations",
];

export function CloudCinematicExperience() {
  return (
    <section
      id="cloud-cinematic"
      className="dlv-cloud-cinematic dlv-cloud-reveal"
      aria-label="DLavie cinematic product journey"
    >
      <div className="dlv-video-portal">
        <div className="dlv-video-copy">
          <span>VIDEO PORTAL</span>
          <h2>Enter the product field.</h2>
          <p>
            The parent cloud opens into a cinematic portal for DlavieOS,
            Commerce, and the automation layer that connects both surfaces.
          </p>
        </div>
        <div className="dlv-video-frame">
          <div className="dlv-video-fallback" aria-hidden="true" />
          <video
            className="dlv-video-media"
            src={cinematicVideoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            The DLavie cinematic product preview video could not load.
          </video>
          <div className="dlv-video-chrome" aria-hidden="true">
            <span />
            <span />
            <strong>DLAVIE FIELD</strong>
          </div>
        </div>
      </div>

      <section id="dlavieos" className="dlv-product-world dlv-os-world">
        <CurvedLoop
          marqueeText="Be ✦ Professional ✦ With ✦ DLavieOS ✦ Agent ✦"
          speed={2}
          curveAmount={400}
          direction="right"
          interactive
          className="dlv-os-curved-text"
        />
        <div className="dlv-world-copy">
          <span>DLAVIEOS</span>
          <h2>The AI operating layer for DLavie.</h2>
          <p>
            DlavieOS connects agents, prompt workspaces, automation flows, and
            product intelligence into one focused command surface.
          </p>
        </div>
        <div className="dlv-os-system" aria-label="DlavieOS command surface">
          <div className="dlv-command-panel">
            <span>COMMAND SURFACE</span>
            <strong>agent.route("commerce-intel")</strong>
            <p>
              Live model context, prompt memory, identity, and usage insight
              are composed into one operator view.
            </p>
          </div>
          <div className="dlv-orbit-field" aria-hidden="true">
            {osFeatures.map((feature, index) => (
              <span
                className="dlv-orbit-chip"
                key={feature}
                style={{ "--chip-index": index } as CSSProperties}
              >
                {feature}
              </span>
            ))}
          </div>
          <div className="dlv-signal-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section id="commerce" className="dlv-product-world dlv-commerce-world">
        <div className="dlv-world-copy">
          <span>DLAVIE COMMERCE</span>
          <h2>PPOB and digital commerce rails for modern transactions.</h2>
          <p>
            Dlavie Commerce is built for product catalogs, provider routing,
            order states, payment flows, and transaction reliability.
          </p>
        </div>
        <div className="dlv-commerce-rails" aria-label="DLavie Commerce transaction rails">
          <div className="dlv-provider-map" aria-hidden="true">
            {commerceFeatures.map((feature, index) => (
              <span
                key={feature}
                style={{ "--rail-index": index } as CSSProperties}
              >
                {feature}
              </span>
            ))}
          </div>
          <div className="dlv-transaction-lanes" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>
    </section>
  );
}
