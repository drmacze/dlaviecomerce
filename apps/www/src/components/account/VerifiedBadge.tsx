export function VerifiedBadge() {
  return (
    <span className="verified-badge" role="status" aria-label="Verified DLavie Account">
      <svg className="verified-badge__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="10" />
        <path d="m7.7 12.2 2.7 2.8 5.9-6.2" />
      </svg>
      <span>Verified</span>
    </span>
  );
}
