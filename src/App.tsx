import { useState } from "react";
import "./App.css";
import InstaPostGenerator from "./InstaPostGenerator";

function App() {
  const [currentView] = useState<"generator">("generator");

  return (
    <>
      <div className="App">
        {currentView === "generator" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <InstaPostGenerator />
          </div>
        )}
      </div>
    </>
  );
}

export default App;
