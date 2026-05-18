import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { NeonButtonComponent } from "../../../shared/ui/neon-button/neon-button.component";
import { OrderService } from '../../../shared/services/order.service';
import { ReviewService } from '../../../shared/services/review.service';

@Component({
  standalone: true,
  selector: 'feature-hero-three',
  templateUrl: './hero-three.component.html',
  styleUrls: ['./hero-three.component.scss'],
  imports: [NeonButtonComponent, NgOptimizedImage]
})
export class HeroThreeComponent {
  private router = inject(Router);
  public order = inject(OrderService);
  private reviewService = inject(ReviewService);

  readonly averageRating = this.reviewService.averageRating;

  /**
   * Navigiert zur Bestellseite und setzt den ersten Schritt.
   * Maximale Zeilenanzahl: 4 (Limit: 14)
   */
  goToOrder(): void {
    this.order.step.set(1);
    this.router.navigate(['/order']);
  }
}