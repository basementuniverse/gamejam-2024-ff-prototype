import { vec } from '@basementuniverse/vec';
import { Machine } from './machines/Machine';
import { GameScene } from './GameScene';
import { Dispenser } from './machines/Dispenser';
import { Conveyor } from './machines/Conveyor';
import { ServingCounter } from './machines/ServingCounter';
import { Item } from './Item';

export class FactoryFloor {
  public width: number = 10;
  public height: number = 10;

  public tiles: (Machine | null)[][] = [];

  constructor(size: vec) {
    this.width = size.x;
    this.height = size.y;
  }

  public initialise() {
    for (let x = 0; x < this.width; x++) {
      this.tiles[x] = [];
      for (let y = 0; y < this.height; y++) {
        this.tiles[x][y] = null;
      }
    }

    const testFactory: (Machine | null)[][] = [
      [null, null, null, null, new Dispenser('down', new Item(['dough'])), null, null, null, null, null],
      [null, null, null, null, new Conveyor('down'), null, null, null, null, null],
      [null, null, null, null, new Conveyor('right', 'left'), new Conveyor('down', 'right'), null, null, null, null],
      [null, null, null, null, null, new Conveyor('down'), null, null, null, null],
      [null, null, null, null, null, new ServingCounter('down', new Item(['dough'])), null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
    ];

    this.tiles = testFactory;
  }

  public findAdjacentMachine(p: vec, direction: vec): Machine | null {
    return this.tiles[p.y + direction.y][p.x + direction.x];
  }

  public tick(game: GameScene) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x]) {
          this.tiles[y][x]!.tick(game, vec(x, y));
        }
      }
    }
  }

  public render() {
    console.table(this.tiles.map(row => row.map(cell => cell ? cell.render() : '-')));
  }
}
