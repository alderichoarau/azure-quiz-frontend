export type ContentBlockType = 'TEXT' | 'IMAGE';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  /** Populated for TEXT blocks; null for IMAGE blocks (fetched separately via /api/images/{id}). */
  text: string | null;
}
