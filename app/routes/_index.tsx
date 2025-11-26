import { json, type MetaFunction } from '@remix-run/cloudflare';
import OrchidsInterface from '~/components/orchids-interface';

export const meta: MetaFunction = () => {
  return [
    { title: 'Aurion - L\'Ingénieur Fullstack IA | Créez des Apps en Secondes' },
    { name: 'description', content: 'Aurion est l\'ingénieur fullstack IA qui transforme vos idées en applications complètes. Générez du code professionnel, créez des prototypes et déployez en un clic. Développement web accéléré avec intelligence artificielle.' },
    { name: 'keywords', content: 'IA développement, génération code, fullstack engineer, création application, développement web IA, prototype rapide, déploiement automatique' }
  ];
};

export const loader = () => json({});

export default function Index() {
  return <div>Hello World</div>;
}
