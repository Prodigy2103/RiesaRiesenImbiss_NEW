import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../shared/services/admin.service';
import { Order, OrderStatus } from '../../shared/modals/order.model';
import { OrderService } from '../../shared/services/order.service';

@Component({
  selector: 'app-kitchen-internal-monitor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kitchen-internal-monitor.component.html',
  styleUrl: './kitchen-internal-monitor.component.scss'
})
export class KitchenInternalMonitorComponent implements OnInit, OnDestroy {
  public adminService = inject(AdminService);
  private readonly orderService = inject(OrderService);

  isMonitorActive = signal(false);
  selectedOrder = signal<Order | null>(null);

  // Computed Signals für saubere Performance im Template
  newOrders = computed(() => this.adminService.orders().filter(o => o.status === 'new'));
  preparingOrders = computed(() => this.adminService.orders().filter(o => o.status === 'preparing'));
  readyOrders = computed(() => this.adminService.orders().filter(o => o.status === 'ready' || o.status === 'delivery'));

  ngOnInit(): void {
    this.adminService.startListening();
  }

  ngOnDestroy(): void {
    this.adminService.stopListening();
  }

  async handleStatusClick(order: Order): Promise<void> {
    const isFinalStep = this.checkIfFinalStep(order);

    if (isFinalStep) {
      await this.orderService.archiveOrder(order);
    } else {
      const next = this.getNextStatus(order.status);
      if (next) await this.adminService.updateStatus(order.id, next);
    }
  }

  private checkIfFinalStep(order: Order): boolean {
    const isPickupReady = order.deliveryType === 'pickup' && order.status === 'ready';
    const isDeliveryDone = order.status === 'delivery';
    return isPickupReady || isDeliveryDone;
  }

  private getNextStatus(current: OrderStatus): OrderStatus | null {
    const transitions: Partial<Record<OrderStatus, OrderStatus>> = {
      'new': 'preparing',
      'preparing': 'ready',
      'ready': 'delivery'
    };
    return transitions[current] ?? null;
  }

  printOrder(order: Order): void {
    this.selectedOrder.set(order);
    setTimeout(() => {
      window.print();
      this.selectedOrder.set(null);
    }, 350);
  }

  startMonitor(): void {
    this.isMonitorActive.set(true);
  }

  getStatusLabel(status: OrderStatus, type?: string): string {
    if (status === 'ready' && type === 'pickup') return 'ABSCHLIESSEN';
    const labels: Record<string, string> = {
      'new': 'STARTEN', 'preparing': 'FERTIG', 
      'ready': 'LIEFERN', 'delivery': 'ABSCHLIESSEN'
    };
    return labels[status] || 'OK';
  }

  getAsDate(ts: any): Date | null {
    if (!ts) return null;
    return typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  }
}