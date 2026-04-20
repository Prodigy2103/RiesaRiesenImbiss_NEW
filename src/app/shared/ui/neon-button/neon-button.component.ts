import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'app-neon-button',
  standalone: true,
  imports: [],
  templateUrl: './neon-button.component.html',
  styleUrl: './neon-button.component.scss'
})
export class NeonButtonComponent {
  variant = input<'primary' | 'secondary' | 'ghost'>('primary');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
}
