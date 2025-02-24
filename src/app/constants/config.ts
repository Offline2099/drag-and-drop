import { RecursiveStructureConfig } from '../types/recursive-structure-config.interface';

/** 
 * Placeholder for the selected element number if none is selected.
 * Allows to avoid extra type casting compared to setting it to null.
 */
export const NONE: number = -2;

/** The default length for the list of elements in the simple demo. */
export const LIST_DEMO_LENGTH: number = 10;

/**
 * The default configuration for the groups demo. The length of the array
 * defines the number of groups. Each number in the array represents the
 * number of elements in the respective group.
 */
export const GROUPS_DEMO_CONFIG: number[] = [5, 4, 6];

/** The number of rows in the table demo. */
export const TABLE_DEMO_ROWS: number = 5;

/** The number of columns in the table demo. */
export const TABLE_DEMO_COLUMNS: number = 6;

/** The default configuration for the nested list demo. */
export const NESTED_DEMO_CONFIG: RecursiveStructureConfig = {
  minChildren: 1,
  maxChildren: 3,
  maxInitialDepth: 2,
  topLevelLegnth: 2,
  maxElementsTotal: 15
}
