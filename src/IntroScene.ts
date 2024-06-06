import ContentManager from '@basementuniverse/content-manager';
import SceneManager, {
  Scene,
  SceneTransitionState,
} from '@basementuniverse/scene-manager';
import { vec } from '@basementuniverse/vec';
import * as content from '../content/content.json';
import Game from './Game';
import { MenuScene } from './MenuScene';
import * as constants from './constants';
import InputManager from '@basementuniverse/input-manager';

export class IntroScene extends Scene {
  private static readonly TRANSITION_TIME: number = 2;

  public constructor() {
    super({
      transitionTime: IntroScene.TRANSITION_TIME,
    });
  }

  public initialise() {}

  public update(dt: number) {
    if (InputManager.keyPressed()) {
      SceneManager.pop();
      SceneManager.push(new MenuScene());
    }
  }

  public draw(context: CanvasRenderingContext2D) {
    context.save();

    if (this.transitionState !== SceneTransitionState.None) {
      context.globalAlpha = this.transitionAmount;
    }

    const teamLogo = ContentManager.get<HTMLImageElement>('spknc');
    if (teamLogo) {
      const center = vec.mul(Game.screen, 0.5);
      const logoSize = vec.mul(vec(teamLogo.width, teamLogo.height), 0.4);
      context.drawImage(
        teamLogo,
        center.x - logoSize.x / 2,
        center.y - logoSize.y / 2,
        logoSize.x,
        logoSize.y
      );
    }

    context.restore();
  }
}
