import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  originalX: number;
  originalY: number;
  originalZ: number;
  size: number;
  opacity: number;
  type?: 'star' | 'nebula';
  color?: 'blue' | 'purple' | 'white';
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Canvas context not found');
      return;
    }

    console.log('Starting particle animation...');

    // Configuration Galactique
    const PARTICLE_COUNT = 200; // Plus de particules pour un effet galactique
    const SPHERE_RADIUS = Math.min(window.innerWidth, window.innerHeight) * 0.4; // Sphère plus grande
    const MOUSE_INFLUENCE = 1.5; // Influence galactique plus forte
    const BREATHING_AMPLITUDE = 0.3; // Respiration galactique plus prononcée
    const BREATHING_SPEED = 0.015; // Vitesse galactique

    // Initialiser les particules
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Générer des points sur une sphère
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = 2 * Math.PI * Math.random();
        
        const x = SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta);
        const y = SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta);
        const z = SPHERE_RADIUS * Math.cos(phi);

        particlesRef.current.push({
          x, y, z,
          vx: 0, vy: 0, vz: 0,
          originalX: x,
          originalY: y,
          originalZ: z,
          size: Math.random() * 4 + 0.5, // Tailles plus variées pour l'effet galactique
          opacity: Math.random() * 0.9 + 0.1, // Opacité plus variée
          type: Math.random() < 0.3 ? 'star' : 'nebula', // Types galactiques
          color: Math.random() < 0.1 ? 'blue' : Math.random() < 0.2 ? 'purple' : 'white' // Couleurs galactiques
        });
      }
    };

    // Redimensionner le canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Gérer les mouvements de la souris
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1
      };
    };

    // Animation principale
    const animate = () => {
      timeRef.current += 0.016;
      
      // Clear canvas avec fond noir pour les billes brillantes
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const mouseX = centerX + mouseRef.current.x * 300;
      const mouseY = centerY + mouseRef.current.y * 300;

      // Effet de respiration
      const breathing = 1 + Math.sin(timeRef.current * BREATHING_SPEED) * BREATHING_AMPLITUDE;

      particlesRef.current.forEach(particle => {
        // Calculer la distance au curseur
        const dx = mouseX - (centerX + particle.x);
        const dy = mouseY - (centerY + particle.y);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Forces galactiques plus complexes
        const force = distance > 0 ? (200 / (distance + 30)) * MOUSE_INFLUENCE : 0;
        
        // Force différente selon le type de particule
        const forceMultiplier = particle.type === 'star' ? 0.04 : 0.02;
        particle.vx += (dx / distance) * force * forceMultiplier;
        particle.vy += (dy / distance) * force * forceMultiplier;
        
        // Force de retour galactique plus douce
        const returnForce = particle.type === 'star' ? 0.015 : 0.025;
        particle.vx += (particle.originalX - particle.x) * returnForce;
        particle.vy += (particle.originalY - particle.y) * returnForce;
        particle.vz += (particle.originalZ - particle.z) * returnForce;
        
        // Respiration galactique plus prononcée
        const breathingMultiplier = particle.type === 'nebula' ? 0.02 : 0.01;
        particle.vx += (particle.originalX * (breathing - 1)) * breathingMultiplier;
        particle.vy += (particle.originalY * (breathing - 1)) * breathingMultiplier;
        particle.vz += (particle.originalZ * (breathing - 1)) * breathingMultiplier;
        
        // Mouvement aléatoire subtil
        particle.vx += (Math.random() - 0.5) * 0.3;
        particle.vy += (Math.random() - 0.5) * 0.3;
        particle.vz += (Math.random() - 0.5) * 0.2;
        
        // Friction
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.vz *= 0.98;
        
        // Mettre à jour la position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;
        
        // Projection 3D vers 2D
        const scale = 300 / (300 + particle.z);
        const screenX = centerX + particle.x * scale;
        const screenY = centerY + particle.y * scale;
        
        // Rendu galactique avec couleurs et effets spéciaux
        const alpha = Math.max(0, Math.min(1, particle.opacity * scale));
        const size = Math.max(0.5, particle.size * scale);
        
        ctx.save();
        
        // Couleurs galactiques selon le type
        let particleColor, glowColor;
        if (particle.color === 'blue') {
          particleColor = `rgba(135, 206, 250, ${alpha})`; // Bleu ciel galactique
          glowColor = `rgba(135, 206, 250, ${alpha * 0.6})`;
        } else if (particle.color === 'purple') {
          particleColor = `rgba(186, 85, 211, ${alpha})`; // Violet galactique
          glowColor = `rgba(186, 85, 211, ${alpha * 0.6})`;
        } else {
          particleColor = `rgba(255, 255, 255, ${alpha})`; // Blanc étoilé
          glowColor = `rgba(255, 255, 255, ${alpha * 0.8})`;
        }
        
        // Effet de glow galactique plus intense
        ctx.shadowBlur = particle.type === 'star' ? 25 : 15;
        ctx.shadowColor = glowColor;
        
        // Dessiner la particule principale
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Halo intérieur pour les étoiles
        if (particle.type === 'star') {
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
          ctx.beginPath();
          ctx.arc(screenX, screenY, size * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Effet de pulsation pour les nébuleuses
        if (particle.type === 'nebula') {
          const pulse = 1 + Math.sin(timeRef.current * 0.05 + particle.x * 0.01) * 0.3;
          ctx.shadowBlur = 30 * pulse;
          ctx.shadowColor = glowColor;
          ctx.fillStyle = particleColor;
          ctx.beginPath();
          ctx.arc(screenX, screenY, size * pulse, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Initialiser
    initParticles();
    resizeCanvas();
    
    console.log('Particles initialized:', particlesRef.current.length);
    
    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Démarrer l'animation
    console.log('Starting animation loop...');
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ background: '#000000' }}
    />
  );
}