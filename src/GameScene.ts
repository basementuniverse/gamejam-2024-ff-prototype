import Camera from '@basementuniverse/camera';
import ContentManager from '@basementuniverse/content-manager';
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

export type ToolMode =
  | 'select'
  | 'rotate'
  | 'delete'
  | 'create-conveyor'
  | 'create-combiner'
  | 'create-oven'
  | 'create-slicer'
  | 'create-grater'
  | 'create-roller'
  | 'create-blender';

export class GameScene extends Scene {
  private static readonly TRANSITION_TIME: number = 1;
  private static readonly TICK_TIME = 1;
  private static readonly TOOLBAR_WIDTH = 680;

  public factoryFloor: FactoryFloor;
  public customers: Customer[] = [];

  private camera: Camera;
  private playing = false;
  private tickTimer = 0;

  private toolMode: ToolMode = 'select';

  private playButton: Button;
  private stepButton: Button;
  private resetButton: Button;

  private selectButton: Button;
  private rotateButton: Button;
  private deleteButton: Button;

  private createConveyorButton: Button;
  private createCombinerButton: Button;
  private createOvenButton: Button;
  private createSlicerButton: Button;
  private createGraterButton: Button;
  private createRollerButton: Button;
  private createBlenderButton: Button;

  private music: HTMLAudioElement | null = null;

  public constructor() {
    super({
      transitionTime: GameScene.TRANSITION_TIME,
    });
  }

  public play() {
    this.playing = true;
    this.playButton.label = 'Stop';
    this.playButton.colour = '#f56262';
  }

  public stop() {
    this.playing = false;
    this.playButton.label = 'Play';
    this.playButton.colour = '#89cc87';
  }

  public win() {
    this.stop();

    if (this.customers.length > 0) {
      this.customers[0].status = 'served-happy';
    }

    const winSound = ContentManager.get<HTMLAudioElement>('win-sound');
    if (winSound) {
      winSound.play();
    }
  }

  public lose() {
    this.stop();

    if (this.customers.length > 0) {
      this.customers[0].status = 'served-angry';
    }

    const loseSound = ContentManager.get<HTMLAudioElement>('lose-sound');
    if (loseSound) {
      loseSound.play();
    }
  }

  public initialise() {
    this.camera = new Camera(vec());

    // Transport buttons
    this.playButton = new Button(
      vec(this.camera.bounds.left + 10, this.camera.bounds.bottom - 40),
      vec(100, 30),
      null,
      '#89cc87',
      'Play',
      () => {
        if (this.playing) {
          this.stop();
        } else {
          this.play();
        }
      }
    );
    this.stepButton = new Button(
      vec(this.camera.bounds.left + 120, this.camera.bounds.bottom - 40),
      vec(100, 30),
      null,
      'white',
      'Step',
      () => {
        this.factoryFloor.tick(this);
      }
    );
    this.resetButton = new Button(
      vec(this.camera.bounds.left + 230, this.camera.bounds.bottom - 40),
      vec(100, 30),
      null,
      'white',
      'Reset',
      () => {
        this.factoryFloor.reset();

        for (const customer of this.customers) {
          customer.reset();
        }
      }
    );

    // Tool buttons
    const toolbarStart = this.camera.position.x - GameScene.TOOLBAR_WIDTH / 2;
    this.selectButton = new Button(
      vec(toolbarStart, this.camera.bounds.top + 10),
      vec(50, 50),
      'select',
      null,
      '',
      () => {
        this.toolMode = 'select';
      }
    );
    this.rotateButton = new Button(
      vec(toolbarStart + 50 + 20, this.camera.bounds.top + 10),
      vec(50, 50),
      'rotate',
      null,
      '',
      () => {
        this.toolMode = 'rotate';
      }
    );
    this.deleteButton = new Button(
      vec(toolbarStart + 100 + 40, this.camera.bounds.top + 10),
      vec(50, 50),
      'delete',
      null,
      '',
      () => {
        this.toolMode = 'delete';
      }
    );

    // Create machine buttons
    this.createConveyorButton = new Button(
      vec(toolbarStart + 150 + 60, this.camera.bounds.top + 10),
      vec(50, 50),
      'conveyor-right',
      null,
      '',
      () => {
        this.toolMode = 'create-conveyor';
      }
    );
    this.createCombinerButton = new Button(
      vec(toolbarStart + 200 + 80, this.camera.bounds.top + 10),
      vec(50, 50),
      'combiner-right',
      null,
      '',
      () => {
        this.toolMode = 'create-combiner';
      }
    );
    this.createOvenButton = new Button(
      vec(toolbarStart + 250 + 100, this.camera.bounds.top + 10),
      vec(50, 50),
      'oven-right',
      null,
      '',
      () => {
        this.toolMode = 'create-oven';
      }
    );
    this.createSlicerButton = new Button(
      vec(toolbarStart + 300 + 120, this.camera.bounds.top + 10),
      vec(50, 50),
      'slicer-right',
      null,
      '',
      () => {
        this.toolMode = 'create-slicer';
      }
    );
    this.createGraterButton = new Button(
      vec(toolbarStart + 350 + 140, this.camera.bounds.top + 10),
      vec(50, 50),
      'grater-right',
      null,
      '',
      () => {
        this.toolMode = 'create-grater';
      }
    );
    this.createRollerButton = new Button(
      vec(toolbarStart + 400 + 160, this.camera.bounds.top + 10),
      vec(50, 50),
      'roller-right',
      null,
      '',
      () => {
        this.toolMode = 'create-roller';
      }
    );
    this.createBlenderButton = new Button(
      vec(toolbarStart + 450 + 180, this.camera.bounds.top + 10),
      vec(50, 50),
      'blender-right',
      null,
      '',
      () => {
        this.toolMode = 'create-blender';
      }
    );

    const music = ContentManager.get<HTMLAudioElement>('game-music');
    if (music) {
      this.music = music;
      this.music.loop = true;
      this.music.volume = 0.3;
      this.music.play();
    }

    // Create the first customer
    this.customers.push(new Customer());

    // Create the factory floor
    this.factoryFloor = new FactoryFloor();
    this.factoryFloor.initialise();
  }

