"use client";

import Image from "next/image";
import type { IconKey } from "@/lib/icons";
import { iconSrc } from "@/lib/icons";

interface AppIconProps {
  name: IconKey | string;
  size?: number;
  className?: string;
  alt?: string;
}

export default function AppIcon({
  name,
  size = 32,
  className = "",
  alt = "",
}: AppIconProps) {
  return (
    <Image
      src={iconSrc(name)}
      alt={alt || name}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      unoptimized
    />
  );
}
