
import React, { useRef, useMemo, Suspense, forwardRef, useImperativeHandle, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PointMaterial, Points } from '@react-three/drei';
import * as THREE from 'three';
import { SceneConfig, SceneObject, StickyNote } from '../types';

const ShootingStarsEffect = () => {
  const count = 80;
  const starRefs = useRef<Array<{ pos: THREE.Vector3; vel: THREE.Vector3; life: number; maxLife: number }>>([]);
  const pointsRef = useRef<THREE.Points>(null);

  const initialPositions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 60;
      const y = Math.random() * 30 + 10;
      const z = (Math.random() - 0.5) * 60;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      
      starRefs.current[i] = {
        pos: new THREE.Vector3(x, y, z),
        vel: new THREE.Vector3(-0.4 - Math.random() * 0.4, -0.2 - Math.random() * 0.2, -0.2 - Math.random() * 0.2),
        life: Math.random() * 100,
        maxLife: 50 + Math.random() * 100
      };
    }
    return pos;
  }, []);

  useFrame(() => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const star = starRefs.current[i];
        star.pos.add(star.vel);
        star.life++;
        if (star.life > star.maxLife || star.pos.y < -5) {
          star.pos.set((Math.random() - 0.5) * 80 + 30, Math.random() * 20 + 25, (Math.random() - 0.5) * 80);
          star.life = 0;
          star.maxLife = 40 + Math.random() * 120;
          star.vel.set(-0.6 - Math.random() * 0.6, -0.3 - Math.random() * 0.3, (Math.random() - 0.5) * 0.4);
        }
        positions[i * 3] = star.pos.x;
        positions[i * 3 + 1] = star.pos.y;
        positions[i * 3 + 2] = star.pos.z;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={pointsRef} positions={initialPositions} stride={3}>
      <PointMaterial transparent color="#ffffff" size={0.12} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.7} />
    </Points>
  );
};

const SnowEffect = () => {
  const count = 3000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = Math.random() * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  useFrame(() => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] -= 0.015 + Math.random() * 0.01;
        if (positions[i * 3 + 1] < -5) positions[i * 3 + 1] = 25;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial transparent color="#ffffff" size={0.035} sizeAttenuation={true} depthWrite={false} opacity={0.3} />
    </Points>
  );
};

// --- CUSTOM PARTICLE STAR TOPPER ---
const TreeStar = () => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Points>(null);
  const haloRef = useRef<THREE.Points>(null);

  // Generate star-shaped particle distribution
  const { coreData, haloData } = useMemo(() => {
    const coreCount = 8000;
    const corePos = new Float32Array(coreCount * 3);
    const haloCount = 2000;
    const haloPos = new Float32Array(haloCount * 3);

    const isInsideStar = (x: number, y: number, z: number, outer: number, inner: number) => {
      const angle = Math.atan2(y, x) + Math.PI / 2;
      const r = Math.sqrt(x * x + y * y);
      const points = 5;
      const section = Math.PI / points;
      const adjustedAngle = ((angle % (2 * section)) + 2 * section) % (2 * section);
      const starR = adjustedAngle < section 
        ? inner * outer / (inner * Math.cos(adjustedAngle) + outer * Math.sin(section - adjustedAngle))
        : inner * outer / (inner * Math.cos(2 * section - adjustedAngle) + outer * Math.sin(adjustedAngle - section));
      
      const maxZ = 0.25 * (1 - r/outer);
      return r <= starR && Math.abs(z) <= maxZ;
    };

    let i = 0;
    while (i < coreCount) {
      const x = (Math.random() - 0.5) * 2;
      const y = (Math.random() - 0.5) * 2;
      const z = (Math.random() - 0.5) * 0.6;
      if (isInsideStar(x, y, z, 0.9, 0.4)) {
        corePos[i * 3] = x;
        corePos[i * 3 + 1] = y;
        corePos[i * 3 + 2] = z;
        i++;
      }
    }

    for (let j = 0; j < haloCount; j++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.8 + Math.random() * 0.4;
      haloPos[j * 3] = Math.cos(angle) * radius;
      haloPos[j * 3 + 1] = Math.sin(angle) * radius;
      haloPos[j * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }

    return { coreData: corePos, haloData: haloPos };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const freq = (65 / 60) * Math.PI * 2;
    const pulse = 0.85 + Math.sin(t * freq) * 0.15;
    
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.5;
      groupRef.current.scale.set(pulse, pulse, pulse);
    }
    if (coreRef.current) {
      (coreRef.current.material as any).opacity = 0.7 + Math.sin(t * 30) * 0.3;
    }
    if (haloRef.current) {
      (haloRef.current.material as any).opacity = 0.3 + Math.sin(t * 2) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 7.2, 0]}>
      <Points ref={coreRef} positions={coreData} stride={3}>
        <PointMaterial transparent color="#ffeb3b" size={0.035} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} opacity={1} />
      </Points>
      <Points ref={haloRef} positions={haloData} stride={3}>
        <PointMaterial transparent color="#ffd700" size={0.06} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.4} />
      </Points>
      <pointLight intensity={15} color="#fff176" distance={6} decay={2} />
      <pointLight position={[0, 0, 0.5]} intensity={5} color="#ffffff" distance={2} />
    </group>
  );
};

