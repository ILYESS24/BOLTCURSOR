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
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '1rem' }}>
        Aurion - L'Ingénieur Fullstack IA
      </h1>
      <p style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: '1.6' }}>
        Créez des applications complètes en quelques secondes.
        <br />
        Générez du code professionnel avec l'IA.
      </p>
      <div style={{
        marginTop: '2rem',
        padding: '20px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <p style={{ color: '#fff', margin: 0 }}>
          🚀 Application en cours de chargement...
        </p>
      </div>
    </div>
  );
}
