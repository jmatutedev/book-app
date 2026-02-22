import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonContent,
  IonSpinner,
  IonButton,
  IonIcon,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookmarkOutline } from 'ionicons/icons';
import { BookSyncService } from '../../core/services/book-sync/book-sync.service';
import { NetworkService } from '../../core/services/network/network.service';
import { AddToListService } from '../../core/services/add-to-list/add-to-list.service';
import { Book } from '../../core/models/books/book.model';
import { EmptyStateComponent } from '../../core/components/empty-state/empty-state.component';
import { AppHeaderComponent } from '../../core/components/header/header.component';

const COVER_BASE = 'https://covers.openlibrary.org/b/id';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.page.html',
  styleUrls: ['./book-detail.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonSpinner,
    IonButton,
    IonIcon,
    IonSkeletonText,
    EmptyStateComponent,
    AppHeaderComponent,
  ],
})
export class BookDetailPage implements OnInit, OnDestroy {
  book: Book | null = null;
  loading: boolean = false;
  error: boolean = false;
  imageLoaded: boolean = false;
  imageError: boolean = false;
  fromList: boolean = false;

  private bookId!: string;
  private networkSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private bookSync: BookSyncService,
    private network: NetworkService,
    private addToList: AddToListService,
  ) {
    addIcons({ bookmarkOutline });
  }

  ngOnInit(): void {
    this.bookId = this.route.snapshot.paramMap.get('bookId')!;
    this.fromList = history.state?.fromList ?? false;
    this.loadDetail(this.bookId);

    this.networkSub = this.network.onlineStatus$.subscribe((isOnline) => {
      if (isOnline && this.error) this.loadDetail(this.bookId);
    });
  }

  ngOnDestroy(): void {
    this.networkSub?.unsubscribe();
  }

  async loadDetail(bookId: string): Promise<void> {
    this.loading = true;
    this.error = false;
    this.imageLoaded = false;
    this.imageError = false;
    try {
      this.book = await this.bookSync.getBookDetail(bookId);
      if (!this.book) this.error = true;
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  get coverUrl(): string | null {
    return this.book?.cover_id
      ? `${COVER_BASE}/${this.book.cover_id}-M.jpg`
      : null;
  }

  get authorsLabel(): string {
    return this.book?.authors?.join(', ') ?? 'Autor desconocido';
  }

  onImageLoad(): void {
    this.imageLoaded = true;
  }

  onImageError(): void {
    this.imageError = true;
    this.imageLoaded = true;
  }

  async addBookToList(): Promise<void> {
    if (!this.book) return;
    await this.addToList.addBookToList(this.book);
  }
}
