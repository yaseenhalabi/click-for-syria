import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [userName, setUserName] = useState("");

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
    <div style={{
      width: '300px',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#fff',
      color: '#333',
    }}>
      {/* Logo placeholder - teammate can replace */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '18px', fontWeight: 600 }}>Click For Syria</span>
      </div>

      {/* Name input */}
      <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>
        Your name
      </label>
      <input 
        type="text" 
        placeholder="Enter your name"
        value={userName}
        onChange={(e) => handleNameChange(e.target.value)}
        style={{ 
          width: '100%', 
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box',
          backgroundColor: '#fff',
          color: '#333',
        }}
      />
      
      {userName && (
        <p style={{ fontSize: '12px', color: '#007a33', marginTop: '8px' }}>
          ✓ Saved
        </p>
      )}
    </div>
  );
}

export default App;