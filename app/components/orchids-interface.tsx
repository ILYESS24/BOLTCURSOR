// VERSION FINALE AVEC SHADER BACKGROUND
import React, { useState } from "react";
import { GradientBackground } from "./paper-design-shader-background";

export default function OrchidsInterface() {
  const [message, setMessage] = useState("");

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 0,
      padding: 0
    }}>
      <GradientBackground />
      <h1 style={{
        fontSize: '5rem',
        fontWeight: 'bold',
        marginBottom: '4rem',
        letterSpacing: '0.2em',
        textShadow: '0 0 30px rgba(255,255,255,0.3)'
      }}>
        AURION
      </h1>

      <div style={{
        backgroundColor: '#1F2023',
        border: '1px solid #444444',
        borderRadius: '24px',
        padding: '16px',
        width: '500px'
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
              onMouseOver={(e) => e.target.style.opacity = '1'}
              onMouseOut={(e) => e.target.style.opacity = '0.7'}
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
              onMouseOver={(e) => e.target.style.opacity = '1'}
              onMouseOut={(e) => e.target.style.opacity = '0.7'}
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
              onMouseOver={(e) => e.target.style.opacity = '1'}
              onMouseOut={(e) => e.target.style.opacity = '0.7'}
              title="Penser profondément"
            >
              🧠
            </button>
          </div>

          <button
            style={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            onClick={() => {
              if (message.trim()) {
                alert(`Message envoyé: "${message}"`);
                setMessage("");
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
        fontSize: '14px'
      }}>
        <p>Interface IA - Version Finale avec Shader</p>
        <p>Background GrainGradient - Effet visuel premium ! ✨</p>
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
}