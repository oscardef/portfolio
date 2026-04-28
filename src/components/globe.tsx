'use client';

import { useEffect, useRef, useCallback } from 'react';
import createGlobe from 'cobe';

interface GlobeMarker {
  lat: number;
  lng: number;
  size?: number;
}

interface GlobeProps {
  markers?: GlobeMarker[];
  className?: string;
  focusLng?: number;
  focusLat?: number;
}

const DEFAULT_THETA = 0.25;
const FOCUSED_SCALE = 2.5;
const DEFAULT_SCALE = 1;
const AUTO_ROTATE_DELAY = 3000;

export function Globe({ markers = [], className = '', focusLng, focusLat }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(Math.PI / 4);
  const scaleRef = useRef(DEFAULT_SCALE);
  const thetaRef = useRef(DEFAULT_THETA);
  const focusLngRef = useRef<number | undefined>(undefined);
  const focusLatRef = useRef<number | undefined>(undefined);
  const isFocusingRef = useRef(false);

  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const lastInteractionTime = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    if (focusLng !== undefined) {
      focusLngRef.current = focusLng;
      focusLatRef.current = focusLat;
      isFocusingRef.current = true;
    } else {
      focusLngRef.current = undefined;
      focusLatRef.current = undefined;
      isFocusingRef.current = false;
    }
  }, [focusLng, focusLat]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
  }, []);

  const onPointerUp = useCallback(() => {
    pointerInteracting.current = null;
    lastInteractionTime.current = Date.now();
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
  }, []);

  const onPointerOut = useCallback(() => {
    pointerInteracting.current = null;
    lastInteractionTime.current = Date.now();
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (pointerInteracting.current !== null) {
      const delta = e.clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      velocityRef.current = (delta - (phiRef.current * 200)) * 0.01;
      phiRef.current = delta / 200;
    }
  }, []);

  useEffect(() => {
    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    onResize();
    window.addEventListener('resize', onResize);

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 5,
      baseColor: [0.15, 0.15, 0.17],
      markerColor: [0.39, 0.4, 0.95],
      glowColor: [0.12, 0.12, 0.18],
      markers: markers.map((m) => ({
        location: [m.lat, m.lng] as [number, number],
        size: m.size ?? 0.06,
      })),
      onRender: (state) => {
        const now = Date.now();
        const isDragging = pointerInteracting.current !== null;
        const timeSinceInteraction = now - lastInteractionTime.current;
        const shouldAutoRotate = !isDragging && timeSinceInteraction > AUTO_ROTATE_DELAY;

        if (isFocusingRef.current && focusLngRef.current !== undefined) {
          const targetPhi = (-focusLngRef.current * Math.PI) / 180 + 3 * Math.PI / 2;

          let diff = targetPhi - phiRef.current;
          diff = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI;
          if (diff < -Math.PI) diff += 2 * Math.PI;

          phiRef.current += diff * 0.06;

          const targetTheta = focusLatRef.current !== undefined
            ? (focusLatRef.current * Math.PI) / 180 * 0.4 + DEFAULT_THETA
            : DEFAULT_THETA;
          thetaRef.current += (targetTheta - thetaRef.current) * 0.06;

          scaleRef.current += (FOCUSED_SCALE - scaleRef.current) * 0.06;
        } else if (isDragging) {
          // User is dragging — phi is updated via onPointerMove
          scaleRef.current += (DEFAULT_SCALE - scaleRef.current) * 0.06;
          thetaRef.current += (DEFAULT_THETA - thetaRef.current) * 0.06;
        } else if (shouldAutoRotate) {
          // Decay any remaining velocity
          velocityRef.current *= 0.95;
          phiRef.current += 0.003 + velocityRef.current * 0.001;
          if (Math.abs(velocityRef.current) < 0.01) velocityRef.current = 0;

          scaleRef.current += (DEFAULT_SCALE - scaleRef.current) * 0.06;
          thetaRef.current += (DEFAULT_THETA - thetaRef.current) * 0.06;
        } else {
          // Between drag end and auto-rotate resume: momentum decay
          velocityRef.current *= 0.92;
          phiRef.current += velocityRef.current * 0.002;
          if (Math.abs(velocityRef.current) < 0.01) velocityRef.current = 0;

          scaleRef.current += (DEFAULT_SCALE - scaleRef.current) * 0.06;
          thetaRef.current += (DEFAULT_THETA - thetaRef.current) * 0.06;
        }

        state.phi = phiRef.current;
        state.theta = thetaRef.current;
        state.width = width * 2;
        state.height = width * 2;
        (state as Record<string, unknown>).scale = scaleRef.current;
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [markers]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full aspect-square ${className}`}
      style={{ contain: 'layout paint size', cursor: 'grab' }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerOut={onPointerOut}
      onPointerMove={onPointerMove}
    />
  );
}
