import { json, type MetaFunction } from '@remix-run/cloudflare';

export const meta: MetaFunction = () => {
  return [
    { title: 'Mentions Légales - Aurion' },
    { name: 'description', content: 'Mentions légales d\'Aurion - Informations sur l\'éditeur et l\'hébergeur' }
  ];
};

export const loader = () => json({});

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-8 py-16">
        <h1 className="text-5xl font-bold mb-8">Mentions Légales</h1>
        <p className="text-gray-400 mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Éditeur du Site</h2>
            <div className="text-gray-300 leading-relaxed space-y-2">
              <p><strong>Nom :</strong> Aurion</p>
              <p><strong>Description :</strong> Plateforme d'intelligence artificielle pour le développement web</p>
              <p><strong>Email :</strong> <a href="mailto:contact@aurion.ai" className="text-blue-400 hover:underline">contact@aurion.ai</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Hébergement</h2>
            <div className="text-gray-300 leading-relaxed space-y-2">
              <p><strong>Hébergeur :</strong> Cloudflare Pages</p>
              <p><strong>Adresse :</strong> Cloudflare, Inc.</p>
              <p><strong>Site web :</strong> <a href="https://www.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">www.cloudflare.com</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Directeur de Publication</h2>
            <p className="text-gray-300 leading-relaxed">
              Le directeur de publication est le représentant légal d'Aurion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Propriété Intellectuelle</h2>
            <p className="text-gray-300 leading-relaxed">
              L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété 
              intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les 
              représentations iconographiques et photographiques.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Protection des Données</h2>
            <p className="text-gray-300 leading-relaxed">
              Conformément à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée et au Règlement Général sur la 
              Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression des données 
              vous concernant. Pour exercer ce droit, contactez-nous à : 
              <a href="mailto:privacy@aurion.ai" className="text-blue-400 hover:underline ml-1">privacy@aurion.ai</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              Ce site utilise des cookies pour améliorer l'expérience utilisateur. En continuant à naviguer sur ce site, 
              vous acceptez l'utilisation de cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Liens Externes</h2>
            <p className="text-gray-300 leading-relaxed">
              Le site peut contenir des liens vers des sites externes. Aurion n'est pas responsable du contenu de ces sites 
              externes et décline toute responsabilité quant à leur contenu ou leur accessibilité.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              Pour toute question concernant ces mentions légales, contactez-nous à : 
              <a href="mailto:legal@aurion.ai" className="text-blue-400 hover:underline ml-1">legal@aurion.ai</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700">
          <a href="/" className="text-blue-400 hover:underline">← Retour à l'accueil</a>
        </div>
      </div>
    </div>
  );
}

