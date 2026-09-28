import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const alt = "Furia Suplementos — Potencia tu rendimiento"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  const logo = await readFile(
    join(process.cwd(), "public", "brand", "logo.png")
  )
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090B",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Resplandores de marca */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -120,
            width: 620,
            height: 620,
            borderRadius: 9999,
            backgroundImage:
              "radial-gradient(circle, rgba(212,163,115,0.32) 0%, rgba(212,163,115,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -220,
            right: -140,
            width: 620,
            height: 620,
            borderRadius: 9999,
            backgroundImage:
              "radial-gradient(circle, rgba(255,85,0,0.22) 0%, rgba(255,85,0,0) 70%)",
          }}
        />

        {/* Lockup real de marca */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt="Furia Suplementos"
          width={340}
          height={242}
          style={{
            width: 340,
            height: 242,
            objectFit: "contain",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 28,
            padding: "10px 22px",
            borderRadius: 9999,
            border: "1px solid rgba(212,163,115,0.35)",
            backgroundColor: "rgba(212,163,115,0.10)",
            color: "#EFD4B8",
            fontSize: 20,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          Suplementos deportivos
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 30,
            fontSize: 78,
            fontWeight: 900,
            letterSpacing: -2,
            textTransform: "uppercase",
            color: "#FAFAFA",
            lineHeight: 1,
          }}
        >
          Potencia tu
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 6,
            fontSize: 78,
            fontWeight: 900,
            letterSpacing: -2,
            textTransform: "uppercase",
            color: "#D4A373",
            lineHeight: 1,
          }}
        >
          rendimiento
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 34,
            color: "#22C55E",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              backgroundColor: "#22C55E",
            }}
          />
          Pedí por WhatsApp
        </div>
      </div>
    ),
    size
  )
}
