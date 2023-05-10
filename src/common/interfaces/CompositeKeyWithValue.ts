/**
 * Composite Key-Value pair
 * Used for scrolling data, which treats it as the cursor
 * Generally it uniquely identifies a record
 *
 * eg cursor = {
 *   createdDate: 1573706692662,
 *   uri: 'sETrt56hjers'
 * }
 */
export interface CompositeKeyWithValue {
  [key: string]: any;
}
