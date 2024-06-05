import { vec } from '@basementuniverse/vec';
import Game from './Game';
import SceneManager, {
  Scene,
  SceneTransitionState,
} from '@basementuniverse/scene-manager';
import InputManager from '@basementuniverse/input-manager';
import Camera from '@basementuniverse/camera';
import { FactoryFloor } from './FactoryFloor';

export type Direction = 'left' | 'right' | 'up' | 'down';
export type Facing = 'front' | 'back' | 'left' | 'right';

export class GameScene extends Scene {
  private static readonly TRANSITION_TIME: number = 1;

  private static readonly FACTORY_FLOOR_WIDTH = 10;
  private static readonly FACTORY_FLOOR_HEIGHT = 10;

  private static readonly DIRECTIONS: { [direction in Direction]: vec } = {
    left: vec(-1, 0),
    right: vec(1, 0),
    up: vec(0, -1),
    down: vec(0, 1),
  };

  private static readonly FACINGS: {
    [facing in Facing]: (direction: Direction) => vec;
  } = {
    front: (direction: Direction) => GameScene.DIRECTIONS[direction],
    back: (direction: Direction) => vec(
      GameScene.DIRECTIONS[direction].x * -1,
      GameScene.DIRECTIONS[direction].y * -1
    ),
    left: (direction: Direction) => vec(
      GameScene.DIRECTIONS[direction].y,
      GameScene.DIRECTIONS[direction].x * -1
    ),
    right: (direction: Direction) => vec(
      GameScene.DIRECTIONS[direction].y * -1,
      GameScene.DIRECTIONS[direction].x
    ),
  };

  public factoryFloor: FactoryFloor;
  private camera: Camera;

  public constructor() {
    super({
      transitionTime: GameScene.TRANSITION_TIME,
    });
  }

  public initialise() {
    this.camera = new Camera(vec());
    this.factoryFloor = new FactoryFloor(vec(
      GameScene.FACTORY_FLOOR_WIDTH,
      GameScene.FACTORY_FLOOR_HEIGHT
    ));
    this.factoryFloor.initialise();
  }

  public update(dt: number) {
    if (InputManager.keyPressed('Escape')) {
      SceneManager.pop();
    }

    // ...
    if (InputManager.keyPressed('Space')) {
      this.factoryFloor.tick(this);
      this.factoryFloor.render();
    }

    if (InputManager.keyPressed('C')) {
      this.factoryFloor.initialise();
      this.factoryFloor.render();
    }
  }

  public adjustDirection(direction: Direction, facing: Facing): vec {
    return GameScene.FACINGS[facing](direction);
  }

  public draw(context: CanvasRenderingContext2D) {
    context.save();
    if (this.transitionState !== SceneTransitionState.None) {
      context.globalAlpha = this.transitionAmount;
    }

    // Background
    context.fillStyle = '#555';
    context.fillRect(0, 0, Game.screen.x, Game.screen.y);

    context.save();
    this.camera.draw(context, Game.screen.x, Game.screen.y);

    // ...

    context.restore();
    context.restore();
  }
}
