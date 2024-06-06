export class Item {
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

  debugOutput(): string {
    return `I(${this.tags.join(' ')})`;
  }
}
