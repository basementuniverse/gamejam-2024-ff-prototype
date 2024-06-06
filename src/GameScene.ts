import Camera from '@basementuniverse/camera';
import Debug from '@basementuniverse/debug';
import InputManager from '@basementuniverse/input-manager';
import SceneManager, {
  Scene,
  SceneTransitionState,
} from '@basementuniverse/scene-manager';
import { vec } from '@basementuniverse/vec';
import { Button } from './Button';
import { Customer } from './Customer';
import { FactoryFloor } from './FactoryFloor';
import Game from './Game';

export class GameScene extends Scene {
  private static readonly TRANSITION_TIME: number = 1;

  private static readonly TICK_TIME = 1;

  public factoryFloor: FactoryFloor;
  public customers: Customer[] = [];

  private camera: Camera;
  private playing = false;
  private playButton: Button;
  private stepButton: Button;
  private resetButton: Button;

  public constructor() {
    super({
      transitionTime: GameScene.TRANSITION_TIME,
    });
  }

  public initialise() {
    this.camera = new Camera(vec());
    this.factoryFloor = new FactoryFloor();
    this.factoryFloor.initialise();

    this.playButton = new Button(
      vec(this.camera.bounds.left + 10, this.camera.bounds.bottom - 40),
      vec(100, 30),
      null,
      'Play',
      () => {
        this.playing = !this.playing;
      }
    );
    this.stepButton = new Button(
      vec(this.camera.bounds.left + 120, this.camera.bounds.bottom - 40),
      vec(100, 30),
      null,
      'Step',
      () => {
        // ...
      }
    );
    this.resetButton = new Button(
      vec(this.camera.bounds.left + 230, this.camera.bounds.bottom - 40),
      vec(100, 30),
      null,
      'Reset',
      () => {
        // ...
      }
    );
  }

  public update(dt: number) {
    if (InputManager.keyPressed('Escape')) {
      SceneManager.pop();
    }

    Debug.value('playing', this.playing.toString());

    this.playButton.position = vec(
      this.camera.bounds.left + 10,
      this.camera.bounds.bottom - 40
    );
    this.playButton.update(this.camera);

    this.stepButton.position = vec(
      this.camera.bounds.left + 120,
      this.camera.bounds.bottom - 40
    );
    this.stepButton.update(this.camera);

    this.resetButton.position = vec(
      this.camera.bounds.left + 230,
      this.camera.bounds.bottom - 40
    );
    this.resetButton.update(this.camera);

    if (InputManager.keyPressed('Space')) {
      this.factoryFloor.tick(this);
      this.factoryFloor.debugOutput();
    }

    if (InputManager.keyPressed('KeyX')) {
      this.factoryFloor.initialise();
      this.factoryFloor.debugOutput();
    }

    if (InputManager.keyPressed('KeyC')) {
      this.customers.push(new Customer());
      console.log(this.customers);
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

    this.factoryFloor.draw(context, this.camera);

    this.playButton.draw(context);
    this.stepButton.draw(context);
    this.resetButton.draw(context);

    context.restore();
    context.restore();
  }
}
