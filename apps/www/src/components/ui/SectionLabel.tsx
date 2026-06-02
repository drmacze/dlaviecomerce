type SectionLabelProps = {
  index: string;
  label: string;
};

export function SectionLabel({ index, label }: SectionLabelProps) {
  return <p className="section-label"><span>{index}</span>{label}</p>;
}
