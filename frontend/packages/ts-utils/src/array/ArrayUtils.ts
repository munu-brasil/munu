import { getRandomInt } from '../random';

export class ArrayUtils {
  static getRandom<T>(items: T[]): T {
    return items[getRandomInt(0, items.length - 1)];
  }

  static removeItem<T>(arr: T[], item: T): T[] {
    const index = arr.indexOf(item);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

  static changePosition<T>(arr: T[], from: number, to: number): T[] {
    let newArr = [...arr];
    const newIndex = to < 0 ? 0 : to >= newArr.length ? newArr.length - 1 : to;
    const item = newArr.splice(from, 1)[0];
    if (item) {
      newArr.splice(newIndex, 0, item);
    }
    return newArr;
  }

  static removeDuplicates<T>(arr: T[]): T[] {
    const sArray = arr.map((a) => JSON.stringify(a));
    return sArray
      .filter((v, i, a) => a.indexOf(v) == i)
      .map((a) => {
        try {
          return JSON.parse(a);
        } catch (e) {
          console.warn(e);
        }
      });
  }

  static compareArrays<T>(a: T[], b: T[]): boolean {
    return JSON.stringify(a.sort()) === JSON.stringify(b.sort());
  }

  static sectionArray<T>(a: T[], perChunk: number): T[][] {
    return a.reduce((ra, item, index) => {
      const chunkIndex = Math.floor(index / perChunk);
      const res = [...(ra ?? [])] as T[][];

      if (!res[chunkIndex]) {
        res[chunkIndex] = [];
      }

      res[chunkIndex].push(item);

      return res as never[];
    }, []);
  }
}
