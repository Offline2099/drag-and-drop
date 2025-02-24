import { Injectable } from '@angular/core';
import { BaseElement, DraggableElement, ElementGroup, RecursiveElement } from '../types/elements';
import { Cell } from '../types/cell.interface';
import { RecursiveStructureConfig } from '../types/recursive-structure-config.interface';
import { UtilityService } from './utility.service';

const COPY_ID_SUFFIX: string = '-copy';

@Injectable({
  providedIn: 'root'
})
export class DataModelService {

  constructor(private ut: UtilityService) {}

  // ==========================================================================
  //  METHODS FOR LISTS AND GROUPS
  // ==========================================================================

  generateList(length: number, start: number = 1): DraggableElement[] {
    return this.ut.consecutiveIntegers(start, start + length - 1)
      .map(i => ({ id: `${i}`, number: i }));
  }

  generateGroups(config: number[]): ElementGroup[] {
    return this.ut.consecutiveIntegers(1, config.length)
      .map(i => ({
        id: `${i}`,
        list: this.generateList(config[i - 1], this.ut.sumToIndex(config, i - 1) + 1)
      }));
  }

  isAreaNextToElement(elementIndex: number, areaIndex: number): boolean {
    return elementIndex === areaIndex || elementIndex === areaIndex - 1;
  }

  adjustedSourceIndex(sourceIndex: number, targetIndex: number): number {
    return sourceIndex > targetIndex ? sourceIndex + 1 : sourceIndex;
  }

  adjustedTargetIndex(sourceIndex: number, targetIndex: number): number {
    return targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;
  }

  insertDraggableElement(list: BaseElement[], element: BaseElement, index: number): void {
    const copy: BaseElement = this.ut.deepCopy(element);
    copy.id += COPY_ID_SUFFIX;
    this.ut.insertElement(list, copy, index);
  }

  restoreInsertedId(list: BaseElement[], sourceIndex: number, targetIndex: number): void {
    const element: BaseElement = list[this.adjustedTargetIndex(sourceIndex, targetIndex)];
    element.id = element.id.replace(COPY_ID_SUFFIX, '');
  }

  // ==========================================================================
  //  METHODS FOR TABLES
  // ==========================================================================

  generateTable(rows: number, columns: number): DraggableElement[][] {
    return this.ut.consecutiveIntegers(1, rows)
      .map(row => this.generateList(columns, (row - 1) * columns + 1));
  }

  areSameCells(first: Cell, second: Cell): boolean {
    return first.row === second.row && first.column === second.column;
  }

  isAreaNextToCell(cell: Cell, isVertical: boolean, row: number, column: number): boolean {
    return isVertical
      ? cell.row === row && this.isAreaNextToElement(cell.column, column)
      : cell.column === column && this.isAreaNextToElement(cell.row, row);
  }

  canCellBeInserted(cell: Cell, isVertical: boolean, row: number, column: number): boolean {
    return (isVertical ? cell.row === row : cell.column === column) &&
      !this.isAreaNextToCell(cell, isVertical, row, column);
  }

  // ==========================================================================
  //  METHODS FOR NESTED (RECURSIVE) STRUCTURE
  // ==========================================================================

  generateNestedStructure(
    config: RecursiveStructureConfig,
    currentDepth: number = 0,
    parentId: string = '',
    elementsTotal: number = 0
  ): RecursiveElement[] {
    const length: number = this.baseLength(config, currentDepth, elementsTotal);
    const structure: RecursiveElement[] = [];
    for (let i = 1; i <= length; i++) {
      const id: string = currentDepth ? `${parentId}-${i}` : `${i}`;
      const position: number[] = id.split('-').map(part => Number(part));
      const counter: number = elementsTotal + length - i + 1 + this.countElements(structure);
      structure.push({
        id,
        initialPosition: position,
        currentPosition: position,
        isRepositioned: false,
        children: currentDepth !== config.maxInitialDepth 
          ? this.generateNestedStructure(config, currentDepth + 1, id, counter)
          : []
      });
    }
    return structure;
  }

  baseLength(config: RecursiveStructureConfig, currentDepth: number, elementsTotal: number): number {
    if (!currentDepth && config.topLevelLegnth) return config.topLevelLegnth;
    const allowed: number = config.maxElementsTotal 
      ? config.maxElementsTotal - elementsTotal
      : config.maxChildren;
    const min: number = Math.min(allowed, config.minChildren);
    const max: number = Math.min(allowed, config.maxChildren);
    return this.ut.randomInteger(min, max);
  }

  countElements(structure: RecursiveElement[]): number {
    return structure.length + structure.reduce((acc, el) => acc += this.countElements(el.children), 0);
  }

  getMaxDepth(structure: RecursiveElement[], initialDepth: number = 0): number {
    if (!structure.length) return initialDepth;
    return Math.max(...structure.map(element => this.getMaxDepth(element.children, initialDepth + 1)));
  }

  canBeAddedAsChild(
    sourceGroup: RecursiveElement[],
    targetGroup: RecursiveElement[],
    sourceIndex: number,
    targetIndex: number
  ): boolean {
    return !(targetGroup === sourceGroup && targetIndex === sourceIndex) &&
      !(targetGroup[targetIndex].children === sourceGroup && sourceIndex === sourceGroup.length - 1);
  }

  updatePositions(structure: RecursiveElement[], parent: number[] = []): void {
    structure.forEach((element, index) => {
      let position: number[] = parent.slice();
      position.push(index + 1);
      element.currentPosition = position;
      element.isRepositioned = !this.ut.areArraysEqual(element.initialPosition, position);
      this.updatePositions(element.children, position);
    })
  }

}
