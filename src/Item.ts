export class Item {
  public tags: string[] = [];

  constructor(tags: string[]) {
    this.tags = tags;
  }

  static clone(item: Item): Item {
    return new Item([...item.tags]);
  }

  render(): string {
    return `I(${this.tags.join(' ')})`;
  }
}
