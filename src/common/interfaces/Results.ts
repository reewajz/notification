import { CompositeKeyWithValue } from './CompositeKeyWithValue';

/**
 * Results collection for any type
 *
 * T: represents the result item type
 */
export interface Results<T> {
  items: Array<T>;

  paginationCursor?: CompositeKeyWithValue; // for pagination

  total?: number;
}
