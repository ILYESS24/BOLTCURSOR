export default function Index() {
  // Timestamp pour prouver que c'est la nouvelle version
  const deployTime = new Date().toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div style={{
      background: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 3s ease infinite',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .pulse {
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>

      <h1 style={{
        fontSize: '6rem',
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        textShadow: '0 0 30px rgba(255,255,255,0.8)',
        marginBottom: '20px'
      }}>
        🎉 AURION LIVE 🎉
      </h1>

      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        textAlign: 'center',
        maxWidth: '800px',
        backdropFilter: 'blur(10px)',
        border: '3px solid #ff6b6b'
      }}>
        <h2 style={{
          fontSize: '3rem',
          color: '#ff6b6b',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          🚀 DÉPLOIEMENT RÉUSSI ! 🚀
        </h2>

        <p style={{
          fontSize: '1.8rem',
          color: '#333',
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          Votre application <strong>AURION</strong> fonctionne parfaitement !
        </p>

        <div style={{
          background: '#ff4757',
          color: 'white',
          padding: '20px',
          borderRadius: '15px',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          ⏰ DÉPLOYÉ LE : {deployTime}
        </div>

        <p style={{
          fontSize: '1.4rem',
          color: '#666',
          marginBottom: '30px'
        }}>
          Si vous voyez ce message, votre déploiement automatique fonctionne ! 🎯
        </p>

        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <span style={{
            background: '#ff6b6b',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '25px',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            ✅ Code OK
          </span>
          <span style={{
            background: '#4ecdc4',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '25px',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            ✅ Build OK
          </span>
          <span style={{
            background: '#45b7d1',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '25px',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            ✅ Déploiement OK
          </span>
        </div>
      </div>
    </div>
  );
}
