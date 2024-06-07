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

  private music: HTMLAudioElement | null = null;

  public constructor() {
    super({
      transitionTime: MenuScene.TRANSITION_TIME,
    });
  }

  public initialise() {
    const music = ContentManager.get<HTMLAudioElement>('intro-music');
    if (music) {
      this.music = music;
      this.music.loop = true;
      this.music.volume = 0.3;
      this.music.play();
    }
  }

  public update(dt: number) {
    if (InputManager.keyPressed() || InputManager.mousePressed()) {
      if (this.music) {
        this.music.pause();
        this.music.currentTime = 0;
      }

      SceneManager.push(new GameScene());
    }
  }

  public draw(context: CanvasRenderingContext2D) {
    context.save();
    if (this.transitionState !== SceneTransitionState.None) {
      context.globalAlpha = this.transitionAmount;
    }

    const center = vec.mul(Game.screen, 0.5);

    const menuImage = ContentManager.get<HTMLImageElement>('ff');
    if (menuImage) {
      context.drawImage(
        menuImage,
        center.x - menuImage.width / 2,
        center.y - menuImage.height / 2,
        menuImage.width,
        menuImage.height
      );
    }

    const titleImage = ContentManager.get<HTMLImageElement>('title');
    if (titleImage) {
      const y1 = lerp(-100, Game.screen.y * 0.3, this.transitionAmount);
      context.drawImage(
        titleImage,
        center.x - titleImage.width / 2,
        y1,
        titleImage.width,
        titleImage.height
      );
    }

    const y2 = lerp(2500, Game.screen.y * 0.6, this.transitionAmount);
    context.fillStyle = 'white';
    context.font = '24px monospace';
    context.textAlign = 'center';
    context.fillText('Press a key to start', Game.screen.x / 2, y2);

    context.restore();
  }
}
