import { Component, Input } from '@angular/core';
import {
  IonContent,
  IonButton,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-added-to-list-modal',
  templateUrl: './list-modal.component.html',
  styleUrls: ['./list-modal.component.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon],
})
export class AddedToListModalComponent {
  @Input() bookTitle!: string;
  @Input() listName!: string;
  @Input() listId!: string;

  constructor(private modalCtrl: ModalController) {
    addIcons({ checkmarkCircleOutline });
  }

  dismiss(): void {
    this.modalCtrl.dismiss({ goToList: false });
  }

  goToList(): void {
    this.modalCtrl.dismiss({ goToList: true });
  }
}
