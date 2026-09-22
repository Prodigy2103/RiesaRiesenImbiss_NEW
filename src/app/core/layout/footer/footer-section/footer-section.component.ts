import { Component, inject, input, output } from '@angular/core';
import { UiService } from '../../../../shared/services/ui.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterItem } from '../../../../shared/interfaces/footer.interface';

@Component({
  selector: 'app-footer-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './footer-section.component.html',
  styleUrl: './footer-section.component.scss'
})
export class FooterSectionComponent {
  public ui = inject(UiService);

  title = input.required<string>();
  items = input.required<FooterItem[]>();
  displayKey = input<string>('title');
  select = output<FooterItem>();

  getItemLabel(item: FooterItem): string {
    const propertyKey = this.displayKey();
    const itemRecord = item as unknown as Record<string, unknown>;
    const propertyValue = itemRecord[propertyKey];
    return typeof propertyValue === 'string' ? propertyValue : '';
  }
}
