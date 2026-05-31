export function DlavieMarquee() {
  const text = 'DLAVIE INC · COMMERCE · AI · AUTOMATION';

  return (
    <section className="dlv-marquee" aria-label={text}>
      <div className="dlv-marquee-track" aria-hidden="true">
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </section>
  );
}
