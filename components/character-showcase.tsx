"use client";

import { animate } from "animejs/animation";
import { createScope } from "animejs/scope";
import Image from "next/image";
import { useEffect, useRef } from "react";

type CharacterShowcaseProps = {
  image: string;
  name: string;
};

export function CharacterShowcase({ image, name }: CharacterShowcaseProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const orbit = orbitRef.current;
    const portrait = portraitRef.current;
    if (!stage || !orbit || !portrait) return;

    const scope = createScope({ root: stage, mediaQueries: { reduced: "(prefers-reduced-motion: reduce)" } });
    scope.add(() => {
      if (scope.matches.reduced) return;

      animate(orbit, {
        rotate: [-28, 0],
        scale: [0.78, 1],
        opacity: [0.25, 1],
        duration: 650,
        ease: "outCubic",
      });
      animate(portrait, {
        y: [18, 0],
        scale: [0.92, 1],
        duration: 480,
        ease: "outCubic",
      });
    });

    return () => {
      scope.revert();
    };
  }, [image]);

  return (
    <div className="portrait-frame">
      <div className="character-showcase" ref={stageRef}>
        <div className="character-orbit" ref={orbitRef} aria-hidden="true" />
        <Image
          ref={portraitRef}
          className="detail-image"
          src={image}
          alt={`Retrato de ${name}`}
          width={300}
          height={300}
          sizes="(min-width: 56rem) 320px, 80vw"
          loading="eager"
        />
      </div>
    </div>
  );
}
