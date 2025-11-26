import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/header/Header';
import { DefaultNavBar } from '~/components/navbar/NavBar.client';
import { Sparkles, Zap, Code, Palette } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [
    { title: 'About - Aurion' },
    { name: 'description', content: 'Découvrez Aurion, le générateur de sites et applications UI/UX moderne propulsé par DeepSeek V3' },
  ];
};

export const loader = () => json({});

export default function About() {
  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <ClientOnly>{() => <DefaultNavBar />}</ClientOnly>
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12 pt-24">
        <div className="max-w-5xl mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-7xl font-bold text-white mb-6 tracking-tight">
              À propos d&apos;Aurion
            </h1>
            <p className="text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              L&apos;avenir de la création web, propulsé par l&apos;intelligence artificielle
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-12">
            {/* Introduction */}
            <div className="aurion-hero-card">
              <div className="aurion-hero-content relative z-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-8 h-8 text-white/90" strokeWidth={2} />
                    <h2 className="text-3xl font-semibold text-white">Une révolution dans la création web</h2>
                  </div>
                  <p className="text-lg text-white/80 leading-relaxed">
                    Aurion est bien plus qu&apos;un simple générateur de sites. C&apos;est une plateforme intelligente qui transforme vos idées en interfaces modernes et élégantes en quelques instants. Conçu pour les créateurs, les développeurs et les visionnaires qui cherchent à donner vie à leurs concepts sans les contraintes techniques traditionnelles.
                  </p>
                </div>
              </div>
            </div>

            {/* DeepSeek V3 Section */}
            <div className="aurion-hero-card">
              <div className="aurion-hero-content relative z-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-8 h-8 text-white/90" strokeWidth={2} />
                    <h2 className="text-3xl font-semibold text-white">Propulsé par DeepSeek V3</h2>
                  </div>
                  <p className="text-lg text-white/80 leading-relaxed mb-4">
                    Au cœur d&apos;Aurion se trouve <span className="text-white font-semibold">DeepSeek V3</span>, l&apos;un des modèles d&apos;intelligence artificielle les plus avancés au monde. Cette technologie de pointe permet à Aurion de comprendre vos intentions avec une précision remarquable et de générer du code de qualité professionnelle.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-black/30 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-3xl font-bold text-white mb-2">64k</div>
                      <div className="text-sm text-white/70">Tokens de contexte</div>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-3xl font-bold text-white mb-2">99%</div>
                      <div className="text-sm text-white/70">Précision du code</div>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-3xl font-bold text-white mb-2">0.1s</div>
                      <div className="text-sm text-white/70">Temps de génération</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="aurion-input-wrapper">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Code className="w-6 h-6 text-white/90" strokeWidth={2} />
                    <h3 className="text-xl font-semibold text-white">Génération de code avancée</h3>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    Créez des applications complètes avec du code propre, optimisé et prêt pour la production. DeepSeek V3 génère du code qui respecte les meilleures pratiques de l&apos;industrie.
                  </p>
                </div>
              </div>

              <div className="aurion-input-wrapper">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Palette className="w-6 h-6 text-white/90" strokeWidth={2} />
                    <h3 className="text-xl font-semibold text-white">Design UI/UX moderne</h3>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    Des interfaces élégantes et intuitives qui suivent les dernières tendances du design. Chaque élément est pensé pour offrir une expérience utilisateur exceptionnelle.
                  </p>
                </div>
              </div>
            </div>

            {/* Vision Section */}
            <div className="aurion-hero-card">
              <div className="aurion-hero-content relative z-10">
                <div className="space-y-6">
                  <h2 className="text-3xl font-semibold text-white mb-4">Notre vision</h2>
                  <p className="text-lg text-white/80 leading-relaxed">
                    Nous croyons que la création web ne devrait pas être limitée par la complexité technique. Aurion démocratise le développement en permettant à chacun de transformer ses idées en réalité, qu&apos;il s&apos;agisse de sites web, d&apos;applications mobiles ou de composants UI/UX sophistiqués.
                  </p>
                  <p className="text-lg text-white/80 leading-relaxed">
                    Grâce à la puissance de DeepSeek V3 et à notre interface intuitive, vous pouvez désormais créer à la vitesse de la pensée. Plus besoin de passer des heures à coder manuellement. Décrivez votre vision, et laissez l&apos;IA faire le reste.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center pt-8">
              <p className="text-xl text-white/90 mb-6">
                Prêt à créer quelque chose d&apos;extraordinaire ?
              </p>
              <a
                href="/"
                className="inline-block px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-white/90 transition-colors"
              >
                Commencer maintenant
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

