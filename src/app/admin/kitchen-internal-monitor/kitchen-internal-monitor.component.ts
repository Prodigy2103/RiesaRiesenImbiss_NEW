import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';
import { AdminService } from '../../shared/services/admin.service';
import { Order, OrderStatus } from '../../shared/modals/order.model';
import { OrderService } from '../../shared/services/order.service';

type RawDateInput = Timestamp | Date | string | number | null | undefined;

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

  newOrders = computed(() => {
    return this.adminService.orders().filter(order => order.status === 'new');
  });

  preparingOrders = computed(() => {
    return this.adminService.orders().filter(order => order.status === 'preparing');
  });

  readyOrders = computed(() => {
    return this.adminService.orders().filter(order => order.status === 'ready' || order.status === 'delivery');
  });

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
      return;
    }
    const nextStatus = this.getNextStatus(order.status);
    if (nextStatus) {
      await this.adminService.updateStatus(order.id, nextStatus);
    }
  }

  private checkIfFinalStep(order: Order): boolean {
    const isPickupReady = order.deliveryType === 'pickup' && order.status === 'ready';
    const isDeliveryDone = order.status === 'delivery';
    return isPickupReady || isDeliveryDone;
  }

  private getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
    const transitions: Partial<Record<OrderStatus, OrderStatus>> = {
      'new': 'preparing',
      'preparing': 'ready',
      'ready': 'delivery'
    };
    return transitions[currentStatus] ?? null;
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

  getStatusLabel(status: OrderStatus, deliveryType?: string): string {
    if (status === 'ready' && deliveryType === 'pickup') return 'ABSCHLIESSEN';
    const labels: Record<string, string> = {
      'new': 'STARTEN',
      'preparing': 'FERTIG',
      'ready': 'LIEFERN',
      'delivery': 'ABSCHLIESSEN'
    };
    return labels[status] || 'OK';
  }

  getAsDate(rawTimestamp: RawDateInput): Date | null {
    if (!rawTimestamp) return null;
    const hasToDate = typeof (rawTimestamp as { toDate?: () => Date }).toDate === 'function';
    return hasToDate ? (rawTimestamp as Timestamp).toDate() : new Date(rawTimestamp as string | number | Date);
  }
}