'use client';

import { useEffect, useRef } from 'react';
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

export function Globe({ markers = [], className = '', focusLng, focusLat }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(Math.PI / 4);
  const scaleRef = useRef(DEFAULT_SCALE);
  const thetaRef = useRef(DEFAULT_THETA);
  const focusLngRef = useRef<number | undefined>(undefined);
  const focusLatRef = useRef<number | undefined>(undefined);
  const isFocusingRef = useRef(false);

  // Update focus target when props change
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
      mapBrightness: 4,
      baseColor: [0.15, 0.15, 0.17],
      markerColor: [0.39, 0.4, 0.95],
      glowColor: [0.08, 0.08, 0.1],
      markers: markers.map((m) => ({
        location: [m.lat, m.lng] as [number, number],
        size: m.size ?? 0.06,
      })),
      onRender: (state) => {
        if (focusLngRef.current !== undefined && isFocusingRef.current) {
          // Smoothly rotate horizontally to center the selected location.
          // In cobe, phi=0 faces ~prime meridian; to show a longitude at the
          // center we need phi = -lng converted to radians.
          const targetPhi = (-focusLngRef.current * Math.PI) / 180 + 3 * Math.PI / 2;

          // Handle wrap-around: pick the shortest rotation direction
          let diff = targetPhi - phiRef.current;
          // Normalize diff to [-PI, PI]
          diff = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI;
          if (diff < -Math.PI) diff += 2 * Math.PI;

          phiRef.current += diff * 0.06;

          // Smoothly tilt towards the focused latitude
          const targetTheta = focusLatRef.current !== undefined
            ? (focusLatRef.current * Math.PI) / 180 * 0.4 + DEFAULT_THETA
            : DEFAULT_THETA;
          thetaRef.current += (targetTheta - thetaRef.current) * 0.06;

          // Smoothly zoom in
          scaleRef.current += (FOCUSED_SCALE - scaleRef.current) * 0.06;
        } else {
          // Normal slow auto-rotation
          phiRef.current += 0.003;
          // Smoothly zoom back out
          scaleRef.current += (DEFAULT_SCALE - scaleRef.current) * 0.06;
          thetaRef.current += (DEFAULT_THETA - thetaRef.current) * 0.06;
        }

        state.phi = phiRef.current;
        state.theta = thetaRef.current;
        state.width = width * 2;
        state.height = width * 2;
        // Apply zoom via the scale property
        (state as Record<string, unknown>).scale = scaleRef.current;
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full aspect-square ${className}`}
      style={{ contain: 'layout paint size', pointerEvents: 'none' }}
    />
  );
}
