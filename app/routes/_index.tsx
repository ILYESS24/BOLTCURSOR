import OrchidsInterface from '~/components/orchids-interface';

export default function Index() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <h1 style={{
        color: 'white',
        fontSize: '4rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        🚀 AURION 🚀
      </h1>

      <p style={{
        color: 'white',
        fontSize: '1.5rem',
        textAlign: 'center',
        marginBottom: '3rem',
        maxWidth: '600px'
      }}>
        L'IA Fullstack Engineer qui transforme vos idées en réalité !
      </p>

      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '30px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        textAlign: 'center'
      }}>
        <h2 style={{ color: 'white', marginBottom: '1rem' }}>
          Interface en cours de chargement...
        </h2>
        <p style={{ color: 'white', opacity: 0.8 }}>
          Patientez pendant que nous préparons votre expérience Aurion complète !
        </p>

        {/* Test pour voir si OrchidsInterface fonctionne */}
        <div style={{ marginTop: '2rem', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
          <OrchidsInterface />
        </div>
      </div>
    </div>
  );
}
