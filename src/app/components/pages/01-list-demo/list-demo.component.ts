import { Component, signal } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { timer } from 'rxjs';
import { NONE, LIST_DEMO_LENGTH } from '../../../constants/config';
import { BLINK_DURATION, INSERTION_DURATION, SWAP_DURATION } from '../../../constants/durations';
import { DraggableElement } from '../../../types/elements';
import { CheckboxComponent } from '../../ui-elements/checkbox/checkbox.component';
import { DotsComponent } from '../../ui-elements/dots/dots.component';
import { UtilityService } from '../../../services/utility.service';
import { DataModelService } from '../../../services/data-model.service';

@Component({
  selector: 'app-list-demo',
  imports: [NgClass, NgTemplateOutlet, CheckboxComponent, DotsComponent],
  templateUrl: './list-demo.component.html',
  styleUrl: './list-demo.component.scss'
})
export class ListDemoComponent {

  isFadingIn = signal<boolean>(false);

  list: DraggableElement[] = [];

  isSwapAllowed: boolean = false;
  isActionInProgress: boolean = false;

  draggedIndex: number = NONE;
  targetAreaIndex: number = NONE;
  targetElementIndex: number = NONE;
  growIndex: number = NONE;
  shrinkIndex: number = NONE;
  swapSourceIndex: number = NONE;
  swapTargetIndex: number = NONE;

  readonly NONE = NONE;

  constructor(private ut: UtilityService, private dm: DataModelService) {
    this.resetList(true);
  }

  resetList(noBlink: boolean = false): void {
    this.list = this.dm.generateList(LIST_DEMO_LENGTH);
    if (noBlink) return;
    this.ut.blink(this.isFadingIn, BLINK_DURATION);
  }

  shuffleList(): void {
    this.ut.shuffleArray(this.list);
    this.ut.blink(this.isFadingIn, BLINK_DURATION);
  }

  toggleSwap(): void {
    this.isSwapAllowed = !this.isSwapAllowed;
  }

  onDragStart(index: number): void {
    this.draggedIndex = index;
  }

  onAreaDragOver(e: Event, area: number): void {
    if (this.draggedIndex === NONE || this.dm.isAreaNextToElement(this.draggedIndex, area)) return;
    e.preventDefault();
    this.targetAreaIndex = area;
  }

  onAreaDragLeave(): void {
    this.targetAreaIndex = NONE;
  }

  onElementDragOver(e: Event, index: number): void {
    if (!this.isSwapAllowed || this.draggedIndex === NONE || this.draggedIndex === index) return;
    e.preventDefault();
    this.targetElementIndex = index;
  }

  onElementDragLeave(): void {
    this.targetElementIndex = NONE;
  }

  onDragEnd(): void {
    this.draggedIndex = NONE;
  }

  onAreaDrop(): void {
    this.isActionInProgress = true;
    this.dm.insertDraggableElement(this.list, this.list[this.draggedIndex], this.targetAreaIndex);
    this.growIndex = this.targetAreaIndex;
    this.shrinkIndex = this.dm.adjustedSourceIndex(this.draggedIndex, this.targetAreaIndex);
    this.targetAreaIndex = NONE;
    timer(INSERTION_DURATION).subscribe(() => {
      this.ut.deleteElement(this.list, this.shrinkIndex);
      this.dm.restoreInsertedId(this.list, this.shrinkIndex, this.growIndex);
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
      this.ut.swapElements(this.list, this.list, this.swapSourceIndex, this.swapTargetIndex);
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
