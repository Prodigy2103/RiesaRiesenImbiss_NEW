import { Component, HostListener, Input, input } from '@angular/core';

@Component({
  selector: 'app-neon-button',
  standalone: true,
  imports: [],
  templateUrl: './neon-button.component.html',
  styleUrl: './neon-button.component.scss'
})
export class NeonButtonComponent {
  variant = input<'primary' | 'secondary' | 'ghost' | 'link'>('primary');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (this.disabled() || this.loading()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
  }
}
