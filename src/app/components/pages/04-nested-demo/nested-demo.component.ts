import { Component, signal } from '@angular/core';
import { NgClass, NgStyle, NgTemplateOutlet } from '@angular/common';
import { timer } from 'rxjs';
import { NONE, NESTED_DEMO_CONFIG } from '../../../constants/config';
import { BLINK_DURATION, NESTED_INSERTION_DURATION } from '../../../constants/durations';
import { RecursiveElement } from '../../../types/elements';
import { UtilityService } from '../../../services/utility.service';
import { DataModelService } from '../../../services/data-model.service';

@Component({
  selector: 'app-nested-demo',
  imports: [NgClass, NgStyle, NgTemplateOutlet],
  templateUrl: './nested-demo.component.html',
  styleUrl: './nested-demo.component.scss'
})
export class NestedDemoComponent {

  isFadingIn = signal<boolean>(false);

  structure: RecursiveElement[] = [];
  structureBackup: RecursiveElement[] = [];
  structureDepth: number = 0;

  isAllowedElement: boolean = false;
  isActionInProgress: boolean = false;

  sourceGroup: RecursiveElement[] | null = null;
  targetGroup: RecursiveElement[] | null = null;
  draggedIndex: number = NONE;
  targetAreaIndex: number = NONE;
  targetElementIndex: number = NONE;
  growIndex: number = NONE;
  shrinkIndex: number = NONE;

  readonly NONE = NONE;

  constructor(private ut: UtilityService, private dm: DataModelService) {
    this.generateStructure(true);
  }

  generateStructure(noBlink: boolean = false): void {
    this.structure = this.dm.generateNestedStructure(NESTED_DEMO_CONFIG);
    this.structureBackup = this.ut.deepCopy(this.structure);
    this.structureDepth = this.dm.getMaxDepth(this.structure);
    if (noBlink) return;
    this.ut.blink(this.isFadingIn, BLINK_DURATION);
  }

  resetStructure(): void {
    this.structure = this.ut.deepCopy(this.structureBackup);
    this.structureDepth = this.dm.getMaxDepth(this.structure);
    this.ut.blink(this.isFadingIn, BLINK_DURATION);
  }

  onMouseDown(e: MouseEvent): void {
    e.stopPropagation();
    this.isAllowedElement = this.ut.isTargetInside(e, 'grab-allowed');
  }

  onDragStart(e: Event, group: RecursiveElement[], index: number): void {
    e.stopPropagation();
    if (!this.isAllowedElement) {
      e.preventDefault();
      return;
    }
    this.sourceGroup = group;
    this.draggedIndex = index;
  }

  onAreaDragOver(e: Event, group: RecursiveElement[], area: number): void {
    if (
      this.draggedIndex === NONE ||
      (group === this.sourceGroup && this.dm.isAreaNextToElement(this.draggedIndex, area))
    ) return;
    e.preventDefault();
    this.targetGroup = group;
    this.targetAreaIndex = area;
  }

  onAreaDragLeave(): void {
    this.targetGroup = null;
    this.targetAreaIndex = NONE;
  }

  onElementDragOver(e: Event, group: RecursiveElement[], index: number): void {
    if (
      this.sourceGroup === null || this.draggedIndex === NONE ||
      !this.dm.canBeAddedAsChild(this.sourceGroup, group, this.draggedIndex, index)
    ) return;
    e.preventDefault();
    this.targetGroup = group;
    this.targetElementIndex = index;
  }

  onElementDragLeave(): void {
    this.targetGroup = null;
    this.targetElementIndex = NONE;
  }

  onDragEnd(): void {
    if (this.isActionInProgress) return;
    this.sourceGroup = null;
    this.draggedIndex = NONE;
  }

  onAreaDrop(): void {
    if (!this.sourceGroup || !this.targetGroup) return;
    this.isActionInProgress = true;
    this.targetGroup === this.sourceGroup
      ? this.dm.insertDraggableElement(this.targetGroup, this.sourceGroup[this.draggedIndex], this.targetAreaIndex)
      : this.ut.insertElement(this.targetGroup, this.sourceGroup[this.draggedIndex], this.targetAreaIndex);
    this.growIndex = this.targetAreaIndex;
    this.shrinkIndex = this.targetGroup === this.sourceGroup
      ? this.dm.adjustedSourceIndex(this.draggedIndex, this.targetAreaIndex)
      : this.draggedIndex;
    this.targetAreaIndex = NONE;
    this.draggedIndex = NONE;
    this.structureDepth = this.dm.getMaxDepth(this.structure);
    timer(NESTED_INSERTION_DURATION).subscribe(() => {
      if (!this.sourceGroup || !this.targetGroup) return;
      this.ut.deleteElement(this.sourceGroup, this.shrinkIndex);
      if (this.targetGroup === this.sourceGroup)
        this.dm.restoreInsertedId(this.targetGroup, this.shrinkIndex, this.growIndex);
      this.sourceGroup = null;
      this.targetGroup = null;
      this.growIndex = NONE;
      this.shrinkIndex = NONE;
      this.structureDepth = this.dm.getMaxDepth(this.structure);
      this.dm.updatePositions(this.structure);
      this.isActionInProgress = false;
    });
  }

  onElementDrop(): void {
    if (!this.sourceGroup || !this.targetGroup) return;
    this.isActionInProgress = true;
    this.targetGroup = this.targetGroup[this.targetElementIndex].children;
    this.targetGroup === this.sourceGroup
      ? this.dm.insertDraggableElement(this.targetGroup, this.sourceGroup[this.draggedIndex], this.targetGroup.length)
      : this.ut.insertElement(this.targetGroup, this.sourceGroup[this.draggedIndex], this.targetGroup.length);
    this.growIndex = this.targetGroup.length - 1;
    this.shrinkIndex = this.draggedIndex;
    this.targetElementIndex = NONE;
    this.draggedIndex = NONE;
    this.structureDepth = this.dm.getMaxDepth(this.structure);
    timer(NESTED_INSERTION_DURATION).subscribe(() => {
      if (!this.sourceGroup || !this.targetGroup) return;
      this.ut.deleteElement(this.sourceGroup, this.shrinkIndex);
      if (this.targetGroup === this.sourceGroup)
        this.dm.restoreInsertedId(this.targetGroup, this.shrinkIndex, this.growIndex);
      this.sourceGroup = null;
      this.targetGroup = null;
      this.growIndex = NONE;
      this.shrinkIndex = NONE;
      this.structureDepth = this.dm.getMaxDepth(this.structure);
      this.dm.updatePositions(this.structure);
      this.isActionInProgress = false;
    });
  }

}
