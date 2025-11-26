import { json, type MetaFunction } from '@remix-run/cloudflare';

export const meta: MetaFunction = () => {
  return [
    { title: 'Conditions d\'Utilisation - Aurion' },
    { name: 'description', content: 'Conditions d\'utilisation d\'Aurion - Règles et conditions d\'usage de la plateforme' }
  ];
};

export const loader = () => json({});

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-8 py-16">
        <h1 className="text-5xl font-bold mb-8">Conditions d'Utilisation</h1>
        <p className="text-gray-400 mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptation des Conditions</h2>
            <p className="text-gray-300 leading-relaxed">
              En accédant et en utilisant Aurion, vous acceptez d'être lié par ces conditions d'utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description du Service</h2>
            <p className="text-gray-300 leading-relaxed">
              Aurion est une plateforme d'intelligence artificielle qui permet de générer du code, créer des applications 
              et développer des projets web. Le service utilise des modèles IA avancés pour répondre à vos requêtes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Utilisation Acceptable</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Vous vous engagez à utiliser Aurion uniquement à des fins légales et de manière conforme à ces conditions. 
              Vous ne devez pas :
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Utiliser le service pour des activités illégales</li>
              <li>Tenter d'accéder à des parties non autorisées du service</li>
              <li>Transmettre des virus ou codes malveillants</li>
              <li>Violer les droits de propriété intellectuelle</li>
              <li>Générer du contenu offensant, discriminatoire ou nuisible</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Propriété Intellectuelle</h2>
            <p className="text-gray-300 leading-relaxed">
              Le code et les applications générés par Aurion vous appartiennent. Cependant, vous reconnaissez que le service 
              utilise des modèles IA tiers et que certains contenus peuvent être soumis à des licences spécifiques.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Limitation de Responsabilité</h2>
            <p className="text-gray-300 leading-relaxed">
              Aurion est fourni "tel quel" sans garantie d'aucune sorte. Nous ne garantissons pas que le service sera 
              ininterrompu, sécurisé ou exempt d'erreurs. Vous utilisez le service à vos propres risques.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Modifications du Service</h2>
            <p className="text-gray-300 leading-relaxed">
              Nous nous réservons le droit de modifier, suspendre ou interrompre le service à tout moment, avec ou sans préavis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Résiliation</h2>
            <p className="text-gray-300 leading-relaxed">
              Nous pouvons résilier ou suspendre votre accès au service immédiatement, sans préavis, pour violation de ces 
              conditions d'utilisation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Droit Applicable</h2>
            <p className="text-gray-300 leading-relaxed">
              Ces conditions sont régies par les lois françaises. Tout litige sera soumis à la juridiction exclusive des 
              tribunaux français.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              Pour toute question concernant ces conditions d'utilisation, contactez-nous à : 
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

