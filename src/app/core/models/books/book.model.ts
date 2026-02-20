export interface Book {
  id: string;
  title: string;
  authors?: string[];
  cover_id?: number;
  first_publish_year?: number;
  description?: string;
}
