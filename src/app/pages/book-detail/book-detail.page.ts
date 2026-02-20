import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonSpinner,
  IonButton,
  IonIcon,
  IonSkeletonText,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookmarkOutline } from 'ionicons/icons';
import { BookSyncService } from '../../core/services/book-sync/book-sync.service';
import { CustomListsDbService } from '../../core/services/database/custom-list-db.service';
import { Book } from '../../core/models/books/book.model';
import { EmptyStateComponent } from '../../core/components/empty-state/empty-state.component';
const COVER_BASE = 'https://covers.openlibrary.org/b/id';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.page.html',
  styleUrls: ['./book-detail.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonBackButton,
    IonButtons,
    IonSpinner,
    IonButton,
    IonIcon,
    IonSkeletonText,
    EmptyStateComponent,
  ],
})
export class BookDetailPage implements OnInit {
  book: Book | null = null;
  loading = false;
  error = false;

  imageLoaded = false;
  imageError = false;

  constructor(
    private route: ActivatedRoute,
    private bookSync: BookSyncService,
    private listsDb: CustomListsDbService,
    private alertCtrl: AlertController,
  ) {
    addIcons({ bookmarkOutline });
  }

  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('bookId')!;
    this.loadDetail(bookId);
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

  async addToList(): Promise<void> {
    if (!this.book) return;

    const lists = await this.listsDb.getLists();

    if (!lists.length) {
      const alert = await this.alertCtrl.create({
        header: 'Sin listas',
        message: 'Primero crea una lista desde la sección "Mis listas".',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Agregar a lista',
      inputs: lists.map((list) => ({
        type: 'radio' as const,
        label: list.name,
        value: list.id,
      })),
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Agregar',
          handler: async (listId: string) => {
            if (!listId || !this.book) return;
            const alreadyIn = await this.listsDb.isBookInList(
              listId,
              this.book.id,
            );
            if (alreadyIn) {
              const info = await this.alertCtrl.create({
                header: 'Ya está en la lista',
                message: 'Este libro ya fue agregado a esa lista.',
                buttons: ['OK'],
              });
              await info.present();
              return;
            }
            await this.listsDb.addBookToList(listId, this.book);
          },
        },
      ],
    });

    await alert.present();
  }
}
