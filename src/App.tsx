import { useState, useEffect } from "react";
import logoImagePath from "./assets/click-for-syria.png";
import "./App.css";

function App() {
  const [userName, setUserName] = useState("");

  // Helper to get proper URL for assets - handles both inlined data URLs and file paths
  const getAssetUrl = (assetPath: string) => {
    // If it's already a data URL (inlined by Vite), use it directly
    if (assetPath.startsWith("data:")) {
      return assetPath;
    }
    // Otherwise, get the extension URL
    return chrome.runtime.getURL(assetPath);
  };
  const logoImage = getAssetUrl(logoImagePath);

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.sync) {
      chrome.storage.sync.get(["userName"], (result) => {
        if (typeof result.userName === "string") {
          setUserName(result.userName);
        }
      });
    }
  }, []);

  const handleNameChange = (val: string) => {
    setUserName(val);
    if (typeof chrome !== "undefined" && chrome.storage?.sync) {
      chrome.storage.sync.set({ userName: val });
    }
  };

  return (
    <div
      style={{
        width: "300px",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundColor: "#fff",
        color: "#333",
      }}
    >
      {/* Logo placeholder - teammate can replace */}
      <img
        src={logoImage}
        alt="Click for Syria"
        style={{
          height: "40px",
          width: "auto",
          marginBottom: "30px",
        }}
      />

      {/* Name input */}
      <label
        style={{
          display: "block",
          fontSize: "14px",
          marginBottom: "8px",
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        }}
      >
        Your name
      </label>
      <input
        type="text"
        placeholder="Enter your name"
        value={userName}
        onChange={(e) => handleNameChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "14px",
          boxSizing: "border-box",
          backgroundColor: "#fff",
          color: "#333",
        }}
      />

      {userName && (
        <p style={{ fontSize: "12px", color: "#007a33", marginTop: "8px" }}>
          ✓ Saved
        </p>
      )}
      <a
        href="https://unblocksyria.com/en"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          marginTop: "20px",
          fontSize: "14px",
          color: "#b40c1aff",
          textDecoration: "underline",
        }}
      >
        Learn more here!
      </a>
    </div>
  );
}

export default App;
