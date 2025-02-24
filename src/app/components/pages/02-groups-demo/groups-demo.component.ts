import { Component, signal } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { timer } from 'rxjs';
import { NONE, GROUPS_DEMO_CONFIG } from '../../../constants/config';
import { BLINK_DURATION, INSERTION_DURATION, SWAP_DURATION } from '../../../constants/durations';
import { DraggableElement, ElementGroup } from '../../../types/elements';
import { CheckboxComponent } from '../../ui-elements/checkbox/checkbox.component';
import { DotsComponent } from '../../ui-elements/dots/dots.component';
import { UtilityService } from '../../../services/utility.service';
import { DataModelService } from '../../../services/data-model.service';

@Component({
  selector: 'app-groups-demo',
  imports: [NgClass, NgTemplateOutlet, CheckboxComponent, DotsComponent],
  templateUrl: './groups-demo.component.html',
  styleUrl: './groups-demo.component.scss'
})
export class GroupsDemoComponent {

  isFadingIn = signal<boolean>(false);

  groups: ElementGroup[] = [];
  isSwapAllowed: boolean = false;
  isActionInProgress: boolean = false;
  
  sourceGroup: number = NONE;
  targetGroup: number = NONE;
  draggedIndex: number = NONE;
  targetAreaIndex: number = NONE;
  targetElementIndex: number = NONE;
  growIndex: number = NONE;
  shrinkIndex: number = NONE;
  swapSourceIndex: number = NONE;
  swapTargetIndex: number = NONE;

  readonly NONE = NONE;

  constructor(private ut: UtilityService, private dm: DataModelService) {
    this.resetGroups(true);
  }
  
  resetGroups(noBlink: boolean = false): void {
    this.groups = this.dm.generateGroups(GROUPS_DEMO_CONFIG);
    if (noBlink) return;
    this.ut.blink(this.isFadingIn, BLINK_DURATION);
  }

  shuffleGroups(): void {
    if (!this.groups.length) return;
    const elements: DraggableElement[] = this.groups.map(group => group.list).flat();
    this.ut.shuffleArray(elements);
    this.groups.forEach(group => group.list = []);
    elements.forEach(element => this.ut.randomElement(this.groups)!.list.push(element));
    this.ut.blink(this.isFadingIn, BLINK_DURATION);
  }

  toggleSwap(): void {
    this.isSwapAllowed = !this.isSwapAllowed;
  }

  onDragStart(group: number, element: number): void {
    this.sourceGroup = group;
    this.draggedIndex = element;
  }

  onAreaDragOver(e: Event, group: number, area: number): void {
    if (
      this.draggedIndex === NONE ||
      (group === this.sourceGroup && this.dm.isAreaNextToElement(this.draggedIndex, area))
    ) return;
    e.preventDefault();
    this.targetGroup = group;
    this.targetAreaIndex = area;
  }

  onAreaDragLeave(): void {
    this.targetGroup = NONE;
    this.targetAreaIndex = NONE;
  }

  onElementDragOver(e: Event, group: number, index: number): void {
    if (
      !this.isSwapAllowed ||
      this.draggedIndex === NONE ||
      (group === this.sourceGroup && index === this.draggedIndex)
    ) return;
    e.preventDefault();
    this.targetGroup = group;
    this.targetElementIndex = index;
  }

  onElementDragLeave(): void {
    this.targetGroup = NONE;
    this.targetElementIndex = NONE;
  }

  onDragEnd(): void {
    if (this.isActionInProgress) return;
    this.sourceGroup = NONE;
    this.draggedIndex = NONE;
  }

  onAreaDrop(): void {
    this.isActionInProgress = true;
    const sourceList: DraggableElement[] = this.groups[this.sourceGroup].list;
    const targetList: DraggableElement[] = this.groups[this.targetGroup].list;
    this.targetGroup === this.sourceGroup
      ? this.dm.insertDraggableElement(targetList, sourceList[this.draggedIndex], this.targetAreaIndex)
      : this.ut.insertElement(targetList, sourceList[this.draggedIndex], this.targetAreaIndex);
    this.growIndex = this.targetAreaIndex;
    this.shrinkIndex = this.targetGroup === this.sourceGroup
      ? this.dm.adjustedSourceIndex(this.draggedIndex, this.targetAreaIndex)
      : this.draggedIndex;
    this.targetAreaIndex = NONE;
    this.draggedIndex = NONE;
    timer(INSERTION_DURATION).subscribe(() => {
      this.ut.deleteElement(sourceList, this.shrinkIndex);
      if (this.targetGroup === this.sourceGroup)
        this.dm.restoreInsertedId(targetList, this.shrinkIndex, this.growIndex);
      this.sourceGroup = NONE;
      this.targetGroup = NONE;
      this.growIndex = NONE;
      this.shrinkIndex = NONE;
      this.isActionInProgress = false;
    });
  }

  onElementDrop(): void {
    if (!this.isSwapAllowed) return;
    this.isActionInProgress = true;
    this.swapSourceIndex = this.draggedIndex;
    this.swapTargetIndex = this.targetElementIndex;
    timer(SWAP_DURATION / 2).subscribe(() => {
      this.ut.swapElements(
        this.groups[this.sourceGroup].list,
        this.groups[this.targetGroup].list,
        this.swapSourceIndex,
        this.swapTargetIndex
      );
      this.draggedIndex = NONE;
      this.targetElementIndex = NONE;
    });
    timer(SWAP_DURATION).subscribe(() => {
      this.swapSourceIndex = NONE;
      this.swapTargetIndex = NONE;
      this.isActionInProgress = false;
    });
  }

}
