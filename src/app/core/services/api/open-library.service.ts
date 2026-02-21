import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Book } from '../../models/books/book.model';
import { toWorkKey } from '../../utils/open-library-id.util';

const BASE_URL = 'https://openlibrary.org';
const PAGE_SIZE = 20;

interface SubjectWorkAuthor {
  name: string;
}

interface SubjectWork {
  key: string;
  title: string;
  authors?: SubjectWorkAuthor[];
  cover_id?: number;
  first_publish_year?: number;
}

interface SearchDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
}

interface WorkAuthorRef {
  key?: string;
  author?: { key?: string };
}

interface WorkDetailResponse {
  key?: string;
  title: string;
  covers?: number[];
  authors?: WorkAuthorRef[];
  first_publish_year?: number;
  first_publish_date?: string;
  description?: string | { value?: string };
}

interface AuthorResponse {
  name?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OpenLibraryService {
  constructor(private http: HttpClient) {}

  async fetchBooksByGenre(genreId: string, page: number): Promise<Book[]> {
    const offset = (page - 1) * PAGE_SIZE;
    const url = `${BASE_URL}/subjects/${genreId}.json?limit=${PAGE_SIZE}&offset=${offset}`;

    const res = await firstValueFrom(this.http.get<{ works: SubjectWork[] }>(url));
    return (res.works ?? []).map((work) => this.mapToBook(work));
  }

  async searchBooks(query: string, page: number): Promise<Book[]> {
    const url = `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&page=${page}&limit=${PAGE_SIZE}`;

    const res = await firstValueFrom(this.http.get<{ docs: SearchDoc[] }>(url));
    return (res.docs ?? []).map((doc) => this.mapSearchDocToBook(doc));
  }

  async fetchBookDetail(bookId: string): Promise<Book> {
    const path = toWorkKey(bookId);
    const url = `${BASE_URL}${path}.json`;
    const res = await firstValueFrom(this.http.get<WorkDetailResponse>(url));
    const authors = await this.resolveAuthors(res.authors);

    return {
      id: toWorkKey(res.key ?? bookId),
      title: res.title,
      authors,
      cover_id: res.covers?.[0],
      first_publish_year: this.resolveFirstPublishYear(res),
      description:
        typeof res.description === 'string'
          ? res.description
          : res.description?.value,
    };
  }

  private mapToBook(work: SubjectWork): Book {
    return {
      id: toWorkKey(work.key),
      title: work.title,
      authors: work.authors?.map((author) => author.name) ?? [],
      cover_id: work.cover_id,
      first_publish_year: work.first_publish_year,
    };
  }

  private mapSearchDocToBook(doc: SearchDoc): Book {
    return {
      id: toWorkKey(doc.key),
      title: doc.title,
      authors: doc.author_name ?? [],
      cover_id: doc.cover_i,
      first_publish_year: doc.first_publish_year,
    };
  }

  private async resolveAuthors(
    authorRefs: WorkAuthorRef[] | undefined,
  ): Promise<string[]> {
    const refs = authorRefs ?? [];
    if (!refs.length) return [];

    const authorKeys = refs
      .map((entry) => entry?.author?.key ?? entry?.key)
      .filter((key): key is string => typeof key === 'string' && !!key.trim());
    if (!authorKeys.length) return [];

    const names = await Promise.all(
      authorKeys.map(async (authorKey) => {
        try {
          const author = await firstValueFrom(
            this.http.get<AuthorResponse>(`${BASE_URL}${authorKey}.json`),
          );
          return author?.name ?? null;
        } catch {
          return null;
        }
      }),
    );

    return names.filter((name): name is string => !!name);
  }

  private resolveFirstPublishYear(res: WorkDetailResponse): number | undefined {
    if (typeof res.first_publish_year === 'number') {
      return res.first_publish_year;
    }

    if (typeof res.first_publish_date === 'string') {
      const match = res.first_publish_date.match(/\b(\d{4})\b/);
      if (match) return Number(match[1]);
    }

    return undefined;
  }
}
