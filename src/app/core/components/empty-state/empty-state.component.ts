import { Component, Input } from '@angular/core';
import { IonIcon, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cloudOfflineOutline,
  searchOutline,
  alertCircleOutline,
} from 'ionicons/icons';

export type EmptyStateType = 'offline' | 'no-results' | 'error' | 'no-data';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
  standalone: true,
  imports: [IonIcon, IonText],
})
export class EmptyStateComponent {
  @Input() type: EmptyStateType = 'no-results';
  @Input() message?: string;

  constructor() {
    addIcons({ cloudOfflineOutline, searchOutline, alertCircleOutline });
  }
}
