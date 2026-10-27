import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_TAGLINE } from "@/lib/site";

export const alt = `leveling0 - ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function readPublic(relativePath: string) {
  return readFile(join(process.cwd(), "public", relativePath));
}

async function dataUri(relativePath: string) {
  const file = await readPublic(relativePath);
  return `data:image/png;base64,${file.toString("base64")}`;
}

export default async function Image() {
  const [mark, board, regular, semibold] = await Promise.all([
    dataUri("brand/leveling0-mark-256.png"),
    dataUri("og/board-light.png"),
    readPublic("og/Geist-Regular.ttf"),
    readPublic("og/Geist-SemiBold.ttf"),
  ]);

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "linear-gradient(135deg, #fae6de 0%, #fbfaf9 42%)",
        color: "#1b1a18",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 52,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 14,
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: satori renders plain img */}
        <img src={mark} alt="" width={52} height={52} />
        <span
          style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.3px" }}
        >
          leveling0
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 124,
          display: "flex",
          justifyContent: "center",
          fontSize: 76,
          fontWeight: 600,
          letterSpacing: "-1.6px",
          lineHeight: 1.05,
        }}
      >
        Simply, a todo app.
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 222,
          display: "flex",
          justifyContent: "center",
          fontSize: 32,
          lineHeight: 1.3,
          color: "#5e5c56",
        }}
      >
        Three columns, tags, due dates, markdown. No account needed.
      </div>

      <div
        style={{
          position: "absolute",
          left: 80,
          top: 300,
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
    {
      ...size,
      fonts: [
        { name: "Geist", data: regular, weight: 400 },
        { name: "Geist", data: semibold, weight: 600 },
      ],
    },
  );
}
