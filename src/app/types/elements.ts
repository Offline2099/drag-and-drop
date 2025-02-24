export interface BaseElement {
  id: string;
}

export interface DraggableElement extends BaseElement {
  number: number;
}

export interface ElementGroup {
  id: string;
  list: DraggableElement[];
}

export interface RecursiveElement extends BaseElement {
  initialPosition: number[];
  currentPosition: number[];
  isRepositioned: boolean;
  children: RecursiveElement[];
}
