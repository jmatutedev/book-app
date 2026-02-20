import { Component, Input } from '@angular/core';
import { IonCard, IonSkeletonText } from '@ionic/angular/standalone';
import { Book } from '../../models/books/book.model';

const COVER_BASE = 'https://covers.openlibrary.org/b/id';

@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss'],
  standalone: true,
  imports: [IonCard, IonSkeletonText],
})
export class BookCardComponent {
  @Input({ required: true }) book!: Book;

  imageLoaded = false;
  imageError = false;

  get coverUrl(): string | null {
    return this.book.cover_id
      ? `${COVER_BASE}/${this.book.cover_id}-M.jpg`
      : null;
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
