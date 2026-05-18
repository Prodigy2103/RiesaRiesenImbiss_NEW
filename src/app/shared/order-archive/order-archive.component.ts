import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../services/order.service';
import { Order } from '../modals/order.model';

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
  selectedDate = signal<string>(new Date().toISOString().split('T')[0]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadOrders();
  }

  async loadOrders(): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await this.orderService.getArchiveRange(this.selectedDate());
      this.orders.set(data);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Hilfsmethode zur Datumskonvertierung (Clean Code: < 14 Zeilen)
  getAsDate(ts: any): Date | null {
    if (!ts) return null;
    return typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  }

  // Extrahiert das ISO-Datum (YYYY-MM-DD) aus einem Timestamp
  private getIsoDate(ts: any): string {
    return this.getAsDate(ts)?.toISOString().split('T')[0] ?? '';
  }

  ordersOfSelectedDay = computed(() => {
    return this.orders().filter(o => this.getIsoDate(o.createdAt) === this.selectedDate());
  });

  totalRevenue = computed(() => 
    this.ordersOfSelectedDay().reduce((sum, o) => sum + o.finalTotal, 0)
  );

  taxAmount = computed(() => 
    this.totalRevenue() - (this.totalRevenue() / 1.07)
  );

  revenueTrend = computed(() => {
    const cur = this.calculateTotal(this.currentWeekOrders());
    const prev = this.calculateTotal(this.previousWeekOrders());
    return prev > 0 ? ((cur - prev) / prev) * 100 : 0;
  });

  private calculateTotal(orders: Order[]): number {
    return orders.reduce((sum, o) => sum + o.finalTotal, 0);
  }

  absTrend = computed(() => Math.abs(this.revenueTrend()));
  isPositiveTrend = computed(() => this.revenueTrend() >= 0);

  orderStats = computed(() => {
    const itemMap = new Map<string, number>();
    this.ordersOfSelectedDay().forEach(o => o.items.forEach(i => {
      itemMap.set(i.name, (itemMap.get(i.name) ?? 0) + (i.quantity ?? 1));
    }));
    return Array.from(itemMap.entries()).sort((a, b) => b[1] - a[1]);
  });

  // Dummy helper für den TSE-Block (ehemals fehlerhaft)
  lastOrderOfSelectedDay = computed(() => {
    const dayOrders = this.ordersOfSelectedDay();
    return dayOrders.length > 0 ? dayOrders[dayOrders.length - 1] : null;
  });

  printReport(): void { window.print(); }

  formatSignature(sig: string | undefined): string {
    if (!sig) return 'N/A';
    return sig.match(/.{1,30}/g)?.join('\n') ?? sig;
  }

  // Hilfssignals für Dashboard-Logik
  private baseDate = computed(() => new Date(this.selectedDate()));
  
  deadline = computed(() => {
    const d = new Date(this.baseDate());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  });

  currentWeekOrders = computed(() => 
    this.orders().filter(o => (this.getAsDate(o.createdAt) ?? 0) >= this.deadline())
  );

  previousWeekOrders = computed(() => 
    this.orders().filter(o => (this.getAsDate(o.createdAt) ?? 9e15) < this.deadline())
  );

  dashboardData = computed(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.baseDate());
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const revenue = this.orders()
        .filter(o => this.getIsoDate(o.createdAt) === dayStr)
        .reduce((sum, o) => sum + o.finalTotal, 0);
      return { day: dayStr.slice(5), revenue };
    }).reverse();
  });

  averageRevenue = computed(() => {
    const count = this.ordersOfSelectedDay().length;
    return count > 0 ? this.totalRevenue() / count : 0;
  });

  maxRevenue = computed(() => {
    const revenues = this.dashboardData().map(d => d.revenue);
    return Math.max(...revenues, 100);
  });
}