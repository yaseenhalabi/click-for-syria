import { createRoot } from "react-dom/client";
import logoImagePath from "./assets/click-for-syria.png";
import syrianFlagPath from "./assets/syrian-flag.png";
import gmailLogoPath from "./assets/gmail.png";
import instagramLogoPath from "./assets/instagram.png";
import linkedinLogoPath from "./assets/linkedin.png";
import { useState, useEffect } from "react";
import instaBackground from "/public/assets/insta-background.png";
import { blockedSites } from "./shared/sites";

// Helper to get proper URL for assets - handles both inlined data URLs and file paths
const getAssetUrl = (assetPath: string) => {
  // If it's already a data URL (inlined by Vite), use it directly
  if (assetPath.startsWith("data:")) {
    return assetPath;
  }
  // Otherwise, get the extension URL
  return chrome.runtime.getURL(assetPath);
};

// Get the proper extension URL for assets
const logoImage = getAssetUrl(logoImagePath);
const syrianFlagImage = getAssetUrl(syrianFlagPath);
const gmailLogo = getAssetUrl(gmailLogoPath);
const instagramLogo = getAssetUrl(instagramLogoPath);
const linkedinLogo = getAssetUrl(linkedinLogoPath);

let unmountCallback: (() => void) | null = null;

// 1. Function to trigger the render logic (extracted for reuse)
const showNotice = (site: string, contacts: any[]) => {
  const existingRoot = document.getElementById("click-for-syria-host");
  if (existingRoot) return;

  const host = document.createElement("div");
  host.id = "click-for-syria-host";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const root = createRoot(shadow);

  unmountCallback = () => {
    root.unmount();
    host.remove();
    unmountCallback = null;
  };

  root.render(
    <Notification site={site} contacts={contacts} onHide={unmountCallback} />,
  );
};

// 2. Listen for "Push" notices from background (for SPA navigation)
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SHOW_NOTICE") {
    showNotice(message.site, message.contacts);
  }
});

// 3. The "Pull" fix: Ask the background script if we should show something RIGHT NOW
// This fixes the landing page issue because it runs as soon as the script loads.
chrome.runtime.sendMessage({ type: "CHECK_CURRENT_SITE" }, (response) => {
  if (response && response.shouldShow) {
    showNotice(response.site, response.contacts);
  }
});

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Important for external images
    img.onload = () => resolve(img);
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    img.src = src;
  });
};

