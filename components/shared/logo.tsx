import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  secondaryfill?: string;
  strokewidth?: number;
  title?: string;
};

function Logo({
  fill = "currentColor",
  secondaryfill,
  ...props
}: IconProps) {
  // If secondaryfill is not provided, it defaults to the primary fill
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      width="30"
      height="40"
      viewBox="0 0 30 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Top Accent Part (Originally Teal #06D1D4) - Mapped to secondaryfill */}
      <path
        d="M15 0L20.4545 5.33333L0 25.3333V14.6667L15 0Z"
        fill={secondaryfill}
      />
      
      {/* Main Body Part (Originally Purple #3628A0) - Mapped to fill */}
      <path
        d="M2.90827 28.177L15 40L30 25.3334V14.6667L20.4545 5.33337L0 25.3334L0.0041688 25.3375L20.4545 5.33337V20.6667L11.25 29.6667V20.1324L2.90827 28.177Z"
        fill={fill}
      />
    </svg>
  );
}

export default Logo;