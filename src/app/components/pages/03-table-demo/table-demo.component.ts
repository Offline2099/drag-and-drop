import { Component, signal } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { timer } from 'rxjs';
import { NONE, TABLE_DEMO_ROWS, TABLE_DEMO_COLUMNS } from '../../../constants/config';
import { BLINK_DURATION, INSERTION_DURATION, SWAP_DURATION } from '../../../constants/durations';
import { DraggableElement } from '../../../types/elements';
import { Cell } from '../../../types/cell.interface';
import { CheckboxComponent } from '../../ui-elements/checkbox/checkbox.component';
import { UtilityService } from '../../../services/utility.service';
import { DataModelService } from '../../../services/data-model.service';

@Component({
  selector: 'app-table-demo',
  imports: [NgClass, NgTemplateOutlet, CheckboxComponent],
  templateUrl: './table-demo.component.html',
  styleUrl: './table-demo.component.scss'
})
export class TableDemoComponent {

  isFadingIn = signal<boolean>(false);

  tableByRows: DraggableElement[][] = [];
  tableByColumns: DraggableElement[][] = [];

  isInsertionAllowed: boolean = true;
  isActionInProgress: boolean = false;

  draggedCell: Cell | null = null;
  targetCell: Cell | null = null;
  swapSource: Cell | null = null;
  swapTarget: Cell | null = null;

  targetAreaIndex: number = NONE;
  isTargetAreaVertical: boolean | null = null;
  growIndex: number = NONE;
  shrinkIndex: number = NONE;

  constructor(private ut: UtilityService, private dm: DataModelService) {
    this.resetTable();
  }

  resetTable(noBlink: boolean = false): void {
    this.tableByRows = this.dm.generateTable(TABLE_DEMO_ROWS, TABLE_DEMO_COLUMNS);
    this.syncTableByColumns();
    if (noBlink) return;
    this.ut.blink(this.isFadingIn, BLINK_DURATION);
  }

  shuffleTable(): void {
    const elements: DraggableElement[] = this.tableByRows.flat();
    this.ut.shuffleArray(elements);
    this.tableByRows = this.tableByRows.map((_, index) => 
      elements.slice(index * TABLE_DEMO_COLUMNS, (index + 1) * TABLE_DEMO_COLUMNS)
    );
    this.syncTableByColumns();
    this.ut.blink(this.isFadingIn, BLINK_DURATION);
  }

  syncTableByColumns(): void {
    this.tableByColumns = this.ut.rowsToColumns(this.tableByRows);
  }

  syncTableByRows(): void {
    this.tableByRows = this.ut.columnsToRows(this.tableByColumns);
  }

  toggleInsertion(): void {
    this.isInsertionAllowed = !this.isInsertionAllowed;
  }

  onDragStart(row: number, column: number): void {
    this.draggedCell = { row, column }
  }

  onAreaDragOver(e: Event, isVertical: boolean, row: number, column: number): void {
    if (
      !this.isInsertionAllowed ||
      !this.draggedCell ||
      !this.dm.canCellBeInserted(this.draggedCell, isVertical, row, column)
    ) return;
    e.preventDefault();
    this.targetAreaIndex = isVertical ? column : row;
    this.isTargetAreaVertical = isVertical;
  }

  onAreaDragLeave(): void {
    this.targetAreaIndex = NONE;
    this.isTargetAreaVertical = null;
  }

  onElementDragOver(e: Event, row: number, column: number): void {
    if (!this.draggedCell || this.dm.areSameCells(this.draggedCell, { row, column })) return;
    e.preventDefault();
    this.targetCell = { row, column }
  }

  onElementDragLeave(): void {
    this.targetCell = null;
  }

  onDragEnd(): void {
    if (!this.isActionInProgress) this.draggedCell = null;
  }

  onAreaDrop(): void {
    if (!this.isInsertionAllowed || !this.draggedCell) return;
    this.isActionInProgress = true;
    let list: DraggableElement[] = this.isTargetAreaVertical
      ? this.tableByRows[this.draggedCell.row]
      : this.tableByColumns[this.draggedCell.column];
    let sourceIndex: number = this.isTargetAreaVertical
      ? this.draggedCell.column
      : this.draggedCell.row;
    this.dm.insertDraggableElement(list, list[sourceIndex], this.targetAreaIndex);
    this.growIndex = this.targetAreaIndex;
    this.shrinkIndex = this.dm.adjustedSourceIndex(sourceIndex, this.targetAreaIndex);
    this.targetAreaIndex = NONE;
    timer(INSERTION_DURATION).subscribe(() => {
      this.ut.deleteElement(list, this.shrinkIndex);
      this.dm.restoreInsertedId(list, this.shrinkIndex, this.growIndex);
      this.growIndex = NONE;
      this.shrinkIndex = NONE;
      this.isTargetAreaVertical ? this.syncTableByColumns() : this.syncTableByRows();
      this.isTargetAreaVertical = null;
      this.draggedCell = null;
      this.isActionInProgress = false;
    });
  }

  onElementDrop(): void {
    if (
      !this.draggedCell || !this.targetCell ||
      this.dm.areSameCells(this.draggedCell, this.targetCell)
    ) return;
    this.isActionInProgress = true;
    this.swapSource = this.ut.deepCopy(this.draggedCell);
    this.swapTarget = this.ut.deepCopy(this.targetCell);
    timer(SWAP_DURATION / 2).subscribe(() => {
      this.ut.swapElements(
        this.tableByRows[this.swapSource!.row], 
        this.tableByRows[this.swapTarget!.row],
        this.swapSource!.column,
        this.swapTarget!.column
      );
      this.draggedCell = null
      this.targetCell = null;
      this.syncTableByColumns();
    });
    timer(SWAP_DURATION).subscribe(() => {
      this.swapSource = null;
      this.swapTarget = null;
      this.isActionInProgress = false;
    });
  }

}
