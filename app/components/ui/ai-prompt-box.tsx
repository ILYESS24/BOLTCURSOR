// INTERFACE ULTRA SIMPLIFIÉE - AUCUN EMOJI
import React, { useState, useRef } from "react";

interface PromptInputBoxProps {
  onSend?: (message: string, files?: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export const PromptInputBox = React.forwardRef((props: PromptInputBoxProps, ref: React.Ref<HTMLDivElement>) => {
  const { onSend = () => {}, isLoading = false, placeholder = "Tapez votre message...", className } = props;

  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (input.trim() || files.length > 0) {
      onSend(input, files);
      setInput("");
      setFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasContent = input.trim() !== "" || files.length > 0;

  return (
    <div
      ref={ref}
      className={`rounded-3xl border border-gray-600 bg-gray-900 p-4 shadow-lg ${className || ""}`}
    >
      {/* Zone de texte simplifiée */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full min-h-[60px] bg-transparent text-white border-none outline-none resize-none text-base"
        disabled={isLoading}
      />

      {/* Boutons ultra simplifiés */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {/* Bouton File uniquement */}
          <button
            onClick={() => uploadInputRef.current?.click()}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            disabled={isLoading}
          >
            File
            <input
              ref={uploadInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFiles([e.target.files[0]]);
                }
                if (e.target) e.target.value = "";
              }}
              accept="image/*"
            />
          </button>
        </div>

        {/* Bouton d'envoi */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || !hasContent}
          className={`px-4 py-2 rounded-full text-white font-medium transition-colors ${
            hasContent && !isLoading
              ? "bg-blue-600 hover:bg-blue-500"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          {isLoading ? "..." : "Envoyer"}
        </button>
      </div>
    </div>
  );
});

PromptInputBox.displayName = "PromptInputBox";