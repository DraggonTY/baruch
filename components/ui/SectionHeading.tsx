type SectionHeadingProps = {
  children: React.ReactNode;
  className?: string;
  as?: "h2" | "h3";
};

export function SectionHeading({
  children,
  className = "",
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <Tag
      className={`font-display text-sm font-medium tracking-[0.2em] text-foreground uppercase ${className}`}
    >
      {children}
    </Tag>
  );
}
