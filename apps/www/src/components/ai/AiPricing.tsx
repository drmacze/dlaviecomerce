import Link from 'next/link';
import type { AccessPlan } from './aiContent';

type AiPricingProps = {
  plans: AccessPlan[];
  isAuthenticated: boolean;
};

export function AiPricing({ plans, isAuthenticated }: AiPricingProps) {
  return (
    <section id="pricing" className="dlavie-ai__section ai-pricing" aria-labelledby="ai-pricing-title">
      <div className="dlavie-ai__section-heading" data-ai-reveal>
        <p className="dlavie-ai__eyebrow">Access plans</p>
        <h2 id="ai-pricing-title">Start public, continue with protected intelligence.</h2>
        <span>
          {isAuthenticated
            ? 'Your account session is already active, so access cards guide you forward instead of asking you to login again.'
            : 'Pricing cards are structured for future rollout while today’s page keeps account access safe.'}
        </span>
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
            <Link href={isAuthenticated ? '/account/dashboard' : '/account/login'}>
              {isAuthenticated ? 'Continue workspace' : 'Request access'}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
