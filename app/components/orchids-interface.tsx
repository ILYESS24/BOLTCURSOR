// VERSION FINALE OPTIMISÉE - Background directement intégré
import React, { useState } from "react";

const FinalInterface = () => {
  const [message, setMessage] = useState("");

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100vw',
      height: '100vh',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#000000'
    }}>
      <h1 style={{
        fontSize: '5rem',
        fontWeight: 'bold',
        marginBottom: '4rem',
        letterSpacing: '0.2em',
        textShadow: '0 0 30px rgba(255,255,255,0.3)',
        position: 'relative',
        zIndex: 10,
        fontFamily: 'Arial, sans-serif'
      }}>
        AURION
      </h1>

      <div style={{
        backgroundColor: '#1F2023',
        border: '1px solid #444444',
        borderRadius: '24px',
        padding: '16px',
        width: '500px',
        position: 'relative',
        zIndex: 10
      }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Décrivez votre application IA..."
          style={{
            width: '100%',
            minHeight: '44px',
            backgroundColor: 'transparent',
            color: 'white',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '16px',
            fontFamily: 'inherit',
            marginBottom: '12px'
          }}
        />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{display: 'flex', gap: '4px'}}>
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                opacity: 0.7
              }}
              onMouseOver={(e) => {
                e.target.style.opacity = '1';
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.opacity = '0.7';
                e.target.style.backgroundColor = 'transparent';
              }}
              title="Attacher un fichier"
            >
              📎
            </button>

            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                opacity: 0.7
              }}
              onMouseOver={(e) => {
                e.target.style.opacity = '1';
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.opacity = '0.7';
                e.target.style.backgroundColor = 'transparent';
              }}
              title="Recherche web"
            >
              🌐
            </button>

            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                opacity: 0.7
              }}
              onMouseOver={(e) => {
                e.target.style.opacity = '1';
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.opacity = '0.7';
                e.target.style.backgroundColor = 'transparent';
              }}
              title="Penser profondément"
            >
              🧠
            </button>
          </div>

          <button
            onClick={() => {
              if (message.trim()) {
                alert(`Message envoyé: "${message}"`);
                setMessage("");
              }
            }}
            disabled={!message.trim()}
            style={{
              backgroundColor: message.trim() ? 'white' : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: message.trim() ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              transition: 'all 0.2s ease',
              opacity: message.trim() ? 1 : 0.5
            }}
            onMouseOver={(e) => {
              if (message.trim()) {
                e.target.style.backgroundColor = '#f0f0f0';
                e.target.style.transform = 'scale(1.05)';
              }
            }}
            onMouseOut={(e) => {
              if (message.trim()) {
                e.target.style.backgroundColor = 'white';
                e.target.style.transform = 'scale(1)';
              }
            }}
            title="Envoyer le message"
          >
            ⬆️
          </button>
        </div>
      </div>

      <div style={{
        marginTop: '4rem',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '14px',
        position: 'relative',
        zIndex: 10
      }}>
        <p>Interface IA - Version Finale Optimisée</p>
        {message && (
          <p style={{
            marginTop: '8px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.7)'
          }}>
            Caractères: {message.length}
          </p>
        )}
      </div>
    </div>
  );
};

export default function OrchidsInterface() {
  return <FinalInterface />;
}