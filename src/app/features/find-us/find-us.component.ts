import { Component, computed, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NeonButtonComponent } from "../../shared/ui/neon-button/neon-button.component";

interface Comment {
  id: string;
  author: string;
  text: string;
  rating: number;
}

@Component({
  selector: 'feature-find-us',
  standalone: true,
  imports: [CommonModule, FormsModule, NeonButtonComponent],
  templateUrl: './find-us.component.html',
  styleUrl: './find-us.component.scss'
})
export class FindUsComponent implements OnInit {
  private readonly STORAGE_KEY = 'cyber_imbiss_logs';

  /**
   * Closes the admin mode when the Escape key is pressed.
   * Using 'window:keydown.escape' filters the event before it reaches the method.
   */
  @HostListener('window:keydown.escape')
  handleEscapeQuicksave(): void {
    if (this.adminMode()) {
      this.adminMode.set(false);
    }
  }

  adminMode = signal<boolean>(false);
  comments = signal<Comment[]>([]);
  currentRating = 0;
  userName = '';
  userComment = '';

  ngOnInit(): void {
    this.loadInitialData();
  }

  toggleAdmin(): void {
    this.adminMode.update(state => !state);
  }

  private loadInitialData(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const data = saved ? JSON.parse(saved) : this.getMockEntries();
    this.comments.set(data);
  }

  private getMockEntries(): Comment[] {
    return [
      { id: '842', author: 'CyberSam', text: 'Bester Döner in Riesa!', rating: 5 },
      { id: '109', author: 'NeonRider', text: 'Scharfe Sauce ist legendär.', rating: 3.5 }
    ];
  }

  setRating(event: MouseEvent, index: number): void {
  const star = event.currentTarget as HTMLElement;
  const width = star.offsetWidth;
  const x = event.offsetX;
  
  // Wenn links geklickt -> 0.5, wenn rechts -> 1.0
  const value = x < width / 2 ? 0.5 : 1;
  this.currentRating = index + value;
}

  /**
   * Präzisere Fill-Logik
   */
  getStarFill(index: number, rating: number): string {
    const diff = rating - index;
    if (diff >= 1) return '100%';
    if (diff <= 0) return '0%'; // Explizit alles unter oder gleich 0 abfangen
    return '50%'; // Nur der Fall 0.5 bleibt übrig
  }

  averageRating = computed(() => {
    const list = this.comments();
    if (list.length === 0) return '5.0'; // Fallback
    
    const sum = list.reduce((acc, c) => acc + c.rating, 0);
    const avg = sum / list.length;
    
    return avg.toFixed(1); // Formatiert auf eine Nachkommastelle
  });

  submitFeedback(): void {
    if (!this.isValid()) {
      alert("System-Error: Name, Rating und Kommentar fehlen.");
      return;
    }
    this.commitEntry();
    this.resetForm();
  }

  private isValid(): boolean {
    return this.currentRating > 0 &&
      !!this.userName.trim() &&
      !!this.userComment.trim();
  }

  private commitEntry(): void {
    const entry: Comment = {
      id: Date.now().toString().slice(-4),
      author: this.userName,
      text: this.userComment,
      rating: this.currentRating
    };
    this.comments.update(all => [entry, ...all]);
    this.saveToStorage();
  }

  deleteComment(id: string): void {
    if (!this.adminMode()) return;
    this.comments.update(all => all.filter(c => c.id !== id));
    this.saveToStorage();
  }

  private saveToStorage(): void {
    const data = JSON.stringify(this.comments());
    localStorage.setItem(this.STORAGE_KEY, data);
  }

  private resetForm(): void {
    this.userName = '';
    this.userComment = '';
    this.currentRating = 0;
  }
}