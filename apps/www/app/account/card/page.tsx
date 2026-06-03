import Link from 'next/link';
import { SvgIcon } from '../../../src/components/ui/SvgIcon';

export const metadata = {
  title: 'Manage DLavie Card — DLavie Account',
  description: 'Review DLavie Card validity, renewal plans, and account lifecycle policy.',
};

const plans = [
  {
    name: 'Starter Renewal',
    price: 'Rp5.000',
    duration: '30 days',
    description: 'Keep your DLavie identity active for one month.',
  },
  {
    name: 'Annual Card',
    price: 'Rp25.000',
    duration: '1 year',
    description: 'Best for users who actively use DLavie services.',
  },
  {
    name: 'Permanent Identity',
    price: 'Rp50.000',
    duration: 'lifetime',
    description: 'Limited permanent identity option for early DLavie users.',
  },
];

export default function AccountCardPage() {
  return (
    <main className="account-shell account-info-shell">
      <section className="account-info-page" aria-labelledby="account-card-title">
        <header className="account-info-page__header">
          <Link className="account-brand" href="/" aria-label="Back to DLavie home">
            <SvgIcon name="brand" />
            <span>DLAVIE</span>
          </Link>
          <nav className="account-info-page__nav" aria-label="DLavie Card navigation">
            <Link href="/account/dashboard">Dashboard</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/">Website</Link>
          </nav>
        </header>

        <div className="account-info-page__hero">
          <p className="account-panel__kicker">DLavie Card</p>
          <h1 id="account-card-title">Manage DLavie Card</h1>
          <p>Your DLavie Card keeps your account identity active across DLavieOS, DLavie AI, Commerce, and Automation services.</p>
        </div>

        <div className="account-plan-grid">
          {plans.map((plan) => (
            <article className="account-plan-card" key={plan.name}>
              <span>{plan.name}</span>
              <h2>{plan.price}</h2>
              <p className="account-plan-card__duration">{plan.duration}</p>
              <p>{plan.description}</p>
              <button type="button" disabled>Coming soon</button>
            </article>
          ))}
        </div>

        <aside className="account-policy-note">
          <h2>Validity and account lifecycle</h2>
          <p>If a card expires, account access may be limited until renewed. Blacklist is only used for abuse, fraud, spam, or policy violations.</p>
        </aside>
      </section>
    </main>
  );
}
