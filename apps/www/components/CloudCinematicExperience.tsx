const cinematicVideoSrc =
  "https://image-link.edgeone.app/1779986949558-05vmsy.mp4";

export function CloudCinematicExperience() {
  return (
    <section
      id="cloud-cinematic"
      className="dlv-cloud-cinematic dlv-cloud-reveal"
      aria-label="Lenis Smooth Scroll Cinematic Experience"
    >
      <div className="dlv-cinematic-kicker" aria-hidden="true">
        <span />
        <span>LENIS CINEMATIC ENGINE</span>
        <span />
      </div>
      <div className="dlv-cinematic-copy">
        <span>LENIS CINEMATIC ENGINE</span>
        <h2>Motion turns the DLavie ecosystem into a product journey.</h2>
        <p>
          DlavieOS, Commerce, and Automation move as one parent cloud—built for
          digital products, AI workflows, and transaction systems.
        </p>
      </div>
      <div className="dlv-cinematic-frame">
        <video
          className="dlv-cinematic-video"
          src={cinematicVideoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          The DLavie cinematic product preview video could not load.
        </video>
      </div>
      <p className="dlv-cinematic-footer">
        A parent ecosystem with motion, commerce, AI, and automation moving as
        one cloud.
      </p>
    </section>
  );
}
