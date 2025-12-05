export function GradientBackground() {
  return (
    <div
      className="absolute inset-0 -z-10"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 20% 40%, rgba(245, 87, 2, 0.3) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 80% 20%, rgba(245, 170, 100, 0.2) 0%, transparent 50%),
          radial-gradient(ellipse 70% 60% at 60% 80%, rgba(238, 174, 202, 0.25) 0%, transparent 50%),
          linear-gradient(135deg, rgba(245, 87, 2, 0.1) 0%, rgba(245, 140, 2, 0.05) 35%, rgba(238, 174, 202, 0.08) 70%, rgba(202, 179, 214, 0.06) 100%),
          #000000
        `
      }}
    />
  )
}
