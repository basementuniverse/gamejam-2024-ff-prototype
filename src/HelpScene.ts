import ContentManager from '@basementuniverse/content-manager';
import InputManager from '@basementuniverse/input-manager';
import SceneManager, {
  Scene,
  SceneTransitionState,
} from '@basementuniverse/scene-manager';
import { vec } from '@basementuniverse/vec';
import Game from './Game';

export class HelpScene extends Scene {
  private static readonly TRANSITION_TIME: number = 0.5;

  public constructor() {
    super({
      transitionTime: HelpScene.TRANSITION_TIME,
    });
  }

  public initialise() {}

  public update(dt: number) {
    if (InputManager.keyPressed()) {
      SceneManager.pop();
    }
  }

  public draw(context: CanvasRenderingContext2D) {
    context.save();
    if (this.transitionState !== SceneTransitionState.None) {
      context.globalAlpha = this.transitionAmount;
    }

    context.fillStyle = '#00000099';
    context.fillRect(0, 0, Game.screen.x, Game.screen.y);

    const center = vec.mul(Game.screen, 0.5);

    const instructionsImage =
      ContentManager.get<HTMLImageElement>('instructions');
    if (instructionsImage) {
      context.drawImage(
        instructionsImage,
        center.x - instructionsImage.width / 2,
        center.y - instructionsImage.height / 2,
        instructionsImage.width,
        instructionsImage.height
      );
    }

    context.restore();
  }
}
