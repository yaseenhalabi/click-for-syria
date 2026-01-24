import { useRef, useState, useCallback } from "react";
import * as htmlToImage from "html-to-image";
import background from "/src/assets/click4syria.png";

// Placeholder images - REPLACE THESE with your local imports or URLs
// e.g., import bgImage from './assets/certificate-bg.png';
// const BACKGROUND_URL =
//   "https://cdn.britannica.com/50/4550-050-3D264DD7/Flag-Syria.jpg"; //background

const OVERLAY_URL =
  "https://api.unblocksyria.com/files/logos/kvgixakw8jznkbdxvn8t22vi/vv69et8o6a3zw5hrisa7c580-chatgpt.png"; //company (should be non hardcoded later)

const CertificateGenerator = () => {
  const [name, setName] = useState("ChatGPT");
  const domEl = useRef<HTMLDivElement>(null);

  const downloadImage = useCallback(() => {
    if (domEl.current) {
      htmlToImage
        .toPng(domEl.current)
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "ClickForSyria.png";
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error("Failed to generate image", err);
        });
    }
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div
        id="certificate-node"
        ref={domEl}
        style={{
          width: "1080px",
          height: "1350px",
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",

          // 4. Content Layout (Flexbox to center text)
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          color: "#333",
          border: "5px solid #444", // Optional border
        }}
      >
        {/* --- OVERLAY IMAGE (e.g. Logo/Badge) --- */}
        <img
          src={OVERLAY_URL}
          alt="Overlay"
          style={{
            //position: "absolute", // Takes it out of the flex flow
            marginBottom: "50px",
            width: "300px", // Size of the logo
            opacity: 0.9, // Optional transparency
            zIndex: 10, // Ensures it sits on top of text
          }}
        />

        {/* --- TEXT CONTENT --- */}
        {/* Added a white background transparency to make text readable over complex images */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "50px",
            borderRadius: "20px",
            border: "2px solid #333",
            width: "80%",
            maxWidth: "800px",
          }}
        >
          <h1 style={{ color: "#207814ff", fontSize: "80px", margin: "-20px" }}>
            {name}
          </h1>
          <p style={{ fontSize: "30px" }}> is currently banned in Syria </p>
          <p style={{ fontSize: "30px" }}>
            Over 100 more services are currently unavailable
          </p>
          <p style={{ fontSize: "30px" }}>
            Share this with someone you know to help
          </p>
        </div>
      </div>
      {/* CONTROLS */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
        }}
      >
        <button
          onClick={downloadImage}
          style={{ padding: "40px", fontSize: "40px" }}
        >
          Download Image
        </button>
      </div>
    </div>
  );
};

export default CertificateGenerator;
