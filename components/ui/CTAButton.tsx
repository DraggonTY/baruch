type CTAButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "inverted";
  className?: string;
};

export function CTAButton({
  children,
  href,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  className = "",
}: CTAButtonProps) {
  const base =
    "inline-flex items-center justify-center px-8 py-3.5 text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-foreground text-background hover:bg-foreground-secondary hover:shadow-[0_8px_30px_rgba(10,10,10,0.12)]",
    secondary:
      "border border-foreground/20 bg-transparent text-foreground hover:border-foreground/40 hover:bg-foreground/[0.03]",
    inverted:
      "bg-[#f0ebe3] text-[#0b0b12] hover:bg-[#faf6ee] hover:shadow-[0_8px_30px_rgba(240,235,227,0.2)]",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
