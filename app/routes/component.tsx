import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/header/Header';
import { DefaultNavBar } from '~/components/navbar/NavBar.client';
import { Sparkles, Palette } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Component - Aurion' }, { name: 'description', content: 'Composants UI/UX et animations pour Aurion' }];
};

export const loader = () => json({});

export default function Component() {
  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <ClientOnly>{() => <DefaultNavBar />}</ClientOnly>
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12 pt-24">
        <div className="max-w-5xl mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-7xl font-bold text-white mb-6 tracking-tight">
              Composants
            </h1>
            <p className="text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Explorez notre collection de composants UI/UX et animations
            </p>
          </div>

          {/* Component Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Animation Component */}
            <a
              href="https://animate-j4ggoj3z4-ibagencys-projects.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="aurion-hero-card block hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="aurion-hero-content relative z-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                    <h2 className="text-3xl font-semibold text-white">Animation</h2>
                  </div>
                  <p className="text-lg text-white/80 leading-relaxed">
                    Découvrez notre bibliothèque d&apos;animations modernes et fluides. 
                    Des effets visuels élégants pour donner vie à vos interfaces.
                  </p>
                  <div className="flex items-center gap-2 text-white/70 group-hover:text-white transition-colors">
                    <span className="text-sm font-medium">Explorer les animations</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </a>

            {/* Design Component */}
            <a
              href="https://v4-qmfci1xj7-ibagencys-projects.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="aurion-hero-card block hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="aurion-hero-content relative z-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                      <Palette className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                    <h2 className="text-3xl font-semibold text-white">Design</h2>
                  </div>
                  <p className="text-lg text-white/80 leading-relaxed">
                    Explorez notre collection de composants de design UI/UX. 
                    Des éléments soigneusement conçus pour créer des interfaces exceptionnelles.
                  </p>
                  <div className="flex items-center gap-2 text-white/70 group-hover:text-white transition-colors">
                    <span className="text-sm font-medium">Explorer les designs</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

