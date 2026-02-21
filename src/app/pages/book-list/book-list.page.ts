import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonContent,
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
import { toWorkSlug } from '../../core/utils/open-library-id.util';
const PAGE_SIZE = 20;

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.page.html',
  styleUrls: ['./book-list.page.scss'],
  standalone: true,
  imports: [
    IonContent,
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
export class BookListPage implements OnInit, OnDestroy {
  genreId!: string;
  genreLabel!: string;

  books: Book[] = [];
  page: number = 1;

  loading = false;
  emptyState: EmptyStateType | null = null;

  private networkSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookSync: BookSyncService,
    private network: NetworkService,
  ) {}

  ngOnInit(): void {
    this.genreId = this.route.snapshot.paramMap.get('genreId')!;
    this.genreLabel = history.state?.label ?? 'Libros';
    this.loadBooks();

    this.networkSub = this.network.onlineStatus$.subscribe((isOnline) => {
      if (
        isOnline &&
        (this.emptyState === 'offline' || this.emptyState === 'no-data')
      ) {
        this.page = 1;
        this.books = [];
        this.loadBooks();
      }
    });
  }

  ngOnDestroy(): void {
    this.networkSub?.unsubscribe();
  }

  async loadBooks(): Promise<void> {
    this.loading = true;
    this.emptyState = null;

    try {
      const result = await this.bookSync.getBooksByGenre(
        this.genreId,
        this.page,
      );

      if (!result.length) {
        // Sin conexión y sin datos locales
        this.emptyState = this.network.isOnline() ? 'no-results' : 'no-data';
      } else {
        this.books = result;
      }
    } catch {
      // Distinguimos si es falta de red o error real de API
      this.emptyState = this.network.isOnline() ? 'error' : 'offline';
    } finally {
      this.loading = false;
    }
  }

  async loadMore(event: any): Promise<void> {
    this.page++;
    try {
      const result = await this.bookSync.getBooksByGenre(
        this.genreId,
        this.page,
      );
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
    this.router.navigate(['/book-detail', toWorkSlug(book.id)]);
  }
}
