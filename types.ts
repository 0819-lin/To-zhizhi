
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface StickyNote {
  id: string;
  name: string;
  message: string;
  imageUrl: string;
  position: Vector3;
  rotation: Vector3;
}

export interface SceneObject {
  id: string;
  type: 'box' | 'sphere' | 'torus' | 'cylinder' | 'plane' | 'particleTree';
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  color: string;
  wireframe: boolean;
  metalness: number;
  roughness: number;
  intensity?: number;
}

export interface SceneConfig {
  objects: SceneObject[];
  ambientLightIntensity: number;
  pointLightColor: string;
  pointLightPosition: Vector3;
  backgroundColor: string;
  showSnow?: boolean;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
