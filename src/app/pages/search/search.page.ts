import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner,
} from '@ionic/angular/standalone';
import { BookSyncService } from '../../core/services/book-sync/book-sync.service';
import { NetworkService } from '../../core/services/network/network.service';
import { Book } from '../../core/models/books/book.model';
import { BookCardComponent } from '../../core/components/book-card/book-card.component';
import {
  EmptyStateComponent,
  EmptyStateType,
} from '../../core/components/empty-state/empty-state.component';
import { AppHeaderComponent } from '../../core/components/header/header.component';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSpinner,
    BookCardComponent,
    EmptyStateComponent,
    AppHeaderComponent,
  ],
})
export class SearchPage {
  query = '';
  books: Book[] = [];
  page = 1;

  loading = false;
  emptyState: EmptyStateType | null = null;

  constructor(
    private router: Router,
    private bookSync: BookSyncService,
    private network: NetworkService,
  ) {}

  onSearch(event: any): void {
    const value = event.detail.value?.trim() ?? '';
    if (!value || value === this.query) return;

    this.query = value;
    this.books = [];
    this.page = 1;
    this.emptyState = null;
    this.search();
  }

  onClear(): void {
    this.query = '';
    this.books = [];
    this.page = 1;
    this.emptyState = null;
  }

  async search(): Promise<void> {
    if (!this.query) return;

    if (!this.network.isOnline()) {
      this.emptyState = 'offline';
      return;
    }

    this.loading = true;
    this.emptyState = null;

    try {
      const result = await this.bookSync.searchBooks(this.query, this.page);
      if (!result.length) {
        this.emptyState = 'no-results';
      } else {
        this.books = result;
      }
    } catch {
      this.emptyState = 'error';
    } finally {
      this.loading = false;
    }
  }

  async loadMore(event: any): Promise<void> {
    this.page++;
    try {
      const result = await this.bookSync.searchBooks(this.query, this.page);
      this.books = [...this.books, ...result];
      if (result.length < PAGE_SIZE) {
        event.target.disabled = true;
      }
    } catch {
      this.page--;
    } finally {
      event.target.complete();
    }
  }

  goToDetail(book: Book): void {
    (document.activeElement as HTMLElement)?.blur();
    this.router.navigate(['/book-detail', book.id.replace('/works/', '')]);
  }
}
