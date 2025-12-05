export function GradientBackground() {
  return (
    <div
      className="absolute inset-0 -z-10"
      style={{
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 219, 226, 0.1) 0%, transparent 50%),
          linear-gradient(135deg,
            #0a0a0a 0%,
            #1a1a2e 25%,
            #16213e 50%,
            #0f0f23 75%,
            #0a0a0a 100%
          )
        `,
        backgroundSize: '100% 100%, 120% 120%, 80% 80%, 100% 100%',
        backgroundPosition: '0% 0%, 100% 100%, 50% 50%, 0% 0%'
      }}
    />
  )
}
