export function DlavieMaterialLayer() {
  return (
    <style jsx global>{`
      .dlavie-premium-surface,.dlavie-kinetic-card,.dlavie-hover-lift,.dlavie-magnetic-cta{transform-style:preserve-3d}
      .dlavie-premium-surface:after,.dlavie-kinetic-card:after,.dlavie-hover-lift:after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(420px circle at var(--mx,50%) var(--my,20%),rgba(255,255,255,.16),rgba(125,211,252,.06) 30%,rgba(216,180,254,.04) 46%,transparent 68%);opacity:0;transition:opacity .35s ease;mix-blend-mode:screen}
      .dlavie-premium-surface:hover:after,.dlavie-kinetic-card:hover:after,.dlavie-hover-lift:hover:after{opacity:1}
      .dlavie-magnetic-cta{isolation:isolate}
      .dlavie-magnetic-cta:before{content:'';position:absolute;inset:-1px;border-radius:inherit;padding:1px;background:linear-gradient(135deg,rgba(255,255,255,.38),rgba(125,211,252,.28),rgba(216,180,254,.2),rgba(184,255,106,.28));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;opacity:.52}
    `}</style>
  );
}
