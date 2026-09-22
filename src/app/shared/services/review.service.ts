import { Injectable, signal, computed } from '@angular/core';
import { Comment } from '../modals/comment.model';
import { safeJsonParse } from '../utils/storage.util';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly STORAGE_KEY = 'cyber_imbiss_logs';
  comments = signal<Comment[]>([]);

  averageRating = computed(() => {
    const commentList = this.comments();
    if (commentList.length === 0) return '5.0';
    const totalRatingSum = commentList.reduce((sum, comment) => sum + comment.rating, 0);
    return (totalRatingSum / commentList.length).toFixed(1);
  });

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const savedCommentsJson = localStorage.getItem(this.STORAGE_KEY);
    const initialComments = safeJsonParse<Comment[]>(savedCommentsJson, this.getDefaultComments());
    this.comments.set(initialComments);
  }

  private getDefaultComments(): Comment[] {
    return [
      { id: '842', author: 'CyberSam', text: 'Bester Döner in Riesa!', rating: 5 },
      { id: '109', author: 'NeonRider', text: 'Scharfe Sauce ist legendär.', rating: 3.5 }
    ];
  }

  addComment(entry: Comment): void {
    this.comments.update(existingComments => [entry, ...existingComments]);
    this.save();
  }

  deleteComment(targetCommentId: string): void {
    this.comments.update(existingComments => existingComments.filter(comment => comment.id !== targetCommentId));
    this.save();
  }

  private save(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.comments()));
  }
}