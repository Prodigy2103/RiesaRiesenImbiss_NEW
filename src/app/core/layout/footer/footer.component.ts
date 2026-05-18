import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiService } from '../../../shared/services/ui.service';
import { DataService } from '../../../shared/services/data.services';
import { SAUCE_INFO_LIST } from '../../../shared/modals/extras.data';
import { Job, News } from '../../../shared/interfaces/footer.interface';
import { FooterSectionComponent } from './footer-section/footer-section.component';
import { FooterModalsComponent } from "../footer-modals/footer-modals.component";
import { NeonButtonComponent } from '../../../shared/ui/neon-button/neon-button.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterSectionComponent, FooterModalsComponent, NeonButtonComponent,],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  public ui = inject(UiService);
  private dataService = inject(DataService);

  readonly isMenuOpen = signal(false);

  readonly infoCategories = computed(() => [
    {
      id: 'ingredients',
      label: 'Inhaltsstoffe',
      data: Object.values(this.dataService.ingredientDetailsMap())
    },
    {
      id: 'sauces',
      label: 'Unsere Saucen',
      data: SAUCE_INFO_LIST
    }
  ]);

  news: News[] = [
    {
      title: 'Ausfall Lieferservice',
      description: 'Derzeit steht der Lieferservice nicht zur Verfügung.',
      urgent: true
    }
  ];

  jobs: Job[] = [
    {
      title: 'Cyber-Cook',
      description: 'Derzeit kein Jobangebot.',
      phone: '+4917640106841'
    },
    {
      title: 'Delivery Pilot',
      description: 'Mission Control ruft: Wir brauchen Verstärkung auf der Straße! Bring den besten Döner der Stadt ans Ziel. Klick unten auf den Button und melde dich bei uns.'
    }
  ];

  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  // In der footer.component.ts
openCategoryInfo(category: { id: string, data: any[] }): void {
    const type = category.id === 'sauces' ? 'sauce' : 'ingredient';
    this.ui.openIngredients(category.data, type);
}

  handleNewsClick(n: News): void {
    this.ui.openNews(n);
    // this.closeMenu();
  }

  handleJobClick(j: Job): void {
    this.ui.openJob(j);
    // this.closeMenu();
  }
}