import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { PromptInputBox } from "./ai-prompt-box";

// Composant Menu latéral qui glisse au survol
function SideMenu() {
  const [isOpen, setIsOpen] = useState(false);

  // Gestionnaire d'événements pour le survol
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Ouvrir le menu si la souris est près du bord gauche
      if (event.clientX < 50) {
        setIsOpen(true);
      }
      // Fermer le menu si la souris s'éloigne
      else if (event.clientX > 350 && isOpen) {
        setIsOpen(false);
      }
    };

    // Ajouter l'écouteur d'événements
    document.addEventListener('mousemove', handleMouseMove);

    // Nettoyer l'écouteur
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay pour fermer le menu */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu latéral */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: isOpen ? 0 : '-350px',
          width: '350px',
          height: '100vh',
          backgroundColor: '#D32F2F',
          zIndex: 999,
          transition: 'left 0.3s ease',
          padding: '20px',
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ color: 'white', marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Menu AURION</h3>
          <div style={{ marginBottom: '15px' }}>
            <a
              href="/"
              style={{
                color: 'white',
                textDecoration: 'none',
                display: 'block',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                marginBottom: '10px'
              }}
            >
              🏠 Accueil
            </a>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              📋 Vos Chats
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function OrchidsInterface() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{ textAlign: "center", color: "white" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "2rem" }}>AURION</h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>Test de l'interface</p>

        {/* Test simple du PromptInputBox */}
        <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
          <PromptInputBox
            onSend={(message, files) => {
              console.log("Message:", message, "Files:", files);
              alert(`Envoyé: ${message}`);
            }}
            placeholder="Tapez votre message..."
          />
        </div>
      </div>
    </div>
  );
}