import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { Book } from '../../../core/models/books/book.model';
import { LocalListsService } from '../../../core/services/web-list/web-lists.service';
import { AppHeaderComponent } from '../../../core/components/header/header.component';

@Component({
  selector: 'app-list-detail',
  templateUrl: './list-detail.page.html',
  styleUrls: ['./list-detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonList, IonItem, IonLabel, IonIcon, AppHeaderComponent],
})
export class ListDetailPage implements OnInit {
  listId!: string;
  listName!: string;
  books: Book[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localListsService: LocalListsService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {
    addIcons({ trashOutline });
  }

  ngOnInit(): void {
    this.listId = this.route.snapshot.paramMap.get('listId')!;
    this.listName = history.state?.name ?? 'Lista';
    this.loadBooks();
  }

  async loadBooks(): Promise<void> {
    this.books = await this.localListsService.getBooksInList(this.listId);
  }

  async removeBook(book: Book, event: Event): Promise<void> {
    event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Eliminar libro',
      message: `Quieres quitar "${book.title}" de esta lista?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.localListsService.removeBookFromList(
              this.listId,
              book.id,
            );
            await this.loadBooks();
            await this.showRemovedBookToast(book.title);
          },
        },
      ],
    });
    await alert.present();
  }

  private async showRemovedBookToast(bookTitle: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: `Se elimino "${bookTitle}" de la lista.`,
      duration: 2200,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }

  goToDetail(book: Book): void {
    this.router.navigate(['/book-detail', book.id.replace('/works/', '')], {
      state: { fromList: true },
    });
  }
}
