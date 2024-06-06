import { vec } from '@basementuniverse/vec';
import { FactoryFloor } from '../FactoryFloor';
import { Direction, Facing } from '../types';
import { Machine } from './Machine';

export class Conveyor extends Machine {
  public constructor(
    data: {
      position?: vec;
      input?: Facing;
      output?: Direction;
    } = {}
  ) {
    if (data.input === 'front') {
      throw new Error('conveyor input cannot be facing front');
    }

    super({
      position: data.position,
      direction: data.output || 'right',
      input: data.input || 'back',
    });
  }

  public tick(factory: FactoryFloor): Conveyor {
    const cloned = this.clone();

    const inputMachine = factory.findAdjacentMachine(
      cloned.position,
      factory.adjustDirection(cloned.direction, cloned.input)
    );

    if (inputMachine && inputMachine.outputItem && !cloned.outputItem) {
      cloned.outputItem = inputMachine.take(factory);
    }

    return cloned;
  }

  public clone(): Conveyor {
    const cloned = new Conveyor({
      position: this.position,
      input: this.input,
      output: this.direction,
    });

    cloned.outputItem = this.outputItem;

    return cloned;
  }

  public debugOutput(): string {
    return `CNV${super.debugOutput()}`;
  }
}
