import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { OrderService } from '../services/order.service';
import { Order } from '../modals/order.model';
import { formatLocalDateIso } from '../utils/date.util';

type RawDateInput = Timestamp | Date | string | number | null | undefined;

@Component({
  selector: 'app-order-archive',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DatePipe],
  templateUrl: './order-archive.component.html',
  styleUrl: './order-archive.component.scss'
})
export class OrderArchiveComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  selectedDate = signal<string>(formatLocalDateIso(new Date()));
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadOrders();
  }

  async loadOrders(): Promise<void> {
    this.isLoading.set(true);
    try {
      const fetchedOrders = await this.orderService.getArchiveRange(this.selectedDate());
      this.orders.set(fetchedOrders);
    } finally {
      this.isLoading.set(false);
    }
  }

  getAsDate(rawTimestamp: RawDateInput): Date | null {
    if (!rawTimestamp) return null;
    const hasToDate = typeof (rawTimestamp as { toDate?: () => Date }).toDate === 'function';
    return hasToDate ? (rawTimestamp as Timestamp).toDate() : new Date(rawTimestamp as string | number | Date);
  }

  private getIsoDate(rawTimestamp: RawDateInput): string {
    return formatLocalDateIso(this.getAsDate(rawTimestamp));
  }

  ordersOfSelectedDay = computed(() => {
    return this.orders().filter(order => this.getIsoDate(order.createdAt) === this.selectedDate());
  });

  totalRevenue = computed(() => {
    return this.ordersOfSelectedDay().reduce((sum, order) => sum + order.finalTotal, 0);
  });

  taxAmount = computed(() => {
    return this.totalRevenue() - (this.totalRevenue() / 1.07);
  });

  revenueTrend = computed(() => {
    const currentRevenue = this.calculateTotal(this.currentWeekOrders());
    const previousRevenue = this.calculateTotal(this.previousWeekOrders());
    return previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  });

  private calculateTotal(orderList: Order[]): number {
    return orderList.reduce((sum, order) => sum + order.finalTotal, 0);
  }

  absTrend = computed(() => Math.abs(this.revenueTrend()));
  isPositiveTrend = computed(() => this.revenueTrend() >= 0);

  orderStats = computed(() => {
    const itemMap = new Map<string, number>();
    this.ordersOfSelectedDay().forEach(order => {
      order.items.forEach(orderItem => {
        itemMap.set(orderItem.name, (itemMap.get(orderItem.name) ?? 0) + (orderItem.quantity ?? 1));
      });
    });
    return Array.from(itemMap.entries()).sort((entryA, entryB) => entryB[1] - entryA[1]);
  });

  lastOrderOfSelectedDay = computed(() => {
    const dayOrders = this.ordersOfSelectedDay();
    return dayOrders.length > 0 ? dayOrders[dayOrders.length - 1] : null;
  });

  printReport(): void {
    window.print();
  }

  formatSignature(signature: string | undefined): string {
    if (!signature) return 'N/A';
    return signature.match(/.{1,30}/g)?.join('\n') ?? signature;
  }

  private baseDate = computed(() => new Date(this.selectedDate()));

  deadline = computed(() => {
    const deadlineDate = new Date(this.baseDate());
    deadlineDate.setHours(0, 0, 0, 0);
    deadlineDate.setDate(deadlineDate.getDate() - 1);
    return deadlineDate;
  });

  currentWeekOrders = computed(() => {
    return this.orders().filter(order => (this.getAsDate(order.createdAt) ?? 0) >= this.deadline());
  });

  previousWeekOrders = computed(() => {
    return this.orders().filter(order => (this.getAsDate(order.createdAt) ?? 9e15) < this.deadline());
  });

  dashboardData = computed(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const dayDate = new Date(this.baseDate());
      dayDate.setDate(dayDate.getDate() - index);
      const dayString = dayDate.toISOString().split('T')[0];
      const revenue = this.orders()
        .filter(order => this.getIsoDate(order.createdAt) === dayString)
        .reduce((sum, order) => sum + order.finalTotal, 0);
      return { day: dayString.slice(5), revenue };
    }).reverse();
  });

  averageRevenue = computed(() => {
    const orderCount = this.ordersOfSelectedDay().length;
    return orderCount > 0 ? this.totalRevenue() / orderCount : 0;
  });

  maxRevenue = computed(() => {
    const revenues = this.dashboardData().map(dataPoint => dataPoint.revenue);
    return Math.max(...revenues, 100);
  });
}