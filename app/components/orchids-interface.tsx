import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { PromptInputBox } from "./ai-prompt-box"; // Re-imported PromptInputBox

// Composant Menu latéral qui glisse au survol
function SideMenu() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (event.clientX < 50) {
        setIsOpen(true);
      } else if (event.clientX > 350 && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 998,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        style={{
          position: 'fixed', top: 0, left: isOpen ? 0 : '-350px',
          width: '350px', height: '100vh', backgroundColor: '#D32F2F',
          zIndex: 999, transition: 'left 0.3s ease', padding: '20px',
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ color: 'white', marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Menu AURION</h3>
          <div style={{ marginBottom: '15px' }}>
            <a href="/" style={{ color: 'white', textDecoration: 'none', display: 'block', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', marginBottom: '10px' }}>🏠 Accueil</a>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>📋 Vos Chats</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function OrchidsInterface() {
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    const message = input.trim();
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model: 'deepseek-chat' }),
      });
      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      setInput("");
      alert('Message envoyé avec succès !');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`Erreur: ${errorMessage}`);
    }
  };

  return (
    <>
      <SideMenu />
      <div style={{
        minHeight: "100vh", backgroundColor: "#000", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "20px", fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
        <h1 style={{
          fontSize: "5rem", fontWeight: "bold", color: "white", marginBottom: "4rem",
          letterSpacing: "0.2em", textAlign: "center", textShadow: "0 0 30px rgba(255,255,255,0.3)"
        }}>
          AURION
        </h1>
        <div style={{ width: "100%", maxWidth: "700px" }}>
          <PromptInputBox
            onSend={(message, files) => {
              console.log("Message envoyé:", message, "Files:", files);
              alert(`Message: "${message}"${files?.length ? ` avec ${files.length} fichier(s)` : ''}`);
            }}
            placeholder="Décrivez votre application IA..."
            className="w-full"
          />
        </div>
        <div style={{
          marginTop: "4rem", textAlign: "center",
          color: "rgba(255, 255, 255, 0.5)", fontSize: "14px"
        }}>
          <p>Interface IA - Avec fenêtre latérale</p>
        </div>
      </div>
    </>
  );
}