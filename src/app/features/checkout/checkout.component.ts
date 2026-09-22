import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../shared/services/order.service';
import { AdminService } from '../../shared/services/admin.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  public order = inject(OrderService);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private orderSubscription?: Subscription;

  private readonly statusMap: Record<string, number> = {
    'new': 1,
    'preparing': 2,
    'ready': 3,
    'delivery': 3,
    'completed': 4,
    'done': 4
  };

  public currentStatus = signal<number>(1);

  public readonly estimatedTime = computed(() => {
    const currentSummary = this.order.summary();
    return currentSummary?.customer?.scheduledTime || this.calculateDefaultTime();
  });

  public readonly statusSteps = computed(() => [
    { id: 1, label: 'Eingegangen', icon: 'fas fa-file-invoice' },
    { id: 2, label: 'Wird zubereitet', icon: 'fas fa-utensils' },
    {
      id: 3,
      label: this.order.deliveryType() === 'delivery' ? 'Unterwegs' : 'Abholbereit',
      icon: this.order.deliveryType() === 'delivery' ? 'fas fa-moped' : 'fas fa-store'
    }
  ]);

  ngOnInit(): void {
    this.listenToOrderStatus();
  }

  private listenToOrderStatus(): void {
    const orderIdentifier = this.order.summary()?.id;
    if (!orderIdentifier) return;

    this.orderSubscription = this.adminService.getLiveOrder(orderIdentifier).subscribe({
      next: (updatedOrder) => this.handleOrderUpdate(updatedOrder),
      error: (subscriptionError) => console.error('Abofehler:', subscriptionError)
    });
  }

  private handleOrderUpdate(updatedOrder: { status?: string }): void {
    if (updatedOrder.status) {
      const nextStepIndex = this.statusMap[updatedOrder.status] || 1;
      this.currentStatus.set(nextStepIndex);
    }
  }

  private calculateDefaultTime(): string {
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 25);
    return currentTime.toTimeString().slice(0, 5);
  }

  ngOnDestroy(): void {
    this.orderSubscription?.unsubscribe();
  }

  public newOrder(): void {
    this.order.reset();
    this.router.navigate(['/order']);
  }
}