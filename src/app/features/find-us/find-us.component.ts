import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NeonButtonComponent } from '../../shared/ui/neon-button/neon-button.component';
import { ReviewService } from '../../shared/services/review.service';
import { Comment } from '../../shared/modals/comment.model';

@Component({
  selector: 'feature-find-us',
  standalone: true,
  imports: [CommonModule, FormsModule, NeonButtonComponent],
  templateUrl: './find-us.component.html',
  styleUrl: './find-us.component.scss'
})
export class FindUsComponent {
  private readonly reviewService = inject(ReviewService);

  @HostListener('window:keydown.escape')
  handleEscapeQuicksave(): void {
    if (this.adminMode()) {
      this.adminMode.set(false);
    }
  }

  adminMode = signal<boolean>(false);
  readonly comments = this.reviewService.comments;
  readonly averageRating = this.reviewService.averageRating;
  currentRating = 0;
  userName = '';
  userComment = '';
  toastMessage = signal<string | null>(null);
  toastSeverity = signal<'error' | 'success'>('error');
  private toastTimerId: ReturnType<typeof setTimeout> | null = null;

  toggleAdmin(): void {
    this.adminMode.update(state => !state);
  }

  setRating(mouseEvent: MouseEvent, starIndex: number): void {
    const starElement = mouseEvent.currentTarget as HTMLElement;
    const elementWidth = starElement.offsetWidth;
    const horizontalClickOffset = mouseEvent.offsetX;
    const calculatedRatingValue = horizontalClickOffset < elementWidth / 2 ? 0.5 : 1;
    this.currentRating = starIndex + calculatedRatingValue;
  }

  getStarFill(starIndex: number, ratingValue: number): string {
    const ratingDifference = ratingValue - starIndex;
    if (ratingDifference >= 1) return '100%';
    if (ratingDifference <= 0) return '0%';
    return '50%';
  }

  submitFeedback(): void {
    if (!this.isFeedbackValid()) {
      this.displayToast('SYSTEM ERROR // Name, Rating und Kommentar erforderlich.', 'error');
      return;
    }
    this.commitEntry();
    this.resetForm();
    this.displayToast('LOG RECORDED // Feedback erfolgreich übermittelt.', 'success');
  }

  displayToast(messageText: string, severityLevel: 'error' | 'success'): void {
    if (this.toastTimerId) clearTimeout(this.toastTimerId);
    this.toastMessage.set(messageText);
    this.toastSeverity.set(severityLevel);
    this.toastTimerId = setTimeout(() => this.toastMessage.set(null), 4000);
  }

  dismissToast(): void {
    if (this.toastTimerId) clearTimeout(this.toastTimerId);
    this.toastMessage.set(null);
  }

  private isFeedbackValid(): boolean {
    return this.currentRating > 0 &&
      !!this.userName.trim() &&
      !!this.userComment.trim();
  }

  private commitEntry(): void {
    const newCommentEntry: Comment = {
      id: Date.now().toString().slice(-4),
      author: this.userName.trim(),
      text: this.userComment.trim(),
      rating: this.currentRating
    };
    this.reviewService.addComment(newCommentEntry);
  }

  deleteComment(targetCommentId: string): void {
    if (!this.adminMode()) return;
    this.reviewService.deleteComment(targetCommentId);
  }

  private resetForm(): void {
    this.userName = '';
    this.userComment = '';
    this.currentRating = 0;
  }
}