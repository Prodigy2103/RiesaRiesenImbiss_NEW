import { Injectable, signal } from "@angular/core";
import { Job, News, Contact } from "../interfaces/footer.interface";

@Injectable({ providedIn: 'root' })
export class UiService {
	showJobModal = signal(false);
	selectedJob = signal<Job | null>(null);
	showNewsModal = signal(false);
	selectedNews = signal<News | null>(null);
	showContactModal = signal(false);
	selectedContact = signal<Contact | null>(null);
	showSuccessToast = signal(false);

	userName = signal('');
	userMail = signal('');
	userMessage = signal('');

	openJob(j: Job) {
		this.selectedJob.set(j);
		this.showJobModal.set(true);
	}

	openNews(n: News) {
		this.selectedNews.set(n);
		this.showNewsModal.set(true);
	}

	openContact(data: Job | News | Contact | null) {
		if (!data) return;
		const contactData: Contact = {
			title: 'title' in data ? data.title : 'Allgemeine Anfrage'
		};

		this.showJobModal.set(false);
		this.showNewsModal.set(false);
		this.selectedContact.set(contactData);
		this.showContactModal.set(true);
	}

	sendMessage() {
		const payload = { from: this.userName(), mail: this.userMail(), text: this.userMessage() };
		console.log('UPLINK_SUCCESS:', payload);
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