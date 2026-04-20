import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiService } from '../../../shared/services/ui.service';
import { NeonButtonComponent } from '../../../shared/ui/neon-button/neon-button.component';

interface JobDetail {
  title: string;
  urgent: boolean;
  description: string;
  tasks: string[];
}

interface SystemNews {
  title: string;
  description: string;
  urgent: boolean;
}

interface ContactForm {
  title: string;
  description: string;
  urgent: boolean;
}

@Component({
  selector: 'app-footer',
  imports: [CommonModule, FormsModule, NeonButtonComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  public ui = inject(UiService);
  readonly isMenuOpen = signal(false);

  news: SystemNews[] = [
    {
      title: 'Ausfall Lieferservice',
      description: 'Derzeit steht der Lieferservice nicht zur Verfügung. Wir arbeiten an einer Lösung. Sie können Ihre Bestellungen weiterhin vor Ort abholen.',
      urgent: true
    }
  ];

  jobs: JobDetail[] = [
    {
      title: 'Cyber-Cook',
      urgent: true,
      description: 'Verantwortlich für die Hochgeschwindigkeits-Burger-Produktion.',
      tasks: ['Zubereitung von Riesen-Burgern', 'Qualitätskontrolle der Saucen', 'Terminal-Pflege']
    },
    {
      title: 'Delivery Pilot',
      urgent: true,
      description: 'Schnellste Lieferung im Sektor Riesa.',
      tasks: ['Sichere Auslieferung', 'Kundeninteraktion', 'Fahrzeug-Check']
    }
  ];

  // Korrigiert: Nutze das Interface, das du oben definiert hast
  contact: ContactForm[] = [
    {
      title: 'Contact',
      urgent: true,
      description: 'Testweise'
    }
  ];

  selectedJob: JobDetail | null = null;
  showJobModal = false;
  selectedNews: SystemNews | null = null;
  showNewsModal = false;
  selectedContact: ContactForm | null = null;
  showContactFormModal = false;

  userName: string = '';
  userMail: string = '';
  userMessage: string = '';

  showSuccessToast = false;

  /**
   * Sets the selected job and triggers the modal visibility.
   * Used to show detailed job information to the user.
   * @param job The job object to be displayed.
   */
  openJobDetails(job: JobDetail) {
    this.selectedJob = job;
    this.showJobModal = true;
  }

  /**
   * Resets the job selection and hides the modal.
   * Ensures no stale data remains when the UI is closed.
   */
  closeJobModal() {
    this.showJobModal = false;
    this.selectedJob = null;
  }

  /**
   * Sets the selected news item and opens the news modal.
   * Allows users to read full system announcements.
   * @param news The specific news entry to focus on.
   */
  openNewsDetails(news: SystemNews) {
    this.selectedNews = news;
    this.showNewsModal = true;
  }

  /**
   * Closes the news modal and clears the current selection.
   * Cleans up the component state after the user finishes reading.
   */
  closeNewsModal() {
    this.showNewsModal = false;
    this.selectedNews = null;
  }

  openContactForm(data?: ContactForm) {
    this.userName = '';
    this.userMail = '';
    this.userMessage = '';
    this.selectedContact = data || this.contact[0];
    this.showJobModal = false;
    this.showContactFormModal = true;
  }

  closeContactForm() {
    this.showContactFormModal = false;
    this.selectedContact = null;
  }

  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
