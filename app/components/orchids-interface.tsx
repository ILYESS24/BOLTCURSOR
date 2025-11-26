import { useState, useRef } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { Menu } from "~/components/sidebar/Menu.client";
import { Typewriter } from "~/components/ui/typewriter-text";
import { ShaderAnimation } from "~/components/shader-animation";
import {
  Settings,
  Download,
  Paperclip,
  ChevronDown,
  ArrowUp,
  ExternalLink
} from "lucide-react";

export default function OrchidsInterface() {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("DeepSeek V3");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const models = [
    "DeepSeek V3",
    "DeepSeek Coder",
    "GPT-4",
    "GPT-4 Turbo",
    "GPT-3.5 Turbo",
    "Claude 3 Opus",
    "Claude 3 Sonnet",
    "Claude 3 Haiku"
  ];

  const handleTools = () => {
    alert("Tools panel - Coming soon!");
  };

  const handleImport = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        alert(`Importing ${files.length} file(s)`);
      }
    };
    fileInput.click();
  };

  const handleAttach = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        alert(`Attaching ${files.length} file(s)`);
      }
    };
    fileInput.click();
  };

  const handleModelSelect = () => {
    const currentIndex = models.indexOf(selectedModel);
    const nextModel = models[(currentIndex + 1) % models.length];
    setSelectedModel(nextModel);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const message = input.trim();
    const modelId = models.find(m => m === selectedModel) || "DeepSeek V3";
    
    // Map model names to API model IDs
    const modelMap: { [key: string]: string } = {
      "DeepSeek V3": "deepseek-chat",
      "DeepSeek Coder": "deepseek-coder",
      "GPT-4": "gpt-4",
      "GPT-4 Turbo": "gpt-4-turbo",
      "GPT-3.5 Turbo": "gpt-3.5-turbo",
      "Claude 3 Opus": "claude-3-opus",
      "Claude 3 Sonnet": "claude-3-sonnet",
      "Claude 3 Haiku": "claude-3-haiku"
    };
    
    const apiModel = modelMap[modelId] || "deepseek-chat";
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          model: apiModel,
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
        
        if (response.status === 429) {
          throw new Error(errorData.message || 'Quota API insuffisant. Veuillez réessayer plus tard ou recharger votre compte API.');
        }
        if (response.status === 402) {
          throw new Error(errorData.message || 'Paiement requis. Les crédits de l\'API IA sont épuisés. Veuillez recharger votre compte API ou configurer un mode de paiement.');
        }
        
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Clear input after successful send
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`Erreur lors de l'envoi:\n\n${errorMessage}`);
    }
  };


  return (
    <>
      <ClientOnly fallback={null}>
        {() => <Menu />}
      </ClientOnly>

      {/* Shader Animation Background */}
      <div className="fixed inset-0 z-0">
        <ClientOnly fallback={null}>
          {() => <ShaderAnimation />}
        </ClientOnly>
      </div>

      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
      {/* Main Content */}
      <main className="flex flex-col items-center px-8 pt-20 pb-32">

        {/* Main Logo */}
        <div className="flex flex-col items-center mb-16">
          <h1 className="text-8xl font-bold text-white mb-5 tracking-tight">aurion</h1>
          <div className="text-xl text-white/95 text-center max-w-2xl leading-relaxed min-h-[60px]">
            <ClientOnly fallback={<span>The AI Fullstack Engineer. Build prototypes, apps, and websites</span>}>
              {() => (
                <Typewriter
                  text={[
                    "Créez des applications complètes en quelques secondes",
                    "Générez du code professionnel avec l'IA",
                    "Développez sans limites, déployez en un clic",
                    "L'ingénieur fullstack IA qui transforme vos idées en réalité"
                  ]}
                  speed={50}
                  deleteSpeed={30}
                  delay={2000}
                  loop={true}
                  className="text-white/95"
                />
              )}
            </ClientOnly>
          </div>
        </div>

        {/* Main Input */}
        <div className="w-full max-w-3xl">
          <div className="relative bg-gray-900/98 backdrop-blur-sm rounded-3xl border border-gray-700/60 p-5 shadow-2xl">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Créez votre application en quelques secondes..."
              className={cn(
                "w-full min-h-[120px] bg-transparent text-white",
                "border-none resize-none",
                "!ring-0 !ring-offset-0 focus:!ring-0 focus:!ring-offset-0",
                "focus-visible:!ring-0 focus-visible:!ring-offset-0",
                "!outline-none focus:!outline-none focus-visible:!outline-none",
                "placeholder:text-gray-400/70 leading-relaxed"
              )}
              style={{ 
                fontSize: '18px',
                padding: '0',
                lineHeight: '1.6',
                outline: 'none !important',
                boxShadow: 'none !important',
                border: 'none !important'
              }}
            />
            
            {/* Input Footer */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-700/60">
              {/* Left side */}
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleTools}
                  variant="ghost" 
                  className="bg-white/10 text-white hover:bg-white/20 rounded-full h-9 px-4 border border-white/20"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  <span className="text-sm">Tools</span>
                </Button>
                <Button 
                  onClick={handleImport}
                  variant="ghost" 
                  className="bg-white/10 text-white hover:bg-white/20 rounded-full h-9 px-4 border border-white/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="text-sm">Import</span>
                </Button>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-3">
                <Paperclip 
                  onClick={handleAttach}
                  className="w-5 h-5 text-white/70 hover:text-white/90 cursor-pointer transition-colors" 
                />
                <div 
                  onClick={handleModelSelect}
                  className="flex items-center gap-2 bg-white/10 rounded-full px-3.5 py-2 border border-white/20 cursor-pointer hover:bg-white/20 transition-colors"
                >
                  <span className="text-blue-400 text-sm">◆</span>
                  <span className="text-white text-sm font-medium">{selectedModel}</span>
                  <ChevronDown className="w-4 h-4 text-white/60" />
                </div>
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="bg-white text-gray-900 hover:bg-gray-100 rounded-full h-9 w-9 flex items-center justify-center p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* External Libraries Links */}
          <div className="mt-8 w-full max-w-3xl">
            <div className="text-center mb-4">
              <h3 className="text-white/80 text-sm font-medium mb-3">External Libraries</h3>
            </div>
            <div className="flex items-center justify-center flex-wrap gap-3">
              <LibraryLink name="Animate" url="https://animate-j4ggoj3z4-ibagencys-projects.vercel.app/" />
              <LibraryLink name="V4" url="https://v4-qmfci1xj7-ibagencys-projects.vercel.app/" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-10 left-0 right-0 flex justify-center gap-6 text-white/60 text-sm flex-wrap">
        <a href="/privacy" className="hover:text-white/90 transition-colors">Privacy Policy</a>
        <a href="/terms" className="hover:text-white/90 transition-colors">Terms of Service</a>
        <a href="/mentions-legales" className="hover:text-white/90 transition-colors">Mentions Légales</a>
      </footer>
    </div>
    </>
  );
}

interface LibraryLinkProps {
  name: string;
  url: string;
}

function LibraryLink({ name, url }: LibraryLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/30 transition-colors text-xs"
    >
      <span>{name}</span>
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

