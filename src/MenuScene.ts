import Game from './Game';
import SceneManager, { Scene, SceneTransitionState } from '@basementuniverse/scene-manager';
import { lerp } from '@basementuniverse/utils';
import InputManager from '@basementuniverse/input-manager';
import { GameScene } from './GameScene';
import ContentManager from '@basementuniverse/content-manager';
import { vec } from '@basementuniverse/vec';

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

    const y = lerp(-50, Game.screen.y * 0.8, this.transitionAmount);
    context.fillStyle = 'white';
    context.font = '24px monospace';
    context.textAlign = 'center';
    context.fillText('Press a key to start', Game.screen.x / 2, y);

    context.restore();
  }
}
