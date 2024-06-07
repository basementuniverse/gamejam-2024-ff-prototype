import ContentManager from '@basementuniverse/content-manager';
import { vec } from '@basementuniverse/vec';

export class Item {
  private static readonly TAGS_TO_ASSETS: {
    tags: string[];
    asset: string;
  }[] = [
    {
      tags: [
        'dough_rolled',
        'tomato_blended',
        'cheese_grated',
        'salami_sliced',
      ],
      asset: 'pizza_uncooked',
    },
    {
      tags: [
        'dough_rolled_cooked',
        'tomato_blended_cooked',
        'cheese_grated_cooked',
        'salami_sliced_cooked',
      ],
      asset: 'pizza_cooked',
    },
    {
      tags: ['dough'],
      asset: 'dough',
    },
    {
      tags: ['dough_rolled'],
      asset: 'dough_rolled',
    },
    {
      tags: ['cheese'],
      asset: 'cheese',
    },
    {
      tags: ['cheese_grated'],
      asset: 'cheese_grated',
    },
    {
      tags: ['tomato'],
      asset: 'tomato',
    },
    {
      tags: ['tomato_sliced'],
      asset: 'tomato_sliced',
    },
    {
      tags: ['tomato_blended'],
      asset: 'tomato_blended',
    },
    {
      tags: ['salami'],
      asset: 'salami',
    },
    {
      tags: ['salami_sliced'],
      asset: 'salami_sliced',
    },
    {
      tags: ['salami_sliced'],
      asset: 'salami_sliced',
    },
  ];

  public tags: string[] = [];

  constructor(tags: string[]) {
    this.tags = tags;
  }

  static clone(item: Item): Item {
    return new Item([...item.tags]);
  }

  public addTags(...tags: string[]) {
    this.tags = [...this.tags, ...tags];
  }

  public removeTags(...tags: string[]) {
    this.tags = this.tags.filter(tag => !tags.includes(tag));
  }

  public mergeTags(tagPostfix: string) {
    this.tags = this.tags.map(tag => `${tag}_${tagPostfix}`);
  }

  public hasSomeTags(...tags: string[]): boolean {
    return tags.some(tag => this.tags.includes(tag));
  }

  public hasAllTags(...tags: string[]): boolean {
    return tags.every(tag => this.tags.includes(tag));
  }

  public draw(context: CanvasRenderingContext2D, p: vec, s?: vec) {
    context.save();
    context.translate(p.x, p.y);

    let imageName = 'error';
    for (const { tags, asset } of Item.TAGS_TO_ASSETS) {
      if (
        tags.length === this.tags.length &&
        tags.every(tag => this.tags.includes(tag))
      ) {
        imageName = asset;
        break;
      }
    }

    const image = ContentManager.get<HTMLImageElement>(imageName);
    if (image) {
      context.drawImage(image, 0, 0, s?.x ?? image.width, s?.y ?? image.height);
    }

    context.restore();
  }

  debugOutput(): string {
    return `I(${this.tags.join(' ')})`;
  }
}
