import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonFab,
  IonFabButton,
  IonText,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline } from 'ionicons/icons';
import { CustomList } from '../../core/models/custom-list/custom-list.model';
import { LocalListsService } from '../../core/services/web-list/web-lists.service';
import { AppHeaderComponent } from '../../core/components/header/header.component';

const MAX_LISTS = 3;

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
    IonText,
  ],
})
export class CustomListsPage implements OnInit {
  lists: CustomList[] = [];

  constructor(
    private localListsService: LocalListsService,
    private alertCtrl: AlertController,
    private router: Router,
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
    this.lists = await this.localListsService.getLists();
  }

  async createList(): Promise<void> {
    if (this.lists.length >= MAX_LISTS) {
      const alert = await this.alertCtrl.create({
        header: 'Límite alcanzado',
        message: `Solo podés crear hasta ${MAX_LISTS} listas.`,
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
            const name = data.name?.trim();
            if (!name) {
              this.showNameError();
              return false;
            }
            await this.localListsService.createList({
              id: Date.now().toString(),
              name,
            });
            await this.loadLists();
            return true;
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
            const name = data.name?.trim();
            if (!name) {
              this.showNameError();
              return false;
            }
            await this.localListsService.updateListName(list.id, name);
            await this.loadLists();
            return true;
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
      message: `¿Estás seguro de que querés eliminar "${list.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.localListsService.deleteList(list.id);
            await this.loadLists();
          },
        },
      ],
    });
    await alert.present();
  }

  private async showNameError(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Nombre inválido',
      message: 'El nombre no puede estar vacío.',
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
