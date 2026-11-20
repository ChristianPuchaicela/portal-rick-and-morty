import { useId } from "react";

export function DotPattern() {
  const patternId = useId();

  return (
    <svg className="dot-pattern" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={patternId} width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
