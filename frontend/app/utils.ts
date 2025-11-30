export const API_ROOT =
  process.env.NEXT_PUBLIC_API_ROOT || "http://localhost:8000";

export type Scene = { narration: string; image_prompt: string };

export function isVideoFile(filename: string) {
  const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
  return videoExtensions.some(ext =>
    filename.toLowerCase().endsWith(ext)
  );
}
