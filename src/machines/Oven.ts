import { vec } from '@basementuniverse/vec';
import { GameScene } from '../GameScene';
import { Machine } from './Machine';

export class Oven extends Machine {
  cookingTime = 5;
  currentCookingTime = 0;

  public tick(game: GameScene, p: vec) {
    //
  }

  public render(): string {
    return `OVN${super.render()}`;
  }
}
