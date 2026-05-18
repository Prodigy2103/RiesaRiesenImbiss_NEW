import { Component, inject, input, output } from '@angular/core';
import { UiService } from '../../../../shared/services/ui.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer-section',
  standalone: true, // Sicherstellen, dass standalone aktiv ist
  imports: [CommonModule, FormsModule],
  templateUrl: './footer-section.component.html',
  styleUrl: './footer-section.component.scss'
})
export class FooterSectionComponent {
  public ui = inject(UiService);

  // Diese 3 Zeilen haben gefehlt:
  title = input.required<string>();
  items = input.required<any[]>();
  displayKey = input<string>('title'); // Default ist 'title'
  
  select = output<any>();
}
