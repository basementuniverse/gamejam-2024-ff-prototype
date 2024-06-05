import { vec } from '@basementuniverse/vec';
import { Direction, Facing, GameScene } from '../GameScene';
import { Machine } from './Machine';

export class Conveyor extends Machine {
  constructor(outputDirection: Direction, inputFacing: Facing = 'back') {
    if (inputFacing === 'front') {
      throw new Error('conveyor input cannot be facing front (that is the output)');
    }

    super(outputDirection);
    this.input = inputFacing;
  }

  public tick(game: GameScene, p: vec) {
    if (this.outputItem) {
      return;
    }

    if (this.internalItem) {
      this.outputItem = this.internalItem;
      this.internalItem = null;
    } else {
      const inputMachine = game.factoryFloor.findAdjacentMachine(
        p,
        game.adjustDirection(this.direction, this.input)
      );

      if (inputMachine && inputMachine.outputItem) {
        this.internalItem = inputMachine.outputItem;
        inputMachine.outputItem = null;
      }
    }
  }

  public render(): string {
    return `CNV${super.render()}`;
  }
}
