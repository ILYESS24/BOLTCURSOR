import React, { useState } from "react";

interface PromptInputBoxProps {
  onSend?: (message: string) => void;
  placeholder?: string;
}

export const PromptInputBox: React.FC<PromptInputBoxProps> = ({
  onSend = () => {},
  placeholder = "Tapez votre message..."
}) => {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 w-full max-w-md">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent text-white border-none outline-none resize-none min-h-[60px] text-base"
      />
      <div className="flex justify-end mt-3">
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className={`px-4 py-2 rounded text-white font-medium transition-colors ${
            input.trim()
              ? "bg-blue-600 hover:bg-blue-500"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};