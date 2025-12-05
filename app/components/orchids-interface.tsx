// PAGE HTML STATIQUE POUR TEST FINAL
export default function OrchidsInterface() {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>AURION - Interface IA</title>
        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              margin: 0;
              padding: 0;
              background-color: #000000;
              color: white;
              font-family: Arial, sans-serif;
              width: 100vw;
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }

            h1 {
              font-size: 5rem;
              font-weight: bold;
              margin-bottom: 4rem;
              letter-spacing: 0.2em;
              text-shadow: 0 0 30px rgba(255,255,255,0.3);
            }

            .prompt-box {
              background-color: #1F2023;
              border: 1px solid #444444;
              border-radius: 24px;
              padding: 16px;
              width: 500px;
            }

            textarea {
              width: 100%;
              min-height: 44px;
              background-color: transparent;
              color: white;
              border: none;
              outline: none;
              resize: none;
              font-size: 16px;
              margin-bottom: 12px;
            }

            .button-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .left-buttons {
              display: flex;
              gap: 4px;
            }

            button {
              background: transparent;
              border: none;
              color: white;
              font-size: 20px;
              cursor: pointer;
              padding: 8px;
              border-radius: 8px;
              transition: all 0.2s ease;
              opacity: 0.7;
            }

            button:hover {
              opacity: 1;
              background-color: rgba(255,255,255,0.1);
            }

            .send-button {
              background-color: white;
              border-radius: 50%;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
            }

            .footer {
              margin-top: 4rem;
              text-align: center;
              color: rgba(255,255,255,0.5);
              font-size: 14px;
            }
          `
        }} />
      </head>
      <body>
        <h1>AURION</h1>

        <div className="prompt-box">
          <textarea
            placeholder="Décrivez votre application IA..."
          />

          <div className="button-row">
            <div className="left-buttons">
              <button title="Attacher un fichier">📎</button>
              <button title="Recherche web">🌐</button>
              <button title="Penser profondément">🧠</button>
            </div>

            <button
              className="send-button"
              title="Envoyer le message"
              onClick={() => alert('Message envoyé !')}
            >
              ⬆️
            </button>
          </div>
        </div>

        <div className="footer">
          <p>Interface IA - Version Finale</p>
          <p>Background noir - Test réussi !</p>
        </div>
      </body>
    </html>
  );
}