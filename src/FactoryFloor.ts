import Camera from '@basementuniverse/camera';
import ContentManager from '@basementuniverse/content-manager';
import InputManager from '@basementuniverse/input-manager';
import { times } from '@basementuniverse/utils';
import { vec } from '@basementuniverse/vec';
import { GameScene, ToolMode } from './GameScene';
import { Item } from './Item';
import { Blender } from './machines/Blender';
import { Combiner } from './machines/Combiner';
import { Conveyor } from './machines/Conveyor';
import { Dispenser } from './machines/Dispenser';
import { Grater } from './machines/Grater';
import { Machine } from './machines/Machine';
import { Oven } from './machines/Oven';
import { Roller } from './machines/Roller';
import { ServingCounter } from './machines/ServingCounter';
import { Slicer } from './machines/Slicer';
import { Direction, Facing } from './types';

export class FactoryFloor {
  private static readonly TILE_SIZE = 80;

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
    back: (direction: Direction) =>
      vec(
        FactoryFloor.DIRECTIONS[direction].x * -1,
        FactoryFloor.DIRECTIONS[direction].y * -1
      ),
    left: (direction: Direction) =>
      vec(
        FactoryFloor.DIRECTIONS[direction].y,
        FactoryFloor.DIRECTIONS[direction].x * -1
      ),
    right: (direction: Direction) =>
      vec(
        FactoryFloor.DIRECTIONS[direction].y * -1,
        FactoryFloor.DIRECTIONS[direction].x
      ),
  };

  public state: Machine[] = [];
  public newState: Machine[] = [];
  public tickCount = 0;

  public servingCounterValid: boolean | null = null;

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
      new Dispenser({
        position: vec(1, 0),
        direction: 'down',
        item: new Item(['cheese']),
      }),
      new Dispenser({
        position: vec(3, 0),
        direction: 'down',
        item: new Item(['tomato']),
      }),
      new Dispenser({
        position: vec(5, 0),
        direction: 'down',
        item: new Item(['dough']),
      }),
      new Dispenser({
        position: vec(7, 0),
        direction: 'down',
        item: new Item(['salami']),
      }),
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
      new Combiner({
        position: vec(1, 4),
        direction: 'down',
      }),
      new Conveyor({ position: vec(2, 4), output: 'left' }),
      new Combiner({
        position: vec(3, 4),
        direction: 'left',
      }),
      new Conveyor({ position: vec(4, 4), output: 'left' }),
      new Combiner({
        position: vec(5, 4),
        direction: 'left',
      }),
      new Conveyor({ position: vec(6, 4), output: 'left' }),
      new Conveyor({ position: vec(7, 4), output: 'left', input: 'right' }),
      new Conveyor({ position: vec(1, 5), output: 'down' }),
      new Oven({ position: vec(1, 6), direction: 'down' }),
      new Conveyor({ position: vec(1, 7), output: 'down' }),
      new Conveyor({ position: vec(1, 8), output: 'down' }),
      new ServingCounter({
        position: vec(1, 9),
        direction: 'down',
        expectedItem: new Item([
          'dough_rolled_cooked',
          'cheese_grated_cooked',
          'tomato_blended_cooked',
          'salami_sliced_cooked',
        ]),
      }),
    ];

    this.state = testFactory;
  }

  public addMachine(machine: Machine) {
    const placeSound = ContentManager.get<HTMLAudioElement>('place-sound');
    if (placeSound) {
      placeSound.play();
    }

    this.state.push(machine);
  }

  public removeMachine(p: vec) {
    const destroySound = ContentManager.get<HTMLAudioElement>('destroy-sound');
    if (destroySound) {
      destroySound.play();
    }

    this.state = this.state.filter(machine => !vec.eq(machine.position, p));
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
    this.tickCount++;
    this.newState = [];

    // temp
    let dispense = false;
    if (game.customers.length > 0 && game.customers[0].status === 'pending') {
      game.customers[0].status = 'waiting';
      dispense = true;
    }

    let previousServingCounterValid = this.servingCounterValid;

    for (const machine of this.state) {
      if (machine instanceof Dispenser) {
        this.newState.push(machine.tick(this, dispense));
      } else {
        this.newState.push(machine.tick(this));
      }
    }

    if (previousServingCounterValid === null) {
      if (this.servingCounterValid === true) {
        game.win();
      }
      if (this.servingCounterValid === false) {
        game.lose();
      }
    }

    this.state = this.newState;
  }

  public reset() {
    this.state = this.state.map(machine => machine.reset());
  }

  public update(dt: number, camera: Camera, toolMode: ToolMode) {
    for (const machine of this.state) {
      machine.update(dt);
    }

    const floorSize = vec.mul(
      vec(this.width, this.height),
      FactoryFloor.TILE_SIZE
    );
    const start = vec.sub(camera.position, vec.mul(floorSize, 0.5));

    if (InputManager.mousePressed()) {
      const mouse = camera.positionToWorld(InputManager.mousePosition);
      const p = vec(
        Math.floor((mouse.x - start.x) / FactoryFloor.TILE_SIZE),
        Math.floor((mouse.y - start.y) / FactoryFloor.TILE_SIZE)
      );

      if (p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height) {
        const machine = this.findMachine(p);
        switch (toolMode) {
          case 'select':
            break;

          case 'rotate':
            if (machine) {
              if (machine instanceof Conveyor) {
                const currentDirection = `${machine.direction}_${machine.input}`;
                const index = Conveyor.ROTATIONS.indexOf(currentDirection);
                const [newDirection, newInput] =
                  Conveyor.ROTATIONS[
                    (index + 1) % Conveyor.ROTATIONS.length
                  ].split('_');

                machine.direction = newDirection as Direction;
                machine.input = newInput as Facing;
                break;
              }

              if (machine instanceof Dispenser) {
                break;
              }

              const index = Machine.ROTATIONS.indexOf(machine.direction);
              machine.direction = Machine.ROTATIONS[
                (index + 1) % Machine.ROTATIONS.length
              ] as Direction;
            }
            break;

          case 'delete':
            if (machine) {
              if (machine instanceof Dispenser) {
                break;
              }

              if (machine instanceof ServingCounter) {
                break;
              }

              this.removeMachine(p);
            }
            break;

          case 'create-conveyor':
            if (machine) {
              break;
            }

            this.addMachine(new Conveyor({ position: p }));
            break;

          case 'create-combiner':
            if (machine) {
              break;
            }

            this.addMachine(new Combiner({ position: p, direction: 'right' }));
            break;

          case 'create-oven':
            if (machine) {
              break;
            }

            this.addMachine(new Oven({ position: p, direction: 'right' }));
            break;

          case 'create-slicer':
            if (machine) {
              break;
            }

            this.addMachine(new Slicer({ position: p, direction: 'right' }));
            break;

          case 'create-grater':
            if (machine) {
              break;
            }

            this.addMachine(new Grater({ position: p, direction: 'right' }));
            break;

          case 'create-roller':
            if (machine) {
              break;
            }

            this.addMachine(new Roller({ position: p, direction: 'right' }));
            break;

          case 'create-blender':
            if (machine) {
              break;
            }

            this.addMachine(new Blender({ position: p, direction: 'right' }));
            break;
        }
      }
    }
  }

  public draw(context: CanvasRenderingContext2D, camera: Camera) {
    const floorSize = vec.mul(
      vec(this.width, this.height),
      FactoryFloor.TILE_SIZE
    );
    const start = vec.sub(camera.position, vec.mul(floorSize, 0.5));

    context.save();
    context.translate(start.x, start.y);

    // Draw grid
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const p = vec(x * FactoryFloor.TILE_SIZE, y * FactoryFloor.TILE_SIZE);
        const s = vec(FactoryFloor.TILE_SIZE, FactoryFloor.TILE_SIZE);

        this.drawEmptyTile(context, p, s, x % 2 === y % 2);
      }
    }

    // Draw machines
    for (const machine of this.state) {
      machine.draw(context, FactoryFloor.TILE_SIZE);
    }

    context.restore();
  }

  public drawEmptyTile(
    context: CanvasRenderingContext2D,
    p: vec,
    s: vec,
    odd: boolean = false
  ) {
    context.save();

    context.fillStyle = odd ? '#ffffff20' : '#00000020';
    context.fillRect(p.x, p.y, s.x, s.y);

    context.restore();
  }

  public debugOutput() {
    console.table(
      times(
        y =>
          times(
            x => this.findMachine(vec(x, y))?.debugOutput() || '-',
            this.width
          ),
        this.height
      )
    );
  }
}
