import { Vec3 } from 'cc';

export function distance2D(a: Vec3, b: Vec3): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function moveTowards2D(current: Vec3, target: Vec3, maxDistance: number): Vec3 {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist <= maxDistance || dist === 0) {
    return target.clone();
  }

  const ratio = maxDistance / dist;
  return new Vec3(current.x + dx * ratio, current.y + dy * ratio, current.z);
}

export function isArrived(current: Vec3, target: Vec3, threshold: number): boolean {
  return distance2D(current, target) <= threshold;
}
