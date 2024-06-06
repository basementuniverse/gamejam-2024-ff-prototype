import { CameraBounds } from '@basementuniverse/camera';
import { vec } from '@basementuniverse/vec';

export type Bounds = CameraBounds;

export function boundsMargin(bounds: Bounds, margin: number = 0): Bounds {
  return {
    left: bounds.left - margin,
    right: bounds.right + margin,
    top: bounds.top - margin,
    bottom: bounds.bottom + margin,
  };
}

export function intersectPointAABB(point: vec, bounds: Bounds): boolean {
  return (
    point.x >= bounds.left &&
    point.x <= bounds.right &&
    point.y >= bounds.top &&
    point.y <= bounds.bottom
  );
}
