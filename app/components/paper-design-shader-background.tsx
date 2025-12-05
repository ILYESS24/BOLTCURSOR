export function GradientBackground() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes colorPulse {
            0%, 100% {
              filter: hue-rotate(0deg) brightness(1);
            }
            25% {
              filter: hue-rotate(10deg) brightness(1.1);
            }
            50% {
              filter: hue-rotate(20deg) brightness(0.9);
            }
            75% {
              filter: hue-rotate(-10deg) brightness(1.05);
            }
          }
        `
      }} />
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          background: `
            linear-gradient(-45deg,
              #0a0a0a,
              #1a1a2e,
              #16213e,
              #0f0f23,
              #1a1a2e,
              #0a0a0a
            )
          `,
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite, colorPulse 20s ease-in-out infinite'
        }}
      />
    </>
  )
}
