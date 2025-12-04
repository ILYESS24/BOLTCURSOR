import React from "react";
import { ArrowUp, Paperclip, X, Globe, BrainCog, FolderCode } from "lucide-react";



// Utility function for className merging
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

// Simple Textarea Component
const Textarea = ({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn(
      "w-full bg-transparent border-none text-white placeholder-gray-400 resize-none outline-none",
      className
    )}
    {...props}
  />
);






// Main PromptInputBox Component - Version optimisée

interface PromptInputBoxProps {
  onSend?: (message: string, files?: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export const PromptInputBox = React.forwardRef((props: PromptInputBoxProps, ref: React.Ref<HTMLDivElement>) => {
  const { onSend = () => {}, isLoading = false, placeholder = "Tapez votre message...", className } = props;

  const [input, setInput] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [filePreviews, setFilePreviews] = React.useState<{ [key: string]: string }>({});
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [showSearch, setShowSearch] = React.useState(false);
  const [showThink, setShowThink] = React.useState(false);
  const [showCanvas, setShowCanvas] = React.useState(false);

  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  const isImageFile = (file: File) => file.type.startsWith("image/");

  const processFile = (file: File) => {
    if (!isImageFile(file)) {
      alert("Seuls les fichiers images sont autorisés");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Fichier trop volumineux (max 10MB)");
      return;
    }
    setFiles([file]);
    const reader = new FileReader();
    reader.onload = (e) => setFilePreviews({ [file.name]: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (input.trim() || files.length > 0) {
      let messagePrefix = "";
      if (showSearch) messagePrefix = "[Recherche: ";
      else if (showThink) messagePrefix = "[Réflexion: ";
      else if (showCanvas) messagePrefix = "[Création: ";

      const formattedInput = messagePrefix ? `${messagePrefix}${input}]` : input;
      onSend(formattedInput, files);
      setInput("");
      setFiles([]);
      setFilePreviews({});
      setShowSearch(false);
      setShowThink(false);
      setShowCanvas(false);
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
      className={cn("w-full max-w-2xl mx-auto", className)}
      style={{
        backgroundColor: "#1F2023",
        borderRadius: "20px",
        border: "1px solid #444444",
        padding: "16px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.24)",
        margin: "20px auto"
      }}
    >
      {/* Aperçu des images */}
      {files.length > 0 && (
        <div style={{ marginBottom: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {files.map((file, index) => (
            <div key={index} style={{ position: "relative" }}>
              {filePreviews[file.name] && (
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: "1px solid #555"
                  }}
                  onClick={() => setSelectedImage(filePreviews[file.name])}
                >
                  <img
                    src={filePreviews[file.name]}
                    alt={file.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFiles([]);
                      setFilePreviews({});
                    }}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      backgroundColor: "rgba(0,0,0,0.7)",
                      border: "none",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                  >
                    <X size={12} color="white" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Zone de texte */}
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          showSearch ? "Rechercher sur le web..." :
          showThink ? "Réfléchir en profondeur..." :
          showCanvas ? "Créer sur le canvas..." :
          placeholder
        }
        disabled={isLoading}
        style={{
          width: "100%",
          minHeight: "60px",
          backgroundColor: "transparent",
          border: "none",
          color: "#ffffff",
          fontSize: "16px",
          resize: "none",
          outline: "none"
        }}
      />

      {/* Barre d'actions */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "12px",
        gap: "12px"
      }}>
        {/* Boutons de mode */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Bouton upload */}
          <button
            onClick={() => uploadInputRef.current?.click()}
            disabled={isLoading}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "transparent",
              color: "#9CA3AF",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(107,114,128,0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <Paperclip size={16} />
          </button>

          {/* Bouton Recherche */}
          <button
            onClick={() => {
              setShowSearch(!showSearch);
              setShowThink(false);
              setShowCanvas(false);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "16px",
              border: showSearch ? "1px solid #1EAEDB" : "1px solid transparent",
              backgroundColor: showSearch ? "rgba(30,174,219,0.1)" : "transparent",
              color: showSearch ? "#1EAEDB" : "#9CA3AF",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s"
            }}
          >
            <Globe size={14} />
            {showSearch && <span>Recherche</span>}
          </button>

          {/* Bouton Réflexion */}
          <button
            onClick={() => {
              setShowThink(!showThink);
              setShowSearch(false);
              setShowCanvas(false);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "16px",
              border: showThink ? "1px solid #8B5CF6" : "1px solid transparent",
              backgroundColor: showThink ? "rgba(139,92,246,0.1)" : "transparent",
              color: showThink ? "#8B5CF6" : "#9CA3AF",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s"
            }}
          >
            <BrainCog size={14} />
            {showThink && <span>Réflexion</span>}
          </button>

          {/* Bouton Canvas */}
          <button
            onClick={() => {
              setShowCanvas(!showCanvas);
              setShowSearch(false);
              setShowThink(false);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "16px",
              border: showCanvas ? "1px solid #F97316" : "1px solid transparent",
              backgroundColor: showCanvas ? "rgba(249,115,22,0.1)" : "transparent",
              color: showCanvas ? "#F97316" : "#9CA3AF",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s"
            }}
          >
            <FolderCode size={14} />
            {showCanvas && <span>Canvas</span>}
          </button>
        </div>

        {/* Bouton d'envoi */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || !hasContent}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: hasContent ? "#ffffff" : "transparent",
            color: hasContent ? "#1F2023" : "#9CA3AF",
            cursor: hasContent ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            boxShadow: hasContent ? "0 2px 8px rgba(255,255,255,0.2)" : "none"
          }}
        >
          <ArrowUp size={18} />
        </button>
      </div>

      {/* Input caché pour upload */}
      <input
        ref={uploadInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) processFile(e.target.files[0]);
          if (e.target) e.target.value = "";
        }}
        accept="image/*"
      />

      {/* Modal d'image */}
      {selectedImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <img
              src={selectedImage}
              alt="Aperçu"
              style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "8px" }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "rgba(0,0,0,0.7)",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

PromptInputBox.displayName = "PromptInputBox";
