import type { FaqItem } from './aiContent';

type AiFaqProps = {
  items: FaqItem[];
};

export function AiFaq({ items }: AiFaqProps) {
  return (
    <section id="faq" className="dlavie-ai__section ai-faq" aria-labelledby="ai-faq-title">
      <div className="dlavie-ai__section-heading" data-ai-reveal>
        <p className="dlavie-ai__eyebrow">FAQ</p>
        <h2 id="ai-faq-title">Built for trust before automation.</h2>
      </div>
      <div className="ai-faq__list">
        {items.map((item) => (
          <details key={item.question} data-ai-reveal>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
