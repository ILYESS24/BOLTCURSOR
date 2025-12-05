"use client"

export function GradientBackground() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes grainMove {
            0%, 100% {
              transform: translate(0, 0);
            }
            10% {
              transform: translate(-5%, -10%);
            }
            20% {
              transform: translate(-15%, 5%);
            }
            30% {
              transform: translate(7%, -25%);
            }
            40% {
              transform: translate(-5%, 25%);
            }
            50% {
              transform: translate(-15%, 10%);
            }
            60% {
              transform: translate(15%, 0%);
            }
            70% {
              transform: translate(0%, 15%);
            }
            80% {
              transform: translate(3%, -10%);
            }
            90% {
              transform: translate(-10%, 5%);
            }
          }

          @keyframes colorShift {
            0%, 100% {
              filter: hue-rotate(0deg) brightness(1) contrast(1);
            }
            25% {
              filter: hue-rotate(15deg) brightness(1.1) contrast(1.1);
            }
            50% {
              filter: hue-rotate(30deg) brightness(0.9) contrast(0.9);
            }
            75% {
              filter: hue-rotate(-15deg) brightness(1.05) contrast(1.05);
            }
          }

          .grain-texture {
            background:
              radial-gradient(circle at 20% 50%, rgba(255, 140, 0, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(255, 20, 147, 0.25) 0%, transparent 50%),
              radial-gradient(circle at 60% 30%, rgba(255, 69, 0, 0.2) 0%, transparent 50%);
            background-size: 200% 200%;
            animation: grainMove 20s ease-in-out infinite, colorShift 15s ease-in-out infinite;
          }

          .noise-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image:
              radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 3px, transparent 3px);
            background-size: 100px 100px, 50px 50px, 150px 150px;
            animation: grainMove 8s linear infinite reverse;
            opacity: 0.6;
          }
        `
      }} />
      <div className="absolute inset-0 -z-10 bg-black">
        <div className="grain-texture w-full h-full relative">
          <div className="noise-overlay"></div>
        </div>
      </div>
    </>
  )
}
