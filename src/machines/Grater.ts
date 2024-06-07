import ContentManager from '@basementuniverse/content-manager';
import { pluck } from '@basementuniverse/utils';
import { vec } from '@basementuniverse/vec';
import { FactoryFloor } from '../FactoryFloor';
import { Item } from '../Item';
import { Machine } from './Machine';

export class Grater extends Machine {
  private static readonly WORKING_JITTER_FREQUENCY = 15;
  private static readonly WORKING_JITTER_AMPLITUDE = 2;

  public gratingTime = 2;
  public gratingProgress = 0;
  public gratingItem: Item | null = null;

  private t = 0;

  public constructor(data: Partial<Grater> = {}) {
    super(pluck(data, 'position', 'direction'));
  }

  public tick(factory: FactoryFloor): Grater {
    const cloned = this.clone();

    cloned.status = 'idle';

    if (cloned.gratingItem) {
      cloned.status = 'working';
      cloned.gratingProgress += 1;

      if (cloned.gratingProgress >= cloned.gratingTime) {
        const gratedItem = Item.clone(cloned.gratingItem);
        gratedItem.mergeTags('grated');

        cloned.outputItem = gratedItem;
        cloned.gratingItem = null;
        cloned.gratingProgress = 0;
      }
    }

    const inputMachine = factory.findAdjacentMachine(
      cloned.position,
      factory.adjustDirection(cloned.direction, cloned.input)
    );

    if (inputMachine && inputMachine.outputItem && !cloned.gratingItem) {
      cloned.gratingItem = inputMachine.take(factory);
    }

    return cloned;
  }

  public reset(): Grater {
    return new Grater(this);
  }

  public clone(): Grater {
    const cloned = new Grater(this);

    cloned.gratingTime = this.gratingTime;
    cloned.gratingProgress = this.gratingProgress;
    cloned.gratingItem = this.gratingItem;

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
        Math.sin(this.t * Grater.WORKING_JITTER_FREQUENCY) *
        Grater.WORKING_JITTER_AMPLITUDE;
      p.y =
        Math.cos(this.t * Grater.WORKING_JITTER_FREQUENCY) *
        Grater.WORKING_JITTER_AMPLITUDE;
    }

    let image: HTMLImageElement | undefined = undefined;
    switch (this.direction) {
      case 'left':
        image = ContentManager.get<HTMLImageElement>('grater-left');
        break;

      case 'right':
        image = ContentManager.get<HTMLImageElement>('grater-right');
        break;

      case 'up':
        image = ContentManager.get<HTMLImageElement>('grater-up');
        break;

      case 'down':
        image = ContentManager.get<HTMLImageElement>('grater-down');
        break;
    }

    if (image) {
      context.drawImage(image, p.x, p.y, size, size);
    }

    if (this.gratingItem) {
      this.gratingItem.draw(
        context,
        vec.mul(vec(size), 0.35),
        vec.mul(vec(size), 0.4)
      );
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
    const gratingItem = this.gratingItem?.debugOutput() || '-';
    return `GRT${super.debugOutput()}(${gratingItem}:${this.gratingProgress}/${
      this.gratingTime
    })`;
  }
}
