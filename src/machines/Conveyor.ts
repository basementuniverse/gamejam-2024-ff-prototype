import ContentManager from '@basementuniverse/content-manager';
import { vec } from '@basementuniverse/vec';
import { FactoryFloor } from '../FactoryFloor';
import { Direction, Facing } from '../types';
import { Machine } from './Machine';

export class Conveyor extends Machine {
  public static readonly ROTATIONS = [
    'right_left',
    'right_right',
    'right_back',
    'down_left',
    'down_right',
    'down_back',
    'left_left',
    'left_right',
    'left_back',
    'up_left',
    'up_right',
    'up_back',
  ];

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

  public reset(): Conveyor {
    return new Conveyor({
      position: this.position,
      input: this.input,
      output: this.direction,
    });
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

  public update(dt: number) {}

  public draw(context: CanvasRenderingContext2D, size: number) {
    context.save();
    context.translate(this.position.x * size, this.position.y * size);

    let image: HTMLImageElement | undefined = undefined;

    switch (this.direction) {
      case 'left':
        switch (this.input) {
          case 'left':
            image = ContentManager.get<HTMLImageElement>('conveyor-up-left');
            break;

          case 'right':
            image = ContentManager.get<HTMLImageElement>('conveyor-down-left');
            break;

          case 'back':
            image = ContentManager.get<HTMLImageElement>('conveyor-left');
            break;
        }
        break;

      case 'right':
        switch (this.input) {
          case 'left':
            image = ContentManager.get<HTMLImageElement>('conveyor-down-right');
            break;

          case 'right':
            image = ContentManager.get<HTMLImageElement>('conveyor-up-right');
            break;

          case 'back':
            image = ContentManager.get<HTMLImageElement>('conveyor-right');
            break;
        }
        break;

      case 'up':
        switch (this.input) {
          case 'left':
            image = ContentManager.get<HTMLImageElement>('conveyor-right-up');
            break;

          case 'right':
            image = ContentManager.get<HTMLImageElement>('conveyor-left-up');
            break;

          case 'back':
            image = ContentManager.get<HTMLImageElement>('conveyor-up');
            break;
        }
        break;

      case 'down':
        switch (this.input) {
          case 'left':
            image = ContentManager.get<HTMLImageElement>('conveyor-right-down');
            break;

          case 'right':
            image = ContentManager.get<HTMLImageElement>('conveyor-left-down');
            break;

          case 'back':
            image = ContentManager.get<HTMLImageElement>('conveyor-down');
            break;
        }
        break;
    }

    if (image) {
      context.drawImage(image, 0, 0, size, size);
    }

    if (this.outputItem) {
      this.outputItem.draw(
        context,
        vec.mul(vec(size), 0.35),
        vec.mul(vec(size), 0.4)
      );
    }

    context.restore();
  }

  public debugOutput(): string {
    return `CNV${super.debugOutput()}`;
  }
}
