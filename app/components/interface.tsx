import { GradientBackground } from "./paper-design-shader-background";

export default function Interface() {
  return (
    <div className="relative min-h-screen h-full w-full overflow-hidden">
      <GradientBackground />
    </div>
  );
}
