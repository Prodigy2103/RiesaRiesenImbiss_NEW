import { Injectable, signal, computed } from "@angular/core";
import { Job, News, Contact } from "../interfaces/footer.interface";

@Injectable({ providedIn: 'root' })
export class UiService {
    // --- MODAL STATES ---
    showJobModal = signal(false);
    selectedJob = signal<Job | null>(null);
    
    showNewsModal = signal(false);
    selectedNews = signal<News | null>(null);
    
    showContactModal = signal(false);
    selectedContact = signal<Contact | null>(null);
    
    // --- INGREDIENTS & SAUCES ---
    selectedIngredientInfo = signal<any[] | null>(null);
    // Expliziter Typ-Marker: 'sauce' | 'ingredient' | null
    activeIngredientType = signal<'sauce' | 'ingredient' | null>(null);

    showSuccessToast = signal(false);
    userName = signal('');
    userMail = signal('');
    userMessage = signal('');

    // --- REAKTIVE LOGIK ---
    
    /** Bestimmt den Text für den Header im Layout */
    isSauceMode = computed(() => this.activeIngredientType() === 'sauce');

    // --- METHODS ---

    openJob(j: Job) {
        this.closeAllModals();
        this.selectedJob.set(j);
        this.showJobModal.set(true);
    }

    openNews(n: News) {
        this.closeAllModals();
        this.selectedNews.set(n);
        this.showNewsModal.set(true);
    }

    /** * Öffnet das neue Info-Modal 
     * @param data Die Liste der Inhaltsstoffe/Saucen
     * @param type Übergibt explizit, was angezeigt wird
     */
    openIngredients(data: any[], type: 'sauce' | 'ingredient') {
        this.closeAllModals();
        this.selectedIngredientInfo.set(data);
        this.activeIngredientType.set(type);
    }

    closeIngredients() {
        this.selectedIngredientInfo.set(null);
        this.activeIngredientType.set(null);
    }

    private closeAllModals() {
        this.showJobModal.set(false);
        this.showNewsModal.set(false);
        this.showContactModal.set(false);
        this.selectedIngredientInfo.set(null);
        this.activeIngredientType.set(null);
    }

    // --- RESTLICHE METHODEN ---
    openContact(data: any) {
        this.closeAllModals();
        const contactData: Contact = {
            title: data?.title || 'Allgemeine Anfrage'
        };
        this.selectedContact.set(contactData);
        this.showContactModal.set(true);
    }

    sendMessage() {
        console.log('UPLINK_SUCCESS:', { from: this.userName(), mail: this.userMail() });
        this.showContactModal.set(false);
        this.showSuccessToast.set(true);
        setTimeout(() => this.showSuccessToast.set(false), 3000);
    }

    closeJob() { this.showJobModal.set(false); }
    closeNews() { this.showNewsModal.set(false); }
    closeContact() {
        this.showContactModal.set(false);
        this.userName.set('');
    }
}