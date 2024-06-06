import { vec } from '@basementuniverse/vec';
import { Machine } from './machines/Machine';
import { Dispenser } from './machines/Dispenser';
import { Conveyor } from './machines/Conveyor';
import { ServingCounter } from './machines/ServingCounter';
import { Item } from './Item';
import { GameScene } from './GameScene';
import { Blender } from './machines/Blender';
import { times } from '@basementuniverse/utils';
import { Grater } from './machines/Grater';
import { Roller } from './machines/Roller';
import { Slicer } from './machines/Slicer';
import { Combiner } from './machines/Combiner';
import { Oven } from './machines/Oven';

export type Direction = 'left' | 'right' | 'up' | 'down';
export type Facing = 'front' | 'back' | 'left' | 'right';

export class FactoryFloor {
  public width: number = 10;
  public height: number = 10;

  private static readonly DIRECTIONS: { [direction in Direction]: vec } = {
    left: vec(-1, 0),
    right: vec(1, 0),
    up: vec(0, -1),
    down: vec(0, 1),
  };

  private static readonly FACINGS: {
    [facing in Facing]: (direction: Direction) => vec;
  } = {
    front: (direction: Direction) => FactoryFloor.DIRECTIONS[direction],
    back: (direction: Direction) => vec(
      FactoryFloor.DIRECTIONS[direction].x * -1,
      FactoryFloor.DIRECTIONS[direction].y * -1
    ),
    left: (direction: Direction) => vec(
      FactoryFloor.DIRECTIONS[direction].y,
      FactoryFloor.DIRECTIONS[direction].x * -1
    ),
    right: (direction: Direction) => vec(
      FactoryFloor.DIRECTIONS[direction].y * -1,
      FactoryFloor.DIRECTIONS[direction].x
    ),
  };

  public state: Machine[] = [];
  public newState: Machine[] = [];

  constructor(size?: vec) {
    if (size) {
      this.width = size.x;
      this.height = size.y;
    }
  }

  public initialise() {
    this.state = [];

    // const testFactory: Machine[] = [
    //   new Dispenser({ position: vec(4, 0), direction: 'down', item: new Item(['dough'])}),
    //   new Conveyor({ position: vec(4, 1), output: 'down'}),
    //   new Conveyor({ position: vec(4, 2), input: 'left', output: 'right'}),
    //   new Conveyor({ position: vec(5, 2), input: 'right', output: 'down'}),
    //   new Conveyor({ position: vec(5, 2), output: 'down'}),
    //   new Blender({ position: vec(5, 3), direction: 'down' }),
    //   new Conveyor({ position: vec(5, 4), output: 'down' }),
    //   new ServingCounter({ position: vec(5, 5), direction: 'down', expectedItem: new Item(['dough']) }),
    // ];

    const testFactory: Machine[] = [
      new Dispenser({ position: vec(1, 0), direction: 'down', item: new Item(['cheese']) }),
      new Dispenser({ position: vec(3, 0), direction: 'down', item: new Item(['tomato']) }),
      new Dispenser({ position: vec(5, 0), direction: 'down', item: new Item(['dough']) }),
      new Dispenser({ position: vec(7, 0), direction: 'down', item: new Item(['salami']) }),
      new Conveyor({ position: vec(1, 1), output: 'down' }),
      new Conveyor({ position: vec(3, 1), output: 'down' }),
      new Conveyor({ position: vec(5, 1), output: 'down' }),
      new Conveyor({ position: vec(7, 1), output: 'down' }),
      new Grater({ position: vec(1, 2), direction: 'down' }),
      new Blender({ position: vec(3, 2), direction: 'down' }),
      new Roller({ position: vec(5, 2), direction: 'down' }),
      new Slicer({ position: vec(7, 2), direction: 'down' }),
      new Conveyor({ position: vec(1, 3), output: 'down' }),
      new Conveyor({ position: vec(3, 3), output: 'down' }),
      new Conveyor({ position: vec(5, 3), output: 'down' }),
      new Conveyor({ position: vec(7, 3), output: 'down' }),
      new Combiner({ position: vec(1, 4), direction: 'down', inputs: ['back', 'left'] }),
      new Conveyor({ position: vec(2, 4), output: 'left' }),
      new Combiner({ position: vec(3, 4), direction: 'left', inputs: ['back', 'right'] }),
      new Conveyor({ position: vec(4, 4), output: 'left' }),
      new Combiner({ position: vec(5, 4), direction: 'left', inputs: ['back', 'right'] }),
      new Conveyor({ position: vec(6, 4), output: 'left' }),
      new Conveyor({ position: vec(7, 4), output: 'left', input: 'right' }),
      new Conveyor({ position: vec(1, 5), output: 'down' }),
      new Oven({ position: vec(1, 6), direction: 'down' }),
      new Conveyor({ position: vec(1, 7), output: 'down' }),
      new ServingCounter({
        position: vec(1, 8),
        direction: 'down',
        expectedItem: new Item([
          'dough_rolled_cooked',
          'cheese_grated_cooked',
          'tomato_blended_cooked',
          'salami_sliced_cooked',
        ]),
      }),
    ]

    this.state = testFactory;
  }

  public findAdjacentMachine(p: vec, direction: vec): Machine | null {
    const adjacentPosition = vec.add(p, direction);

    return this.findMachine(adjacentPosition);
  }

  public findMachine(p: vec): Machine | null {
    return this.state.find(machine => vec.eq(machine.position, p)) || null;
  }

  public adjustDirection(direction: Direction, facing: Facing): vec {
    return FactoryFloor.FACINGS[facing](direction);
  }

  public tick(game: GameScene) {
    this.newState = [];

    // temp
    let dispense = false;
    if (game.customers.length > 0 && game.customers[0].status === 'pending') {
      game.customers[0].status = 'waiting';
      dispense = true;
    }

    for (const machine of this.state) {
      if (machine instanceof Dispenser) {
        this.newState.push(machine.tick(this, dispense));
      } else {
        this.newState.push(machine.tick(this));
      }
    }

    this.state = this.newState;
  }

  public render() {
    console.table(
      times(
        y => times(
          x => this.findMachine(vec(x, y))?.render() || '-',
          this.width
        ),
        this.height
      )
    );
  }
}
