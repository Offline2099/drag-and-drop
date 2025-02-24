import { Injectable, WritableSignal } from '@angular/core';
import { timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  /** 
   * Inverts the value of a Boolean signal for the specified duration in milliseconds.
   * Does not take into account any possible value changes within the duration.
   */
  blink(value: WritableSignal<boolean>, duration: number): void {
    value.update(current => !current);
    timer(duration).subscribe(() => value.update(current => !current));
  }

  /** Returns a random integer between ```min``` and ```max```, including both. */
  randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** Creates an array of consecutive integers from ```min``` to ```max```, including both. */
  consecutiveIntegers(min: number, max: number): number[] {
    if (max < min) return [];
    return [...Array(Math.floor(max - min + 1)).keys()].map(i => i + min);
  }

  /** Shuffles an array in place, does not create a new array. */
  shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /** Checks whether two arrays are identical. */
  areArraysEqual<T>(array1: T[], array2: T[]): boolean {
    return array1.length === array2.length 
      ? array1.every((element, index) => element === array2[index])
      : false;
  }

  /** Calculates the sum of all elements in an array before a given index. */
  sumToIndex(array: number[], index: number): number {
    if (!array.length || index <= 0) return 0;
    return array.reduce((acc, el, i) => (i < index ? acc + el : acc), 0);
  }

  /** Picks a random element from an array. Returns ```undefined``` for empty arrays. */
  randomElement<T>(array: T[]): T | undefined {
    return array[this.randomInteger(0, array.length - 1)];
  }

  /** Returns a deep copy of an array or an object. */
  deepCopy<T>(entity: T): T {
    return JSON.parse(JSON.stringify(entity));
  }

  /** Inserts an element into an array at the given index. */
  insertElement<T>(list: T[], element: T, index: number): void {
    list.splice(index, 0, element);
  }

  /** Replaces an element of an array at the given index with the given element. */
  replaceElement<T>(list: T[], element: T, index: number): void {
    list.splice(index, 1, element);
  }

  /** Deletes an element of an array at the given index. */
  deleteElement<T>(list: T[], index: number): void {
    list.splice(index, 1);
  }

  /** Swaps two elements in two different arrays or in the same array. */
  swapElements<T>(sourceList: T[], targetList: T[], sourceIndex: number, targetIndex: number): void {
    const target: T = this.deepCopy(targetList[targetIndex]);
    this.replaceElement(targetList, sourceList[sourceIndex], targetIndex);
    this.replaceElement(sourceList, target, sourceIndex);
  }

  /** Converts a table (matrix) grouped by rows to the same table but grouped by columns. */
  rowsToColumns<T>(rows: T[][]): T[][] {
    if (rows.length === 0) return [];
    const numberOfRows = rows.length;
    const numberOfColumns = rows[0].length;
    const columns: T[][] = Array.from({length: numberOfColumns}, () => []);
    for (let i = 0; i < numberOfRows; i++) {
      for (let j = 0; j < numberOfColumns; j++) {
        columns[j].push(rows[i][j]);
      }
    }
    return columns;
  }

  /** Converts a table (matrix) grouped by columns to the same table but grouped by rows. */
  columnsToRows<T>(columns: T[][]): T[][] {
    if (columns.length === 0) return [];
    const numberOfColumns = columns.length;
    const numberOfRows = columns[0].length;
    const rows: T[][] = Array.from({length: numberOfRows}, () => []);
    for (let j = 0; j < numberOfColumns; j++) {
      for (let i = 0; i < numberOfRows; i++) {
        rows[i].push(columns[j][i]);
      }
    }
    return rows;
  }

  /** 
   * Checks if the mouse event target is a DOM element with the given class
   * or a child of such an element.
   */
  isTargetInside(event: MouseEvent, className: string): boolean {
    let element: HTMLElement | null = event.target as HTMLElement;
    while (element) {
      if (element.classList.contains(className)) return true;
      element = element.parentElement;
    }
    return false;
  }

}