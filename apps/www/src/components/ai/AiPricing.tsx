import Link from 'next/link';
import type { AccessPlan } from './aiContent';

type AiPricingProps = {
  plans: AccessPlan[];
};

export function AiPricing({ plans }: AiPricingProps) {
  return (
    <section id="pricing" className="dlavie-ai__section ai-pricing" aria-labelledby="ai-pricing-title">
      <div className="dlavie-ai__section-heading" data-ai-reveal>
        <p className="dlavie-ai__eyebrow">Access plans</p>
        <h2 id="ai-pricing-title">Start public, unlock protected intelligence.</h2>
        <span>Pricing cards are structured for future rollout while today’s page keeps account access safe.</span>
      </div>
      <div className="ai-pricing__grid">
        {plans.map((plan) => (
          <article className="ai-plan-card" key={plan.name} data-ai-reveal>
            <div>
              <span>{plan.badge}</span>
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
            </div>
            <strong>{plan.price}</strong>
            <ul>
              {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <Link href="/account/login">Request access</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
