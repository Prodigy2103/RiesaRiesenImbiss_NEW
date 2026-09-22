import { Injectable, signal, computed } from '@angular/core';
import { Job, News, Contact } from '../interfaces/footer.interface';
import { IngredientDetail } from '../modals/order.model';

@Injectable({ providedIn: 'root' })
export class UiService {
  showJobModal = signal(false);
  selectedJob = signal<Job | null>(null);

  showNewsModal = signal(false);
  selectedNews = signal<News | null>(null);

  showContactModal = signal(false);
  selectedContact = signal<Contact | null>(null);

  selectedIngredientInfo = signal<IngredientDetail[] | null>(null);
  activeIngredientType = signal<'sauce' | 'ingredient' | null>(null);

  showSuccessToast = signal(false);
  userName = signal('');
  userMail = signal('');
  userMessage = signal('');

  isSauceMode = computed(() => this.activeIngredientType() === 'sauce');

  openJob(job: Job): void {
    this.closeAllModals();
    this.selectedJob.set(job);
    this.showJobModal.set(true);
  }

  openNews(news: News): void {
    this.closeAllModals();
    this.selectedNews.set(news);
    this.showNewsModal.set(true);
  }

  openIngredients(ingredientItems: IngredientDetail[], targetType: 'sauce' | 'ingredient'): void {
    this.closeAllModals();
    this.selectedIngredientInfo.set(ingredientItems);
    this.activeIngredientType.set(targetType);
  }

  closeIngredients(): void {
    this.selectedIngredientInfo.set(null);
    this.activeIngredientType.set(null);
  }

  private closeAllModals(): void {
    this.showJobModal.set(false);
    this.showNewsModal.set(false);
    this.showContactModal.set(false);
    this.selectedIngredientInfo.set(null);
    this.activeIngredientType.set(null);
  }

  openContact(contactPayload?: Contact | { title?: string } | null): void {
    this.closeAllModals();
    const contactData: Contact = {
      title: contactPayload?.title || 'Allgemeine Anfrage'
    };
    this.selectedContact.set(contactData);
    this.showContactModal.set(true);
  }

  sendMessage(): void {
    this.showContactModal.set(false);
    this.showSuccessToast.set(true);
    setTimeout(() => this.showSuccessToast.set(false), 3000);
  }

  closeJob(): void {
    this.showJobModal.set(false);
  }

  closeNews(): void {
    this.showNewsModal.set(false);
  }

  closeContact(): void {
    this.showContactModal.set(false);
    this.userName.set('');
  }
}