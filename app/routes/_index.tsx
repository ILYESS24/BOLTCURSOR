export default function Index() {
  return (
    <html>
      <head>
        <title>AURION DEPLOYE - TEST FINAL</title>
        <style>
          {`
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background: linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080);
              background-size: 400% 400%;
              animation: rainbow 3s linear infinite;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            @keyframes rainbow {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }

            .container {
              background: rgba(255, 255, 255, 0.95);
              padding: 50px;
              border-radius: 25px;
              box-shadow: 0 25px 50px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 900px;
              border: 5px solid #ff6b6b;
            }

            h1 {
              font-size: 7rem;
              color: #ff0000;
              margin-bottom: 30px;
              text-shadow: 0 0 40px rgba(255,0,0,0.8);
              animation: pulse 2s infinite;
            }

            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }

            h2 {
              font-size: 4rem;
              color: #0000ff;
              margin-bottom: 30px;
              font-weight: bold;
            }

            .timestamp {
              background: #ff4757;
              color: white;
              padding: 25px;
              border-radius: 20px;
              font-size: 2rem;
              font-weight: bold;
              margin: 30px 0;
              display: inline-block;
            }

            .indicators {
              display: flex;
              gap: 30px;
              justify-content: center;
              flex-wrap: wrap;
              margin-top: 40px;
            }

            .indicator {
              background: #4CAF50;
              color: white;
              padding: 15px 30px;
              border-radius: 30px;
              font-size: 1.5rem;
              font-weight: bold;
              box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
          `}
        </style>
      </head>
      <body>
        <div className="container">
          <h1>🎉 AURION DEPLOYE 🎉</h1>
          <h2>🚀 TEST FINAL RÉUSSI 🚀</h2>

          <div className="timestamp">
            ⏰ CHARGÉ LE: {new Date().toLocaleString('fr-FR', {
              timeZone: 'Europe/Paris',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>

          <p style={{ fontSize: '1.8rem', color: '#333', marginBottom: '40px' }}>
            SI VOUS VOYEZ ÇA, VOTRE DÉPLOIEMENT MARCHE PARFAITEMENT !
          </p>

          <div className="indicators">
            <span className="indicator">✅ CODE OK</span>
            <span className="indicator">✅ BUILD OK</span>
            <span className="indicator">✅ DEPLOIEMENT OK</span>
            <span className="indicator">✅ CACHE OK</span>
          </div>
        </div>
      </body>
    </html>
  );
}
