import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  get currentStatus(): 'open' | 'closing-soon' | 'closed' {
    const now = new Date(), day = now.getDay();
    const time = now.getHours() + now.getMinutes() / 60;
    const [open, close] = day === 0 ? [13, 20] : [11, 21.5];

    if (time < open || time >= close) return 'closed';
    return (close - time <= 0.51) ? 'closing-soon' : 'open';
  }

  get statusText(): string {
    const labels = { open: 'Geöffnet', 'closing-soon': 'Schließt bald', closed: 'Geschlossen' };
    return labels[this.currentStatus];
  }
}
