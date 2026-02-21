import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline } from 'ionicons/icons';
import { AppHeaderComponent } from '../../core/components/header/header.component';
import { CustomList } from '../../core/models/custom-list/custom-list.model';
import { StorageFacadeService } from '../../core/services/storage/storage-facade.service';
import { getMaxLists } from '../../core/utils/list-name-validation.util';

const MAX_LISTS = getMaxLists();

@Component({
  selector: 'app-custom-lists',
  templateUrl: './custom-lists.page.html',
  styleUrls: ['./custom-lists.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    AppHeaderComponent,
    IonFab,
    IonFabButton,
  ],
})
export class CustomListsPage implements OnInit {
  lists: CustomList[] = [];

  constructor(
    private storage: StorageFacadeService,
    private alertCtrl: AlertController,
    private router: Router,
    private toastCtrl: ToastController,
  ) {
    addIcons({ addOutline, createOutline, trashOutline });
  }

  ngOnInit(): void {
    this.loadLists();
  }

  ionViewWillEnter(): void {
    this.loadLists();
  }

  async loadLists(): Promise<void> {
    this.lists = await this.storage.getLists();
  }

  async createList(): Promise<void> {
    if (this.lists.length >= MAX_LISTS) {
      const alert = await this.alertCtrl.create({
        header: 'Limite alcanzado',
        message: `Solo puedes crear hasta ${MAX_LISTS} listas.`,
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Nueva lista',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de la lista',
          attributes: { maxlength: 50 },
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: async (data) => {
            try {
              await this.storage.createList({
                id: Date.now().toString(),
                name: data.name ?? '',
              });
              await this.loadLists();
              return true;
            } catch (error) {
              await this.showNameError((error as Error).message);
              return false;
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async editList(list: CustomList, event: Event): Promise<void> {
    event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Editar nombre de lista',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: list.name,
          attributes: { maxlength: 50 },
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            try {
              await this.storage.updateListName(list.id, data.name ?? '');
              await this.loadLists();
              return true;
            } catch (error) {
              await this.showNameError((error as Error).message);
              return false;
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteList(list: CustomList, event: Event): Promise<void> {
    event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Eliminar lista',
      message: `Estas seguro de que quieres eliminar "${list.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.storage.deleteList(list.id);
            await this.loadLists();
            await this.showDeletedToast(list.name);
          },
        },
      ],
    });
    await alert.present();
  }

  private async showDeletedToast(listName: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: `Se elimino "${listName}" de tus listas.`,
      duration: 2200,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }

  private async showNameError(message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Nombre inválido',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  goToDetail(list: CustomList): void {
    this.router.navigate(['/custom-lists', list.id], {
      state: { name: list.name },
    });
  }
}
