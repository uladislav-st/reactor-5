import {
  Camera,
  EventKeyboard,
  EventMouse,
  EventTouch,
  Input,
  KeyCode,
  Vec2,
  Vec3,
  input,
} from 'cc';
import { GameConfig } from '../core/GameConfig';
import { TapInput } from '../core/Types';

export type TapListener = (tap: TapInput) => void;

export class InputService {
  private camera: Camera | null = null;
  private readonly tapListeners = new Set<TapListener>();
  private readonly pressedKeys = new Set<KeyCode>();

  init(camera: Camera): void {
    this.camera = camera;
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);

    if (GameConfig.enableKeyboardDebug) {
      input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
      input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
  }

  dispose(): void {
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    this.tapListeners.clear();
    this.pressedKeys.clear();
  }

  onTap(listener: TapListener): void {
    this.tapListeners.add(listener);
  }

  offTap(listener: TapListener): void {
    this.tapListeners.delete(listener);
  }

  getKeyboardDirection(): Vec3 | null {
    if (!GameConfig.enableKeyboardDebug || this.pressedKeys.size === 0) {
      return null;
    }

    const direction = new Vec3();
    if (this.pressedKeys.has(KeyCode.KEY_W) || this.pressedKeys.has(KeyCode.ARROW_UP)) {
      direction.y += 1;
    }
    if (this.pressedKeys.has(KeyCode.KEY_S) || this.pressedKeys.has(KeyCode.ARROW_DOWN)) {
      direction.y -= 1;
    }
    if (this.pressedKeys.has(KeyCode.KEY_A) || this.pressedKeys.has(KeyCode.ARROW_LEFT)) {
      direction.x -= 1;
    }
    if (this.pressedKeys.has(KeyCode.KEY_D) || this.pressedKeys.has(KeyCode.ARROW_RIGHT)) {
      direction.x += 1;
    }

    if (direction.length() === 0) {
      return null;
    }

    return direction.normalize();
  }

  private onTouchEnd(event: EventTouch): void {
    const location = event.getLocation();
    this.emitTap(location.x, location.y);
  }

  private onMouseUp(event: EventMouse): void {
    const location = event.getLocation();
    this.emitTap(location.x, location.y);
  }

  private onKeyDown(event: EventKeyboard): void {
    this.pressedKeys.add(event.keyCode);
  }

  private onKeyUp(event: EventKeyboard): void {
    this.pressedKeys.delete(event.keyCode);
  }

  private emitTap(screenX: number, screenY: number): void {
    const worldPosition = this.screenToWorld(screenX, screenY);
    const tap: TapInput = { worldPosition, screenX, screenY };

    for (const listener of this.tapListeners) {
      listener(tap);
    }
  }

  private screenToWorld(screenX: number, screenY: number): Vec3 {
    if (!this.camera) {
      return new Vec3(screenX, screenY, 0);
    }

    const world = new Vec3();
    this.camera.screenToWorld(new Vec3(screenX, screenY, 0), world);
    return world;
  }
}
