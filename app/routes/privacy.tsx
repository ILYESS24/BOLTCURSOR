import { json, type MetaFunction } from '@remix-run/cloudflare';

export const meta: MetaFunction = () => {
  return [
    { title: 'Politique de Confidentialité - Aurion' },
    { name: 'description', content: 'Politique de confidentialité d\'Aurion - Protection de vos données personnelles' }
  ];
};

export const loader = () => json({});

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-8 py-16">
        <h1 className="text-5xl font-bold mb-8">Politique de Confidentialité</h1>
        <p className="text-gray-400 mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              Aurion s'engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, 
              utilisons et protégeons vos informations personnelles lorsque vous utilisez notre service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Données Collectées</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Nous collectons les informations suivantes :
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Informations que vous nous fournissez directement (messages, requêtes)</li>
              <li>Données d'utilisation de la plateforme</li>
              <li>Informations techniques (adresse IP, type de navigateur)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Utilisation des Données</h2>
            <p className="text-gray-300 leading-relaxed">
              Nous utilisons vos données pour :
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-4">
              <li>Fournir et améliorer nos services IA</li>
              <li>Personnaliser votre expérience</li>
              <li>Analyser l'utilisation de la plateforme</li>
              <li>Assurer la sécurité et prévenir les fraudes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Partage des Données</h2>
            <p className="text-gray-300 leading-relaxed">
              Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations uniquement avec :
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-4">
              <li>Nos prestataires de services IA (OpenAI, Anthropic, DeepSeek) pour traiter vos requêtes</li>
              <li>Les autorités légales si requis par la loi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Sécurité</h2>
            <p className="text-gray-300 leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre l'accès non autorisé, 
              la modification, la divulgation ou la destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Vos Droits</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Vous avez le droit de :
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Accéder à vos données personnelles</li>
              <li>Corriger vos données inexactes</li>
              <li>Demander la suppression de vos données</li>
              <li>Vous opposer au traitement de vos données</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              Pour toute question concernant cette politique de confidentialité, contactez-nous à : 
              <a href="mailto:privacy@aurion.ai" className="text-blue-400 hover:underline ml-1">privacy@aurion.ai</a>
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

