import { useRef, useState, useCallback, useEffect } from "react";
import * as htmlToImage from "html-to-image";
import background from "/src/assets/insta-background.png";
import Papa from "papaparse";

const getCurrentPageUrl = () => {
  return window.location.href;
};

type csvrow = {
  name: string;
  url: string;
};

const InstaPostGenerator = () => {
  const [searchUrl] = useState(getCurrentPageUrl());
  const [name, setName] = useState("ChatGPT");
  const [image, setImage] = useState("/src/assets/ChatGPT.jpg");
  const domEl = useRef<HTMLDivElement>(null);

  const downloadImage = useCallback(() => {
    if (domEl.current) {
      htmlToImage
        .toPng(domEl.current, {
          width: 1080,
          height: 1350,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
          },
        })
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

  useEffect(() => {
    Papa.parse("/data.csv", {
      download: true,
      header: true,
      complete: (results) => {
        const rows = results.data as csvrow[];
        const foundRow = rows.find((row) => row.url === searchUrl.trim());

        if (foundRow) {
          setName(foundRow.name);
          setImage(`/assets/${name}.png`);
        }
      },
      error: (err) => {
        console.error("Error parsing CSV:", err);
      },
    });
  }, [searchUrl]);

  const previewScale = 0.4;

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <div
        style={{
          width: "100%",
          height: `${1350 * previewScale}px`,
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
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
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            color: "#333",
            border: "5px solid #444",

            transform: `scale(${previewScale})`,
            transformOrigin: "top center",
          }}
        >
          <img
            src={image}
            alt="Overlay"
            style={{
              marginBottom: "50px",
              width: "300px",
              opacity: 0.9,
              zIndex: 10,
            }}
          />

          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: "50px",
              borderRadius: "20px",
              border: "2px solid #fffcfcff",
              width: "80%",
              maxWidth: "800px",
            }}
          >
            <h1
              style={{
                fontFamily: "Special Gothic Expanded One, sans-serif",
                color: "#207814ff",
                fontSize: "80px",
                marginTop: "-20px",
                marginBottom: "-10px",
              }}
            >
              {name}
            </h1>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "30px" }}>
              is currently banned in Syria
            </p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "30px" }}>
              Over 100 more services are currently unavailable
            </p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "30px" }}>
              Share this to spread the word
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "20px", padding: "5px" }}>
        <button
          onClick={downloadImage}
          style={{
            padding: "10px 40px",
            fontSize: "24px",
            cursor: "pointer",
            backgroundColor: "#195f0fff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Download Image
        </button>
      </div>
    </div>
  );
};

export default InstaPostGenerator;
