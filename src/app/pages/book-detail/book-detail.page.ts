import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookmarkOutline } from 'ionicons/icons';
import { BookSyncService } from '../../core/services/book-sync/book-sync.service';
import { NetworkService } from '../../core/services/network/network.service';
import { Book } from '../../core/models/books/book.model';
import { EmptyStateComponent } from '../../core/components/empty-state/empty-state.component';
import { LocalListsService } from '../../core/services/web-list/web-lists.service';
import { AddedToListModalComponent } from '../../core/components/list-modal/list-modal.component';
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
  loading = false;
  error = false;
  imageLoaded = false;
  imageError = false;

  // Oculta el botón si venimos desde list-detail
  fromList = false;

  private bookId!: string;
  private networkSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookSync: BookSyncService,
    private localListsService: LocalListsService,
    private network: NetworkService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
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

  async addToList(): Promise<void> {
    if (!this.book) return;

    const lists = await this.localListsService.getLists();

    if (!lists.length) {
      const alert = await this.alertCtrl.create({
        header: 'Sin listas',
        message: 'Primero creá una lista desde la sección "Mis listas".',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Ir a Mis listas',
            handler: () => this.router.navigate(['/custom-lists']),
          },
        ],
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

            const alreadyIn = await this.localListsService.isBookInList(
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

            await this.localListsService.addBookToList(listId, this.book);

            const list = lists.find((l) => l.id === listId)!;

            this.alertCtrl.dismiss();

            // Modal de confirmación en vez de toast
            const modal = await this.modalCtrl.create({
              component: AddedToListModalComponent,
              componentProps: {
                bookTitle: this.book.title,
                listName: list.name,
                listId: list.id,
              },
              breakpoints: [0, 0.35],
              initialBreakpoint: 0.35,
            });
            await modal.present();

            const { data } = await modal.onWillDismiss();
            if (data?.goToList) {
              this.router.navigate(['/custom-lists', list.id], {
                state: { name: list.name },
              });
            }
          },
        },
      ],
    });
    await alert.present();
  }
}
