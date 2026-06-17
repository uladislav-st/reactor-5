import { Vec3 } from 'cc';

export interface TapInput {
  worldPosition: Vec3;
  screenX: number;
  screenY: number;
}

export type EventCallback = (...args: unknown[]) => void;