const ParticleChristmasTree: React.FC<{ object: SceneObject; onTreeClick: () => void }> = ({ object, onTreeClick }) => {
  const treeMasterGroupRef = useRef<THREE.Group>(null);
  const foliageRef = useRef<THREE.Points>(null);
  const lightsRef = useRef<THREE.Points>(null);
  const ribbonRef = useRef<THREE.Points>(null);

  const foliageData = useMemo(() => {
    const count = 60000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const height = Math.random() * 7;
      const t = height / 7;
      const radiusAtHeight = (1 - t) * 2.5;
      const angle = Math.random() * Math.PI * 2;
      // Slightly more dense core by using pow 0.5
      const r = Math.pow(Math.random(), 0.55) * radiusAtHeight;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    return pos;
  }, []);

  const lightsData = useMemo(() => {
    const count = 900;
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#ff2222'),
      new THREE.Color('#22ff22'),
      new THREE.Color('#ffff00'),
      new THREE.Color('#00ffff'),
      new THREE.Color('#ffffff')
    ];

    for (let i = 0; i < count; i++) {
      const height = Math.random() * 6.8;
      const radiusAtHeight = (1 - height / 7) * 2.6;
      const angle = Math.random() * Math.PI * 2;
      const offset = 0.05 + Math.random() * 0.1;
      pos[i * 3] = Math.cos(angle) * (radiusAtHeight + offset);
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * (radiusAtHeight + offset);

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { pos, colors };
  }, []);

  const ribbonData = useMemo(() => {
    const count = 8000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const height = t * 7;
      const angle = t * Math.PI * 18; 
      const radius = (1 - t) * 2.6;
      const jitter = (Math.random() - 0.5) * 0.08;
      pos[i * 3] = Math.cos(angle) * (radius + jitter);
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * (radius + jitter);
    }
    return pos;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (treeMasterGroupRef.current) treeMasterGroupRef.current.rotation.y = t * 0.15;
    if (lightsRef.current) {
      (lightsRef.current.material as any).size = 0.25 + Math.sin(t * 3) * 0.1;
    }
    if (ribbonRef.current) {
      (ribbonRef.current.material as any).opacity = 0.5 + Math.sin(t * 2) * 0.3;
    }
  });

  return (
    <group 
      ref={treeMasterGroupRef}
      position={[object.position.x, object.position.y, object.position.z]} 
      scale={[object.scale.x, object.scale.y, object.scale.z]}
    >
      <TreeStar />
      
      {/* Dense Dark Green Foliage with increased visibility */}
      <Points ref={foliageRef} positions={foliageData} stride={3}>
        <PointMaterial 
          transparent 
          color="#032d1d" 
          size={0.055} 
          sizeAttenuation={true} 
          depthWrite={false} 
          opacity={0.85} 
        />
      </Points>

      {/* Shimmering Bold Ribbon */}
      <Points ref={ribbonRef} positions={ribbonData} stride={3}>
        <PointMaterial 
          transparent 
          color="#ffffff" 
          size={0.05} // Increased particle size
          sizeAttenuation={true} 
          depthWrite={false} 
          blending={THREE.AdditiveBlending} 
          opacity={0.65} 
        />
      </Points>

      {/* Large Glowing Lights */}
      <Points ref={lightsRef} positions={lightsData.pos} colors={lightsData.colors} stride={3}>
        <PointMaterial 
          transparent 
          vertexColors 
          size={0.4} 
          sizeAttenuation={true} 
          depthWrite={false} 
          blending={THREE.AdditiveBlending} 
          opacity={1} 
        />
      </Points>
      
      <mesh position={[0, 3.5, 0]} onClick={(e) => { e.stopPropagation(); onTreeClick(); }}>
        <coneGeometry args={[2.8, 7, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
};

const ThreeViewer = forwardRef<any, { config: SceneConfig; onTreeClick: () => void }>(({ config, onTreeClick }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => ({
    getSnapshot: () => canvasRef.current ? canvasRef.current.toDataURL('image/png') : null
  }));

  return (
    <div className="w-full h-full bg-black">
      <Canvas 
        ref={canvasRef}
        camera={{ position: [15, 12, 15], fov: 30 }}
        gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={['#000000']} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 1.8} minDistance={8} maxDistance={40} />
        <ambientLight intensity={0.1} />
        <pointLight position={[5, 10, 5]} color="#ffd700" intensity={2} />
        <Stars radius={150} depth={50} count={8000} factor={4} saturation={0.5} fade />
        {config.showSnow && <SnowEffect />}
        <ShootingStarsEffect />
        <Suspense fallback={null}>
          <group>{config.objects.map((obj) => (<ParticleChristmasTree key={obj.id} object={obj} onTreeClick={onTreeClick} />))}</group>
        </Suspense>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#000000" metalness={1} roughness={0} transparent opacity={0.4} />
        </mesh>
      </Canvas>
    </div>
  );
});

export default ThreeViewer;
