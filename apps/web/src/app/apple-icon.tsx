import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#28342c",
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            border: "13px solid #eaecea",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "9px solid #eaecea",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
