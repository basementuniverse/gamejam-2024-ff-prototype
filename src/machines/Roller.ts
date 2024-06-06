import ContentManager from '@basementuniverse/content-manager';
import { pluck } from '@basementuniverse/utils';
import { vec } from '@basementuniverse/vec';
import { FactoryFloor } from '../FactoryFloor';
import { Item } from '../Item';
import { Machine } from './Machine';

export class Roller extends Machine {
  private static readonly WORKING_JITTER_FREQUENCY = 15;
  private static readonly WORKING_JITTER_AMPLITUDE = 2;

  public rollingTime = 2;
  public rollingProgress = 0;
  public rollingItem: Item | null = null;

  private t = 0;

  public constructor(data: Partial<Roller> = {}) {
    super(pluck(data, 'position', 'direction'));
  }

  public tick(factory: FactoryFloor): Roller {
    const cloned = this.clone();

    cloned.status = 'idle';

    if (cloned.rollingItem) {
      cloned.status = 'working';
      cloned.rollingProgress += 1;

      if (cloned.rollingProgress >= cloned.rollingTime) {
        const gratedItem = Item.clone(cloned.rollingItem);
        gratedItem.mergeTags('rolled');

        cloned.outputItem = gratedItem;
        cloned.rollingItem = null;
        cloned.rollingProgress = 0;
      }
    }

    const inputMachine = factory.findAdjacentMachine(
      cloned.position,
      factory.adjustDirection(cloned.direction, cloned.input)
    );

    if (inputMachine && inputMachine.outputItem && !cloned.rollingItem) {
      cloned.rollingItem = inputMachine.take(factory);
    }

    return cloned;
  }

  public reset(): Roller {
    return new Roller(this);
  }

  public clone(): Roller {
    const cloned = new Roller(this);

    cloned.rollingTime = this.rollingTime;
    cloned.rollingProgress = this.rollingProgress;
    cloned.rollingItem = this.rollingItem;

    return cloned;
  }

  public update(dt: number) {
    this.t += dt;
  }

  public draw(context: CanvasRenderingContext2D, size: number) {
    context.save();
    context.translate(this.position.x * size, this.position.y * size);

    const p = vec(0, 0);
    if (this.status === 'working') {
      p.x =
        Math.sin(this.t * Roller.WORKING_JITTER_FREQUENCY) *
        Roller.WORKING_JITTER_AMPLITUDE;
      p.y =
        Math.cos(this.t * Roller.WORKING_JITTER_FREQUENCY) *
        Roller.WORKING_JITTER_AMPLITUDE;
    }

    let image: HTMLImageElement | undefined = undefined;
    switch (this.direction) {
      case 'left':
        image = ContentManager.get<HTMLImageElement>('roller-left');
        break;

      case 'right':
        image = ContentManager.get<HTMLImageElement>('roller-right');
        break;

      case 'up':
        image = ContentManager.get<HTMLImageElement>('roller-up');
        break;

      case 'down':
        image = ContentManager.get<HTMLImageElement>('roller-down');
        break;
    }

    if (image) {
      context.drawImage(image, p.x, p.y, size, size);
    }

    context.restore();
  }

  public debugOutput(): string {
    const rollingItem = this.rollingItem?.debugOutput() || '-';
    return `ROL${super.debugOutput()}(${rollingItem}:${this.rollingProgress}/${
      this.rollingTime
    })`;
  }
}
