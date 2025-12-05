import React from "react";
import { PromptInputBox } from "./ui/ai-prompt-box";

export default function OrchidsInterface() {
  const handleSend = (message: string) => {
    alert(`Message envoyé: "${message}"`);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      <h1 className="text-6xl font-bold text-white mb-12 tracking-wider">
        AURION
      </h1>

      <PromptInputBox
        onSend={handleSend}
        placeholder="Tapez votre message..."
      />

      <p className="text-gray-400 text-sm mt-8 text-center">
        Interface IA - Version simplifiée
      </p>
    </div>
  );
}