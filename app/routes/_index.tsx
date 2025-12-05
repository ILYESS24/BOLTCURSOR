import { 
  Sparkles, 
  Paperclip, 
  ArrowUp, 
  Wrench, 
  Download,
  ChevronDown,
  ExternalLink,
  BookOpen
} from "lucide-react";
import { useState, useEffect } from "react";
import { Warp } from "@paper-design/shaders-react";
import { useFetcher } from "@remix-run/react";
import { chatStore } from "~/lib/stores/chat";
import { DEFAULT_MODEL } from "~/lib/ai-config";
import type { AIModel } from "~/lib/ai-config";

export default function Index() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const fetcher = useFetcher();
  
  // Charger tous les modèles depuis l'API
  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        if (data.models && data.models.length > 0) {
          setModels(data.models);
        }
        setIsLoadingModels(false);
      })
      .catch(err => {
        console.error('Error loading models:', err);
        setIsLoadingModels(false);
      });
  }, []);

  // Logs de débogage pour le fetcher (au cas où)
  useEffect(() => {
    console.log('🔍 Fetcher state:', fetcher.state);
    if (fetcher.data) {
      console.log('🔍 Fetcher data:', fetcher.data);
    }
  }, [fetcher.state, fetcher.data]);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      console.warn('⚠️ Prompt vide, envoi annulé');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    const messageToSend = prompt.trim();
    const modelToUse = selectedModel;
    
    console.log('📤 ===== DÉBUT ENVOI =====');
    console.log('📝 Message:', messageToSend);
    console.log('🤖 Modèle:', modelToUse);
    
    // Démarrer le chat
    chatStore.setKey('started', true);
    chatStore.setKey('showChat', true);
    
    try {
      // Envoyer le prompt au backend avec fetch() directement
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          model: modelToUse
        })
      });
      
      console.log('📡 Réponse reçue, status:', response.status);
      console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('📦 Données reçues:', data);
      
      if (!response.ok) {
        let errorMessage = data.message || data.error || `Erreur HTTP ${response.status}`;
        
        // Message d'aide pour les erreurs 401
        if (response.status === 401 && data.help) {
          errorMessage += `\n\n💡 ${data.help}`;
        }
        
        setError(errorMessage);
        console.error('❌ Erreur:', errorMessage);
        console.error('❌ Détails complets:', data);
        if (data.help) {
          console.error('💡 Aide:', data.help);
        }
      } else if (data.error) {
        const errorMessage = data.message || data.error || 'Une erreur est survenue';
        setError(errorMessage);
        console.error('❌ Erreur dans la réponse:', errorMessage);
        console.error('❌ Détails complets:', data);
      } else if (data.response) {
        setError(null);
        setLastResponse(data.response);
        console.log('✅ Réponse reçue avec succès!');
        console.log('📊 Modèle utilisé:', data.model);
        console.log('💰 Coût:', data.cost);
        console.log('📝 Réponse complète:', data.response);
      } else {
        setError('Réponse inattendue du serveur');
        console.error('⚠️ Réponse inattendue:', data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur réseau inconnue';
      setError(`Erreur réseau: ${errorMessage}`);
      console.error('❌ Erreur réseau:', err);
    } finally {
      setIsSubmitting(false);
      console.log('🏁 ===== FIN ENVOI =====');
    }
    
    // Réinitialiser le prompt
    setPrompt("");
  };
  
  const selectedModelData = models.find(m => m.id === selectedModel) || models[0] || { id: DEFAULT_MODEL, name: 'GPT-4 Turbo', description: 'Chargement...' };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="relative h-[calc(100vh-2rem)] w-full overflow-hidden rounded-3xl font-sans text-white selection:bg-pink-500/30 bg-black">
        {/* Warp Shader Background with warm colors */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Warp
          style={{ height: "100%", width: "100%" }}
          proportion={0.45}
          softness={1}
          distortion={0.25}
          swirl={0.8}
          swirlIterations={10}
          shape="checks"
          shapeScale={0.1}
          scale={1}
          rotation={0}
          speed={1}
          colors={["hsl(45, 100%, 60%)", "hsl(25, 100%, 55%)", "hsl(15, 100%, 50%)", "hsl(340, 85%, 55%)", "hsl(350, 90%, 60%)"]}
        />
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center overflow-y-auto">
        
        {/* Hero Logo/Title */}
        <div className="mb-8">
          <h1 className="text-7xl font-medium tracking-tight text-white">AURION</h1>
        </div>

        <p className="mb-12 text-xl text-white/90 font-light">
          Développé par les dernières et plus puissantes IA du marché
        </p>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-4 w-full max-w-2xl p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-red-400 font-bold">⚠️</span>
              <div className="flex-1">
                <p className="text-red-300 font-semibold mb-1">Erreur</p>
                <p className="text-red-200 text-sm">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statut de chargement */}
        {isSubmitting && (
          <div className="mb-4 w-full max-w-2xl p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-300 text-sm">Envoi en cours...</p>
            </div>
          </div>
        )}

        {/* Affichage de la réponse */}
        {lastResponse && (
          <div className="mb-4 w-full max-w-2xl p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-green-400 font-bold">✅</span>
              <div className="flex-1">
                <p className="text-green-300 font-semibold mb-2">Réponse de l'IA:</p>
                <p className="text-green-200 text-sm whitespace-pre-wrap">{lastResponse}</p>
                <button
                  onClick={() => setLastResponse(null)}
                  className="mt-2 text-xs text-green-400 hover:text-green-300 underline"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="w-full max-w-2xl">
          <div className="relative rounded-2xl bg-[#1a1a1a] p-4 shadow-2xl ring-1 ring-white/10">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Make me a landing page for a"
              className="h-32 w-full resize-none bg-transparent text-lg text-white placeholder-white/40 focus:outline-none"
            />
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium hover:bg-white/10 transition-colors">
                  <Wrench className="h-4 w-4" />
                  Tools
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium hover:bg-white/10 transition-colors">
                  <Download className="h-4 w-4" />
                  Import
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white">
                  <Paperclip className="h-4 w-4" />
                </button>
                
                {/* Model Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowModelSelector(!showModelSelector)}
                    className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-sm font-medium hover:bg-white/10 border border-white/10"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span className="max-w-[120px] truncate">{selectedModelData.name}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  
                  {showModelSelector && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowModelSelector(false)}
                      />
                      <div className="absolute bottom-full mb-2 left-0 w-80 max-h-[500px] overflow-y-auto bg-[#1a1a1a] border border-white/20 rounded-lg shadow-2xl z-50">
                        {isLoadingModels ? (
                          <div className="p-4 text-center text-white/60">Chargement des modèles...</div>
                        ) : (
                          <div className="p-2 space-y-1">
                            <div className="px-3 py-2 text-xs font-semibold text-white/40 uppercase border-b border-white/10 mb-1">
                              {models.length} modèles disponibles
                            </div>
                            {models.map((model) => (
                              <button
                                key={model.id}
                                onClick={() => {
                                  setSelectedModel(model.id);
                                  setShowModelSelector(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                  selectedModel === model.id
                                    ? 'bg-white/20 text-white'
                                    : 'text-white/80 hover:bg-white/10'
                                }`}
                              >
                                <div className="font-medium">{model.name}</div>
                                <div className="text-xs text-white/60 mt-0.5 line-clamp-2">{model.description}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !prompt.trim()}
                  className="rounded-lg bg-white/20 p-2 hover:bg-white/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Boutons de bibliothèques externes en dessous du prompt */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <a 
              href="https://animate-j4ggoj3z4-ibagencys-projects.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Bibliothèque 1
              <ExternalLink className="h-3 w-3" />
            </a>
            <a 
              href="https://v4-qmfci1xj7-ibagencys-projects.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Bibliothèque 2
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}