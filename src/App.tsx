import { useState } from "react";
import "./App.css";
import InstaPostGenerator from "./InstaPostGenerator";
import SelectEmail from "./SelectEmail";

function App() {
  const [currentView, setCurrentView] = useState<"generator" | "email">("generator");

  return (
    <>
      <div className="App">
        {currentView === "generator" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <InstaPostGenerator />
            <button
              onClick={() => setCurrentView("email")}
              style={{
                padding: "10px 40px",
                fontSize: "24px",
                cursor: "pointer",
                backgroundColor: "#007a33",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontFamily: "Inter, sans-serif",
                width: "100%",
                maxWidth: "400px"
              }}
            >
              Send Email
            </button>
          </div>
        )}
        {currentView === "email" && (
          <SelectEmail onBack={() => setCurrentView("generator")} />
        )}
      </div>
    </>
  );
}

export default App;
