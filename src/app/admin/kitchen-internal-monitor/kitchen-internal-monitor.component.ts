import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
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
  adminService = inject(AdminService);
  isMonitorActive = signal(false);
  selectedOrder = signal<Order | null>(null);
  private readonly orderService = inject(OrderService);

  ngOnInit(): void {
    this.adminService.startListening();
  }

  ngOnDestroy(): void {
    this.adminService.stopListening();
  }

  async nextStep(orderId: string, currentStatus: OrderStatus): Promise<void> {
    const workflow: Partial<Record<OrderStatus, OrderStatus>> = {
      'new': 'preparing',
      'preparing': 'ready',
      'ready': 'delivery',
      'delivery': 'completed'
    };

    const next = workflow[currentStatus];

    if (next === 'completed') {
      const orderToArchive = this.adminService.orders().find(o => o.id === orderId);
      if (orderToArchive) {
        await this.orderService.archiveOrder(orderToArchive);
      }
    } else if (next) {
      await this.adminService.updateStatus(orderId, next);
    }
  }

  async handleStatusClick(order: Order): Promise<void> {
    this.nextStep(order.id, order.status);
  }

  printOrder(order: Order): void {
    this.selectedOrder.set(order);
    setTimeout(() => {
      window.print();
      this.selectedOrder.set(null);
    }, 300);
  }

  getStatusLabel(status: OrderStatus): string {
    const labels: Record<string, string> = {
      'new': 'STARTEN', 'preparing': 'FERTIG', 'ready': 'LIEFERN', 'delivery': 'ABSCHLIESSEN'
    };
    return labels[status] || 'OK';
  }

  startMonitor(): void {
    this.isMonitorActive.set(true);
  }
  getAsDate(ts: any): Date | null {
    if (!ts) return null;
    return typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  }

  calculateNet(total: number | undefined): number {
    return (total ?? 0) / 1.07;
  }

  calculateTax(total: number | undefined): number {
    const totalVal = total ?? 0;
    return totalVal - this.calculateNet(totalVal);
  }

  formatSignature(sig: string | undefined): string {
    if (!sig) return 'N/A';
    return sig.match(/.{1,30}/g)?.join('\n') ?? sig;
  }

  generateTempInvoiceNumber(orderId: string): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `RE-${datePart}-${orderId.slice(-4).toUpperCase()}`;
  }

  getItemTotal(price: number | undefined, qty: number | undefined): number {
    const safePrice = price ?? 0;
    const safeQty = qty ?? 1;
    return safePrice * safeQty;
  }
}