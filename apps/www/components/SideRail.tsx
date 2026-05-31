const railItems = ['AI', 'Commerce', 'Account'];

export function SideRail() {
  return (
    <aside className="dlv-side-rail" aria-label="Featured Dlavie products">
      {railItems.map((item) => (
        <a href="#ecosystem" key={item}>{item}</a>
      ))}
    </aside>
  );
}
