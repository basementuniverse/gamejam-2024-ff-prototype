import ContentManager from '@basementuniverse/content-manager';
import InputManager from '@basementuniverse/input-manager';
import SceneManager, {
  Scene,
  SceneTransitionState,
} from '@basementuniverse/scene-manager';
import { lerp } from '@basementuniverse/utils';
import { vec } from '@basementuniverse/vec';
import Game from './Game';
import { GameScene } from './GameScene';

export class MenuScene extends Scene {
  private static readonly TRANSITION_TIME: number = 1;

  public constructor() {
    super({
      transitionTime: MenuScene.TRANSITION_TIME,
    });
  }

  public initialise() {}

  public update(dt: number) {
    if (InputManager.keyPressed()) {
      SceneManager.push(new GameScene());
    }
  }

  public draw(context: CanvasRenderingContext2D) {
    context.save();
    if (this.transitionState !== SceneTransitionState.None) {
      context.globalAlpha = this.transitionAmount;
    }

    const menuImage = ContentManager.get<HTMLImageElement>('ff');
    if (menuImage) {
      const center = vec.mul(Game.screen, 0.5);
      const largestDimension = Math.max(Game.screen.x, Game.screen.y);

      context.drawImage(
        menuImage,
        center.x - largestDimension / 2,
        center.y - largestDimension / 2,
        largestDimension,
        largestDimension
      );
    }

    const y = lerp(-50, Game.screen.y / 2, this.transitionAmount);
    context.fillStyle = 'white';
    context.font = '24px monospace';
    context.textAlign = 'center';
    context.fillText('Press a key to start', Game.screen.x / 2, y);

    context.restore();
  }
}
