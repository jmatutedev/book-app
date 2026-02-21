import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { IonCard, IonSkeletonText } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { Book } from '../../models/books/book.model';
import { NetworkService } from '../../services/network/network.service';

const COVER_BASE = 'https://covers.openlibrary.org/b/id';

@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss'],
  standalone: true,
  imports: [IonCard, IonSkeletonText],
})
export class BookCardComponent implements OnInit, OnDestroy {
  @Input({ required: true }) book!: Book;

  imageLoaded: boolean = false;
  imageError: boolean = false;
  cacheBuster: string = '';

  private networkSub!: Subscription;

  constructor(private network: NetworkService) {}

  ngOnInit(): void {
    this.networkSub = this.network.onlineStatus$.subscribe((isOnline) => {
      if (isOnline && this.imageError) {
        // Forzamos al browser a reintentar la imagen con un timestamp
        this.imageError = false;
        this.imageLoaded = false;
        this.cacheBuster = `?t=${Date.now()}`;
      }
    });
  }

  ngOnDestroy(): void {
    this.networkSub?.unsubscribe();
  }

  get coverUrl(): string | null {
    if (!this.book.cover_id) return null;
    return `${COVER_BASE}/${this.book.cover_id}-M.jpg${this.cacheBuster}`;
  }

  get authorsLabel(): string {
    return this.book.authors?.join(', ') ?? 'Autor desconocido';
  }

  onImageLoad(): void {
    this.imageLoaded = true;
  }

  onImageError(): void {
    this.imageError = true;
    this.imageLoaded = true;
  }
}
