import { vec } from '@basementuniverse/vec';
import Game from './Game';
import SceneManager, {
  Scene,
  SceneTransitionState,
} from '@basementuniverse/scene-manager';
import InputManager from '@basementuniverse/input-manager';
import Camera from '@basementuniverse/camera';
import { FactoryFloor } from './FactoryFloor';
import { Customer } from './Customer';

export class GameScene extends Scene {
  private static readonly TRANSITION_TIME: number = 1;

  public factoryFloor: FactoryFloor;
  public customers: Customer[] = [];

  private camera: Camera;

  public constructor() {
    super({
      transitionTime: GameScene.TRANSITION_TIME,
    });
  }

  public initialise() {
    this.camera = new Camera(vec());
    this.factoryFloor = new FactoryFloor();
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

    if (InputManager.keyPressed('KeyX')) {
      this.factoryFloor.initialise();
      this.factoryFloor.render();
    }

    if (InputManager.keyPressed('KeyC')) {
      this.customers.push(new Customer());
    }
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
