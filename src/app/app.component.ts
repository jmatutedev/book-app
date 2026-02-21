import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { OfflineBannerComponent } from './core/components/offline-banner/offline-banner.component';
import { NetworkToastComponent } from './core/components/network-toast/network-toast.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, NetworkToastComponent],
})
export class AppComponent {}
