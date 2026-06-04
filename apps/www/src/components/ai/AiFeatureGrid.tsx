import type { FeatureCard, ModeContent } from './aiContent';

type AiFeatureGridProps = {
  content: ModeContent;
};

function FeatureArticle({ feature }: { feature: FeatureCard }) {
  return (
    <article className="ai-feature-card" data-ai-reveal>
      <div className="ai-feature-card__icon" aria-hidden="true">{feature.accent}</div>
      <p>{feature.meta}</p>
      <h3>{feature.title}</h3>
      <span>{feature.description}</span>
    </article>
  );
}

export function AiFeatureGrid({ content }: AiFeatureGridProps) {
  return (
    <section id="features" className="dlavie-ai__section ai-features" aria-labelledby="ai-features-title">
      <div className="dlavie-ai__section-heading" data-ai-reveal>
        <p className="dlavie-ai__eyebrow">Mode capabilities</p>
        <h2 id="ai-features-title">{content.label} capability grid.</h2>
        <span>{content.featureIntro}</span>
      </div>
      <div className="ai-features__grid">
        {content.features.map((feature) => <FeatureArticle key={feature.title} feature={feature} />)}
      </div>
    </section>
  );
}
