import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_TAGLINE, SITE_URL } from "@/lib/site";

export const alt = `leveling0 - ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function dataUri(relativePath: string) {
  const file = await readFile(join(process.cwd(), "public", relativePath));
  return `data:image/png;base64,${file.toString("base64")}`;
}

// Static at build time: no request-time APIs are used, so Next renders this
// once and serves the PNG. Uses the bundled Inter font; Geist is not shipped
// as a file next/og can read.
export default async function Image() {
  const [mark, board] = await Promise.all([
    dataUri("brand/leveling0-mark-256.png"),
    dataUri("og/board-light.png"),
  ]);

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        // Ember tint fading to the canvas. Satori handles linear gradients
        // with solid stops; radial gradients render wrong.
        background: "linear-gradient(135deg, #fae6de 0%, #fbfaf9 42%)",
        color: "#1b1a18",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 60,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: satori renders plain img */}
        <img src={mark} alt="" width={48} height={48} />
        <span
          style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.3px" }}
        >
          leveling0
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          right: 80,
          top: 70,
          fontSize: 22,
          fontWeight: 500,
          color: "#c23a10",
        }}
      >
        {SITE_URL.replace("https://", "")}
      </div>

      <div
        style={{
          position: "absolute",
          left: 80,
          top: 138,
          fontSize: 66,
          fontWeight: 600,
          letterSpacing: "-1.3px",
          lineHeight: 1.05,
        }}
      >
        Simply, a todo app.
      </div>

      <div
        style={{
          position: "absolute",
          left: 80,
          top: 226,
          fontSize: 25,
          lineHeight: 1.4,
          color: "#6c6a64",
        }}
      >
        Three columns, tags, due dates, markdown. Works without an account.
      </div>

      <div
        style={{
          position: "absolute",
          left: 80,
          top: 306,
          display: "flex",
          width: 1040,
          height: 446,
          overflow: "hidden",
          borderRadius: "14px 14px 0 0",
          border: "1px solid #e7e5e1",
          boxShadow:
            "0 8px 20px rgba(20, 16, 12, 0.10), 0 24px 56px rgba(20, 16, 12, 0.16)",
          background: "#ffffff",
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: satori renders plain img */}
        <img src={board} alt="" width={1040} height={446} />
      </div>
    </div>,
    size,
  );
}
