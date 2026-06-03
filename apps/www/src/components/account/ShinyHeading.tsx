type ShinyHeadingProps = {
  children: string;
  id?: string;
};

export function ShinyHeading({ children, id }: ShinyHeadingProps) {
  return (
    <h2 id={id} className="account-shiny-heading" data-text={children}>
      {children}
    </h2>
  );
}
