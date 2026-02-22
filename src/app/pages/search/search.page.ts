import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonContent,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner,
  ToastController,
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
import { toWorkSlug } from '../../core/utils/open-library-id.util';

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
export class SearchPage implements OnInit, OnDestroy {
  query: string = '';
  books: Book[] = [];
  page: number = 1;
  infiniteScrollDisabled: boolean = false;

  loading: boolean = false;
  emptyState: EmptyStateType | null = null;
  private networkSub!: Subscription;

  constructor(
    private router: Router,
    private bookSync: BookSyncService,
    private network: NetworkService,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit(): void {
    this.networkSub = this.network.onlineStatus$.subscribe((isOnline) => {
      if (!isOnline) return;

      if (this.emptyState === 'offline') {
        this.emptyState = null;
      }

      if (this.query && !this.books.length) {
        this.page = 1;
        this.infiniteScrollDisabled = false;
        this.search();
        return;
      }

      this.infiniteScrollDisabled = false;
    });
  }

  ngOnDestroy(): void {
    this.networkSub?.unsubscribe();
  }

  onSearch(event: any): void {
    const value = event.detail.value?.trim() ?? '';
    if (!value) return;

    const sameQuery = value === this.query;
    if (sameQuery && this.emptyState !== 'offline' && this.emptyState !== 'error') {
      return;
    }

    this.query = value;
    this.books = [];
    this.page = 1;
    this.emptyState = null;
    this.infiniteScrollDisabled = false;
    this.search();
  }

  onClear(): void {
    this.query = '';
    this.books = [];
    this.page = 1;
    this.emptyState = null;
    this.infiniteScrollDisabled = false;
  }

  async search(): Promise<void> {
    if (!this.query) return;

    if (!this.network.isOnline()) {
      this.emptyState = 'offline';
      this.infiniteScrollDisabled = true;
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
        this.infiniteScrollDisabled = result.length < PAGE_SIZE;
      }
    } catch {
      this.emptyState = 'error';
    } finally {
      this.loading = false;
    }
  }

  async loadMore(event: any): Promise<void> {
    if (!this.network.isOnline()) {
      this.infiniteScrollDisabled = true;
      event.target.disabled = true;
      event.target.complete();
      return;
    }

    this.page++;
    try {
      const result = await this.bookSync.searchBooks(this.query, this.page);
      this.books = [...this.books, ...result];
      if (result.length < PAGE_SIZE) {
        this.infiniteScrollDisabled = true;
        event.target.disabled = true;
      }
    } catch {
      this.page--;
      await this.showLoadMoreError();
    } finally {
      event.target.complete();
    }
  }

  private async showLoadMoreError(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: 'No se pudieron cargar mas resultados.',
      duration: 2200,
      position: 'bottom',
      color: 'warning',
    });
    await toast.present();
  }

  goToDetail(book: Book): void {
    (document.activeElement as HTMLElement)?.blur();
    this.router.navigate(['/book-detail', toWorkSlug(book.id)]);
  }
}
