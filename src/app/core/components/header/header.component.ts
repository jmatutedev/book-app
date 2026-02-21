import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { NetworkService } from '../../services/network/network.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton],
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  @Input({ required: true }) title!: string;
  @Input() showBackButton = false;

  isOnline = true;
  private networkSub!: Subscription;

  constructor(private network: NetworkService) {}

  async ngOnInit(): Promise<void> {
    await this.network.ready;
    this.isOnline = this.network.isOnline();
    this.networkSub = this.network.onlineStatus$.subscribe((isOnline) => {
      this.isOnline = isOnline;
    });
  }

  ngOnDestroy(): void {
    this.networkSub?.unsubscribe();
  }
}
