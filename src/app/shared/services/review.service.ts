import { Injectable, signal, computed } from '@angular/core';

interface Comment {
	id: string;
	author: string;
	text: string;
	rating: number;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
	private readonly STORAGE_KEY = 'cyber_imbiss_logs';
	comments = signal<Comment[]>([]);

	averageRating = computed(() => {
		const list = this.comments();
		if (list.length === 0) return '5.0';
		const sum = list.reduce((acc, c) => acc + c.rating, 0);
		return (sum / list.length).toFixed(1);
	});

	constructor() {
		this.loadInitialData();
	}

	private loadInitialData(): void {
		const saved = localStorage.getItem(this.STORAGE_KEY);
		if (saved) {
			this.comments.set(JSON.parse(saved));
		}
	}

	addComment(entry: Comment): void {
		this.comments.update(all => [entry, ...all]);
		this.save();
	}

	deleteComment(id: string): void {
		this.comments.update(all => all.filter(c => c.id !== id));
		this.save();
	}

	private save(): void {
		localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.comments()));
	}
}