const Notification = ({
  site,
  contacts,
  onHide,
}: {
  site: string;
  contacts: any[];
  onHide: () => void;
}) => {
  // Log contacts for debugging/verification purposes since they aren't displayed yet
  console.log(`Contacts for ${site}:`, contacts);
  const [step, setStep] = useState<"NOTICE" | "GENERATOR">("NOTICE");
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const emailBody = `Dear Team,\n\nI am writing to request that service access be enabled for users in Syria.\n\nFollowing the lifting of the comprehensive trade embargo on Syria announced by the U.S. Treasury in December 2025, all sanctions on Syria have now been lifted by both the United States and the European Union. Syria is no longer listed under OFAC's embargoed countries.\n\nFor reference:\n1- U.S. Treasury announcement: https://ofac.treasury.gov/media/934736/download?inline\n2- OFAC sanctions programs overview: https://ofac.treasury.gov/sanctions-programs-and-country-information\n\nI have also attached relevant supporting documentation from https://unblocksyria.com/resources.\n\nSeveral other companies have already enabled access. As millions of Syrians work to rebuild their country, access to global digital services is increasingly important.\n\nI kindly request a review of the current restriction and would appreciate confirmation on whether Syria can now be onboarded and supported on your platform.\n\nBest regards,\n[Your Name]`;

  const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contacts.map((c) => c.email).join(","))}&su=${encodeURIComponent("Request to Enable Service Access in Syria")}&body=${encodeURIComponent(emailBody)}`;

  const matchedSite = blockedSites.find((bs) => bs.domain === site);
  const displayName = matchedSite ? matchedSite.name : site;
  const siteLogo = getAssetUrl(`/assets/${displayName}.jpg`);
  const imageBackground = getAssetUrl(instaBackground);

  const handleDownload = async () => {
    try {
      const dataUrl = await generateImage();
      setPreviewDataUrl(dataUrl);
      const link = document.createElement("a");
      link.download = `UnblockSyria-${displayName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to generate image", error);
    }
  };

  // Extracted image generation so we can reuse it for preview and download
  const generateImage = async (): Promise<string> => {
    // 1. Create a virtual canvas
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Canvas context not available");

    // 2. Load images
    const [bgImg, logoImg] = await Promise.all([
      loadImage(imageBackground),
      loadImage(siteLogo),
    ]);

    // 3. Draw Background
    ctx.drawImage(bgImg, 0, 0, 1080, 1350);

    // Wait for fonts to be ready so text metrics match DOM
    if ((document as any).fonts && (document as any).fonts.ready) {
      try {
        await (document as any).fonts.ready;
      } catch (e) {
        // ignore font loading errors and proceed
      }
    }

    // --- NEW LAYOUT START ---

    // 4. Draw Logo (Centered at the top)
    ctx.drawImage(logoImg, 390, 20, 300, 300);

    // 5. Draw Text
    ctx.textAlign = "center";
    ctx.fillStyle = "#000000";
    ctx.font = "bold 55px 'Inter', sans-serif";

    const fullText = `${displayName} is still banned in Syria`;
    const words = fullText.split(" ");
    let line = "";
    let yPos = 420;
    const xPos = 540;
    const maxWidth = 800;

    if (ctx.measureText(fullText).width > maxWidth) {
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, xPos, yPos);
          line = words[n] + " ";
          yPos += 70;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, xPos, yPos);
    } else {
      ctx.fillText(fullText, xPos, yPos);
    }

    // --- NEW LAYOUT END ---

    return canvas.toDataURL("image/png");
  };

  // Generate preview as soon as the user opens the generator view
  useEffect(() => {
    let mounted = true;
    if (step === "GENERATOR" && !previewDataUrl) {
      generateImage()
        .then((url) => {
          if (mounted) setPreviewDataUrl(url);
        })
        .catch((err) => {
          console.error("Failed to generate preview image", err);
        });
    }
    return () => {
      mounted = false;
    };
  }, [step]);

  if (step === "GENERATOR") {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          zIndex: 2147483647,
          width: "600px",
          maxWidth: "90vw",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            padding: "16px 24px",
            borderBottom: "1px solid #eee",
            backgroundColor: "#fafafa",
          }}
        >
          <span
            onClick={() => setStep("NOTICE")}
            style={{
              position: "absolute",
              left: "24px",
              fontSize: "14px",
              color: "#666",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Back
          </span>
          <img
            src={logoImage}
            alt="Click for Syria"
            style={{ height: "28px", width: "auto" }}
          />
        </div>

        <div style={{ textAlign: "center", padding: "20px" }}>
          {/* Preview Container */}
          <div
            style={{
              width: "100%",
              height: "450px",
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              marginBottom: "20px",
              border: "1px solid #eee",
              borderRadius: "8px",
            }}
          >
            {previewDataUrl ? (
              <img
                src={previewDataUrl}
                alt="Generated preview"
                style={{
                  width: "1080px",
                  height: "1350px",
                  transform: "scale(0.33)",
                  transformOrigin: "top center",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "1080px",
                  height: "1350px",
                  // FIX: Use url() wrapper and ensure path is absolute
                  backgroundImage: `url("${imageBackground}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  transform: "scale(0.33)", // Adjusted scale to fit 600px width better
                  transformOrigin: "top center",
                }}
              >
                <img
                  src={siteLogo}
                  alt=""
                  style={{ marginBottom: "50px", width: "300px", zIndex: 10 }}
                  // FIX: Add crossOrigin if loading from external source (not needed for local assets but good practice)
                  crossOrigin="anonymous"
                />

                <div
                  style={{
                    marginTop: "20px",
                  }}
                >
                  <p style={{ fontSize: "35px", margin: "10px 0" }}>
                    {displayName} is currently banned in Syria
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              void handleDownload();
            }}
            style={{
              padding: "12px 30px",
              fontSize: "18px",
              cursor: "pointer",
              backgroundColor: "#195f0f",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
            }}
          >
            Download Post
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        zIndex: 2147483647,
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "#333",
        overflow: "hidden",
        width: "600px",
        maxWidth: "90vw",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "16px 24px",
          borderBottom: "1px solid #eee",
          backgroundColor: "#fafafa",
        }}
      >
        {/* Show me later - Left side */}
        <span
          onClick={onHide}
          style={{
            position: "absolute",
            left: "24px",
            fontSize: "14px",
            color: "#666",
            cursor: "pointer",
            textDecoration: "underline",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#333")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
        >
          Show me later
        </span>

        {/* Logo - Center */}
        <img
          src={logoImage}
          alt="Click for Syria"
          style={{
            height: "28px",
            width: "auto",
          }}
        />
      </div>

      {/* Main Content */}
      <div
        style={{
          padding: "24px 32px",
          textAlign: "center",
        }}
      >
        {/* Main Heading */}
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 400,
            margin: "0 0 32px 0",
            lineHeight: 1.3,
            color: "#1a1a1a",
          }}
        >
          Did you know that <strong> ChatGPT </strong> is{" "}
          <span style={{ color: "#ce1126", fontWeight: 700 }}>blocked</span> for
          Syrians?
        </h1>

        {/* Syrian Flag Image */}
        <div
          style={{
            marginBottom: "32px",
          }}
        >
          <img
            src={syrianFlagImage}
            alt="Syrian Flag"
            style={{
              width: "160px",
              height: "auto",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* Subheading */}
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            margin: "0 0 24px 0",
            color: "#1a1a1a",
          }}
        >
          You can help unblock it!
        </h2>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "0",
            justifyContent: "center",
          }}
        >
          {/* Send Email Button */}
          <a
            href={gmailLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 24px",
              backgroundColor: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "8px 0 0 8px",
              textDecoration: "none",
              color: "#1a1a1a",
              fontSize: "15px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f5f5f5";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
            }}
          >
            <img
              src={gmailLogo}
              alt="Gmail"
              style={{ width: "20px", height: "20px" }}
            />
            Send Email
          </a>

          {/* Generate Post Button */}
          <button
            onClick={() => setStep("GENERATOR")} // Swaps the view
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 24px",
              backgroundColor: "#fff",
              borderTop: "1px solid #e0e0e0",
              borderBottom: "1px solid #e0e0e0",
              borderLeft: "none",
              borderRight: "none",
              borderRadius: "0",
              color: "#1a1a1a",
              fontSize: "15px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f5f5f5";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
            }}
          >
            <img
              src={instagramLogo}
              alt="Instagram"
              style={{ width: "20px", height: "20px" }}
            />
            Generate Post
          </button>

          {/* Send Linkedin Button */}
          <button
            onClick={() => {
              // TODO: Implement LinkedIn sharing
              console.log("Send to LinkedIn");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 24px",
              backgroundColor: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "0 8px 8px 0",
              color: "#1a1a1a",
              fontSize: "15px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f5f5f5";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
            }}
          >
            <img
              src={linkedinLogo}
              alt="LinkedIn"
              style={{ width: "20px", height: "20px" }}
            />
            Send Linkedin
          </button>
        </div>
      </div>
    </div>
  );
};
