type Size = "sm" | "md" | "lg" | "xl";

const PX: Record<Size, number> = {
  sm: 40,
  md: 56,
  lg: 80,
  xl: 128,
};

/** 서비스 로고 (tinywords.png 기반, /logo.png 사용) */
export function BrandLogo({
  size = "md",
  className = "",
}: {
  size?: Size;
  className?: string;
}) {
  const px = PX[size];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="TinyWords"
      width={px}
      height={px}
      className={`object-contain ${className}`}
    />
  );
}
