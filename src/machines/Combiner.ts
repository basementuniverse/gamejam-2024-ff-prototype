import { pluck } from '@basementuniverse/utils';
import { FactoryFloor } from '../FactoryFloor';
import { Item } from '../Item';
import { Facing } from '../types';
import { Machine } from './Machine';
import ContentManager from '@basementuniverse/content-manager';

export class Combiner extends Machine {
  public inputs: Facing[] = ['left', 'right', 'back'];
  public combiningItemA: Item | null = null;
  public combiningItemB: Item | null = null;

  public constructor(
    data: Partial<Combiner> & {
      inputs?: Facing[];
    } = {}
  ) {
    super(pluck(data, 'position', 'direction'));

    if (data.inputs) {
      this.inputs = data.inputs;
    }
  }

  public tick(factory: FactoryFloor): Combiner {
    const cloned = this.clone();

    if (cloned.combiningItemA && cloned.combiningItemB) {
      const combinedItem = Item.clone(cloned.combiningItemA);
      combinedItem.addTags(...cloned.combiningItemB.tags);

      cloned.outputItem = combinedItem;
      cloned.combiningItemA = null;
      cloned.combiningItemB = null;
    }

    for (const input of cloned.inputs) {
      const inputMachine = factory.findAdjacentMachine(
        cloned.position,
        factory.adjustDirection(cloned.direction, input)
      );

      if (inputMachine && inputMachine.outputItem) {
        if (!cloned.combiningItemA) {
          cloned.combiningItemA = inputMachine.take(factory);
        } else if (!cloned.combiningItemB) {
          cloned.combiningItemB = inputMachine.take(factory);
        }
      }
    }

    return cloned;
  }

  public reset(): Combiner {
    return new Combiner({
      ...this,
      inputs: this.inputs,
    });
  }

  public clone(): Combiner {
    const cloned = new Combiner(this);

    cloned.inputs = this.inputs;
    cloned.combiningItemA = this.combiningItemA;
    cloned.combiningItemB = this.combiningItemB;

    return cloned;
  }

  public update(dt: number) {}

  public draw(context: CanvasRenderingContext2D, size: number) {
    context.save();
    context.translate(this.position.x * size, this.position.y * size);

    let image: HTMLImageElement | undefined = undefined;
    switch (this.direction) {
      case 'left':
        image = ContentManager.get<HTMLImageElement>('combiner-left');
        break;

      case 'right':
        image = ContentManager.get<HTMLImageElement>('combiner-right');
        break;

      case 'up':
        image = ContentManager.get<HTMLImageElement>('combiner-up');
        break;

      case 'down':
        image = ContentManager.get<HTMLImageElement>('combiner-down');
        break;
    }

    if (image) {
      context.drawImage(image, 0, 0, size, size);
    }

    context.restore();
  }

  public debugOutput(): string {
    const combiningItemA = this.combiningItemA?.debugOutput() || '-';
    const combiningItemB = this.combiningItemB?.debugOutput() || '-';
    return `CMB${super.debugOutput()}(${combiningItemA}+${combiningItemB})`;
  }
}
