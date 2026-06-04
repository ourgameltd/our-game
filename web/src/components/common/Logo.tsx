interface LogoProps {
  size?: number;
}

export default function Logo({ size = 128 }: LogoProps) {
  return (
    <img
      src="/assets/logo-light.svg"
      width={size}
      height={size}
      alt="OurGame logo"
    />
  );
}
