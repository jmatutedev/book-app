import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular/standalone';
import { Book } from '../../models/books/book.model';
import { CustomList } from '../../models/custom-list/custom-list.model';
import { StorageFacadeService } from '../storage/storage-facade.service';
import { AddedToListModalComponent } from '../../components/list-modal/list-modal.component';

@Injectable({
  providedIn: 'root',
})
export class AddToListService {
  constructor(
    private storage: StorageFacadeService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private router: Router,
  ) {}

  async addBookToList(book: Book): Promise<void> {
    const lists = await this.storage.getLists();

    if (!lists.length) {
      await this.showNoListsAlert();
      return;
    }

    await this.showSelectListAlert(book, lists);
  }

  private async showNoListsAlert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Sin listas',
      message: 'Primero crea una lista desde la sección "Mis listas".',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Ir a Mis listas',
          handler: () => this.router.navigate(['/custom-lists']),
        },
      ],
    });
    await alert.present();
  }

  private async showSelectListAlert(book: Book, lists: CustomList[]): Promise<void> {
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
            if (!listId) return;
            await this.handleListSelected(book, listId, lists);
          },
        },
      ],
    });
    await alert.present();
  }

  private async handleListSelected(book: Book, listId: string, lists: CustomList[]): Promise<void> {
    const alreadyIn = await this.storage.isBookInList(listId, book.id);

    if (alreadyIn) {
      await this.showDuplicateAlert();
      return;
    }

    await this.storage.addBookToList(listId, book);

    const list = lists.find((l) => l.id === listId)!;
    await this.alertCtrl.dismiss();
    await this.showConfirmationModal(book, list);
  }

  private async showDuplicateAlert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Ya está en la lista',
      message: 'Este libro ya fue agregado a esa lista.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  private async showConfirmationModal(book: Book, list: CustomList): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AddedToListModalComponent,
      componentProps: {
        bookTitle: book.title,
        listName: list.name,
        listId: list.id,
      },
      breakpoints: [0, 0.35, 0.5, 0.75],
      initialBreakpoint: 0.5,
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.goToList) {
      this.router.navigate(['/custom-lists', list.id], {
        state: { name: list.name },
      });
    }
  }
}
