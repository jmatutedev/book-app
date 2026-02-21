import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { wifiOutline, cloudOfflineOutline } from 'ionicons/icons';
import { NetworkService } from '../../services/network/network.service';

@Component({
  selector: 'app-network-toast',
  template: '',
  standalone: true,
  imports: [],
})
export class NetworkToastComponent implements OnInit, OnDestroy {
  private networkSub!: Subscription;

  constructor(
    private network: NetworkService,
    private toastCtrl: ToastController,
  ) {
    addIcons({ wifiOutline, cloudOfflineOutline });
  }

  ngOnInit(): void {
    this.networkSub = this.network.onlineStatus$.subscribe((isOnline) => {
      this.showToast(isOnline);
    });
  }

  ngOnDestroy(): void {
    this.networkSub?.unsubscribe();
  }

  private async showToast(isOnline: boolean): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: isOnline ? 'Conexión restaurada' : 'Sin conexión a internet',
      duration: 3000,
      position: 'bottom',
      color: isOnline ? 'success' : 'warning',
      icon: isOnline ? 'wifi-outline' : 'cloud-offline-outline',
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel',
        },
      ],
    });
    await toast.present();
  }
}