  public update(dt: number) {
    if (InputManager.keyPressed('Escape')) {
      if (this.music) {
        this.music.pause();
        this.music.currentTime = 0;
      }

      SceneManager.pop();
    }

    Debug.value('ticks', this.factoryFloor.tickCount);
    Debug.value('tool', this.toolMode);

    // Transport buttons
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

    // Tool buttons
    const toolbarStart = this.camera.position.x - GameScene.TOOLBAR_WIDTH / 2;
    this.selectButton.position = vec(toolbarStart, this.camera.bounds.top + 10);
    this.selectButton.update(this.camera);

    this.rotateButton.position = vec(
      toolbarStart + 50 + 20,
      this.camera.bounds.top + 10
    );
    this.rotateButton.update(this.camera);

    this.deleteButton.position = vec(
      toolbarStart + 100 + 40,
      this.camera.bounds.top + 10
    );
    this.deleteButton.update(this.camera);

    // Create machine buttons
    this.createConveyorButton.position = vec(
      toolbarStart + 150 + 60,
      this.camera.bounds.top + 10
    );
    this.createConveyorButton.update(this.camera);

    this.createCombinerButton.position = vec(
      toolbarStart + 200 + 80,
      this.camera.bounds.top + 10
    );
    this.createCombinerButton.update(this.camera);

    this.createOvenButton.position = vec(
      toolbarStart + 250 + 100,
      this.camera.bounds.top + 10
    );
    this.createOvenButton.update(this.camera);

    this.createSlicerButton.position = vec(
      toolbarStart + 300 + 120,
      this.camera.bounds.top + 10
    );
    this.createSlicerButton.update(this.camera);

    this.createGraterButton.position = vec(
      toolbarStart + 350 + 140,
      this.camera.bounds.top + 10
    );
    this.createGraterButton.update(this.camera);

    this.createRollerButton.position = vec(
      toolbarStart + 400 + 160,
      this.camera.bounds.top + 10
    );
    this.createRollerButton.update(this.camera);

    this.createBlenderButton.position = vec(
      toolbarStart + 450 + 180,
      this.camera.bounds.top + 10
    );
    this.createBlenderButton.update(this.camera);

    // if (InputManager.keyPressed('Space')) {
    //   this.factoryFloor.tick(this);
    //   this.factoryFloor.debugOutput();
    // }

    // if (InputManager.keyPressed('KeyX')) {
    //   this.factoryFloor.initialise();
    //   this.factoryFloor.debugOutput();
    // }

    // if (InputManager.keyPressed('KeyC')) {
    //   this.customers.push(new Customer());
    //   console.log(this.customers);
    // }

    if (this.playing) {
      this.tickTimer += dt;

      if (this.tickTimer > GameScene.TICK_TIME) {
        this.factoryFloor.tick(this);
        this.tickTimer -= GameScene.TICK_TIME;
      }
    }

    this.factoryFloor.update(dt, this.camera, this.toolMode);
  }

  public draw(context: CanvasRenderingContext2D) {
    context.save();
    if (this.transitionState !== SceneTransitionState.None) {
      context.globalAlpha = this.transitionAmount;
    }

    const gradient = context.createLinearGradient(0, 0, 0, Game.screen.y);
    gradient.addColorStop(0, '#467b72');
    gradient.addColorStop(1, '#39655e');
    context.fillStyle = gradient;
    context.fillRect(0, 0, Game.screen.x, Game.screen.y);

    context.save();
    this.camera.draw(context, Game.screen.x, Game.screen.y);

    this.factoryFloor.draw(context, this.camera);

    this.playButton.draw(context);
    this.stepButton.draw(context);
    this.resetButton.draw(context);

    this.selectButton.draw(context);
    this.rotateButton.draw(context);
    this.deleteButton.draw(context);

    this.createConveyorButton.draw(context);
    this.createCombinerButton.draw(context);
    this.createOvenButton.draw(context);
    this.createSlicerButton.draw(context);
    this.createGraterButton.draw(context);
    this.createRollerButton.draw(context);
    this.createBlenderButton.draw(context);

    if (this.customers.length > 0) {
      this.customers[0].draw(context, this.camera);
    }

    context.restore();
    context.restore();
  }
}
