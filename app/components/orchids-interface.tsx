// VERSION FINALE ULTRA SIMPLIFIÉE - AUCUN EMOJI
import React from "react";
import { PromptInputBox } from "./ui/ai-prompt-box";
import { GradientBackground } from "./paper-design-shader-background";

export default function OrchidsInterface() {
  const handleSend = (message: string, files?: File[]) => {
    if (message.trim() || (files && files.length > 0)) {
      alert(`Message: "${message}"${files?.length ? ` avec ${files.length} fichier(s)` : ''}`);
    }
  };

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
      padding: 0,
      overflow: 'hidden'
    }}>
      <GradientBackground />

      <h1 style={{
        fontSize: '5rem',
        fontWeight: 'bold',
        marginBottom: '4rem',
        letterSpacing: '0.2em',
        textShadow: '0 0 30px rgba(255,255,255,0.3)',
        position: 'relative',
        zIndex: 10
      }}>
        AURION
      </h1>

      <PromptInputBox
        onSend={handleSend}
        placeholder="Tapez votre message..."
        className="w-[500px]"
      />

      <div style={{
        marginTop: '4rem',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '14px',
        position: 'relative',
        zIndex: 10
      }}>
        <p>Interface IA - Version Ultra Simplifiée</p>
        <p>Aucun emoji - Interface minimaliste ✨</p>
      </div>
    </div>
  );
}