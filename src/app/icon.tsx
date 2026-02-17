import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const contentType = "image/png";

export default async function Icon() {
  const iconPath = path.join(process.cwd(), "public", "favicon.png");
  const icon = await readFile(iconPath);

  return new Response(icon, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
