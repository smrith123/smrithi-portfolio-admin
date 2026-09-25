/** Mirrors smrithi-portfolio-backend/src/content/schemas.ts. */

export interface Cta {
  label: string;
  href: string;
}
export interface NavLink {
  label: string;
  href: string;
}
export type HeadingPart = { text: string; accent?: boolean | "mobile" };
export type HeadingLine = HeadingPart[];
export interface SectionHeading {
  eyebrow: string;
  lines: HeadingLine[];
}

export interface HeroSection {
  titleTop: string;
  titleMid: string;
  titleBottom: string;
  subtitle: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  portrait: string;
  texture: string;
}

export interface AboutSection {
  eyebrow: string;
  statement: string;
}

export interface ContentPiece {
  id: string;
  number: string;
  label: string;
  image: string;
}

export type PlatformId = "instagram" | "tiktok" | "youtube";

/** Mirrors MAX_PLATFORM_IMAGES in the backend schema, which is the real enforcement. */
export const MAX_PLATFORM_IMAGES = 6;

export interface PlatformImage {
  url: string;
  link?: string;
  alt?: string;
}
/** Each platform has its own small label (`eyebrow`) and heading (`lines`). */
export interface Platform extends SectionHeading {
  id: PlatformId;
  name: string;
  followers: string;
  handle: string;
  description: string;
  profileUrl: string;
  followLabel: string;
  collabUrl: string;
  collabLabel: string;
  images: PlatformImage[];
}

export interface JourneyStep {
  id: string;
  category: string;
  title: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tint: string;
  href?: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  width: number;
  height: number;
}

export interface MediaItem {
  id: string;
  title: string;
  poster: string;
  videoSrc?: string;
}

export interface CareerSection {
  portrait: string;
  cards: { id: string; lines: HeadingLine[]; meta: string }[];
  panel: { lines: HeadingLine[]; description: string; downloadCta: Cta; contactCta: Cta };
}

export interface ContactSection extends SectionHeading {
  description: string;
  instagram: { handle: string; url: string };
  email: string;
  background: string;
  form: Record<
    "nameLabel" | "namePlaceholder" | "emailLabel" | "emailPlaceholder" | "messageLabel" | "messagePlaceholder" | "submitLabel",
    string
  >;
}

export interface ContentPanel {
  id: string;
  lines: HeadingLine[];
  image: string;
  alt: string;
  href: string;
}

export type WorkCardSize = "tall" | "square";
export interface WorkCard {
  id: string;
  tag: string;
  title: string[];
  description?: string;
  image: string;
  alt: string;
  size: WorkCardSize;
  href?: string;
}
export interface WorkPage {
  title: string;
  banner: SectionHeading & { image: string; alt: string; cta: Cta };
  cards: WorkCard[];
}

export interface SectionDoc<T> {
  key: string;
  data: T;
  updatedAt: string;
  updatedBy?: string;
}

export type MediaKind = "image" | "video" | "document";
export interface MediaAsset {
  _id: string;
  url: string;
  key: string;
  kind: MediaKind;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  folder: string;
  createdAt: string;
}

export interface Submission {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
}
