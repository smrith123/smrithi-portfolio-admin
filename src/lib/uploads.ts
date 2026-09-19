/**
 * Mirrors what the API accepts (backend src/middleware/upload.ts: the types
 * and a 100MB request cap) and Cloudinary's free-plan file caps, so a file
 * that would be rejected is refused before it is sent instead of after a
 * long upload. Raise the caps here if the Cloudinary plan is upgraded.
 */
const MB = 1024 * 1024;
const MAX_REQUEST_MB = 100;
const MAX_FILES = 10;
const CAP_MB = { image: 10, video: 100, document: 10 } as const;

export const ACCEPT = {
  image: "image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml",
  video: "video/mp4,video/webm,video/quicktime",
  document: "application/pdf",
} as const;
export const ACCEPT_ALL = Object.values(ACCEPT).join(",");

const kindOf = (file: File) =>
  (Object.keys(ACCEPT) as (keyof typeof ACCEPT)[]).find((k) => ACCEPT[k].split(",").includes(file.type));

/** A message to show instead of uploading, or null when the selection is fine. */
export function uploadProblem(files: File[]): string | null {
  if (files.length > MAX_FILES) return `Upload at most ${MAX_FILES} files at a time.`;
  for (const file of files) {
    const kind = kindOf(file);
    if (!kind) return `${file.name} can't be uploaded. Use JPG, PNG, WebP, AVIF, GIF, SVG, MP4, WebM, MOV or PDF.`;
    if (file.size > CAP_MB[kind] * MB) {
      return `${file.name} is ${(file.size / MB).toFixed(1)}MB; ${kind === "document" ? "PDFs" : `${kind}s`} can be at most ${CAP_MB[kind]}MB.`;
    }
  }
  const total = files.reduce((sum, f) => sum + f.size, 0);
  if (total > MAX_REQUEST_MB * MB) return `That's ${(total / MB).toFixed(0)}MB in one go; upload at most ${MAX_REQUEST_MB}MB at a time.`;
  return null;
}
