import { vec } from '@basementuniverse/vec';
import { Direction, Facing, GameScene } from '../GameScene';
import { Item } from '../Item';

export class Machine {
  public direction: Direction = 'right';
  public input: Facing = 'back';
  public output: Facing = 'front';
  public internalItem: Item | null = null;
  public outputItem: Item | null = null;

  constructor(direction: Direction) {
    this.direction = direction;
  }

  tick(game: GameScene, p: vec) {}

  render(): string {
    const i = this.internalItem ? this.internalItem.render() : '-';
    const o = this.outputItem ? this.outputItem.render() : '-';
    return `(i:${i},o:${o})`;
  }
}
