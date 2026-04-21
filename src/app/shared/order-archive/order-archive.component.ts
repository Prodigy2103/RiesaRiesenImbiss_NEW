import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../services/order.service';
import { Order } from '../modals/order.model';

@Component({
  selector: 'app-order-archive',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  getAsDate(ts: any): Date | null {
    if (!ts) return null;
    return typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  }

  private baseDate = computed(() => {
    const [y, m, d] = this.selectedDate().split('-').map(Number);
    return new Date(y, m - 1, d);
  });

  ordersOfSelectedDay = computed(() => {
    const sel = this.selectedDate();
    return this.orders().filter(o =>
      this.getAsDate(o.createdAt)?.toISOString().split('T')[0] === sel
    );
  });

  deadline = computed(() => {
    const d = new Date(this.baseDate());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 7);
    return d;
  });

  currentWeekOrders = computed(() => {
    const limit = this.deadline();
    return this.orders().filter(o => (this.getAsDate(o.createdAt) ?? 0) >= limit);
  });

  previousWeekOrders = computed(() => {
    const limit = this.deadline();
    return this.orders().filter(o => (this.getAsDate(o.createdAt) ?? 9e15) < limit);
  });

  totalRevenue = computed(() =>
    this.ordersOfSelectedDay().reduce((sum, o) => sum + o.finalTotal, 0)
  );

  revenueTrend = computed(() => {
    const cur = this.currentWeekOrders().reduce((s, o) => s + o.finalTotal, 0);
    const prev = this.previousWeekOrders().reduce((s, o) => s + o.finalTotal, 0);
    return prev > 0 ? ((cur - prev) / prev) * 100 : 0;
  });

  absTrend = computed(() => Math.abs(this.revenueTrend()));
  isPositiveTrend = computed(() => this.revenueTrend() >= 0);

  dashboardData = computed(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.baseDate());
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const dayOrders = this.orders().filter(o =>
        this.getAsDate(o.createdAt)?.toISOString().split('T')[0] === dayStr
      );
      return { 
        day: dayStr.slice(5), 
        revenue: dayOrders.reduce((sum, o) => sum + o.finalTotal, 0) 
      };
    }).reverse();
  });

  orderStats = computed(() => {
    const itemMap = new Map<string, number>();
    this.ordersOfSelectedDay().forEach(o => o.items.forEach(i => {
      itemMap.set(i.name, (itemMap.get(i.name) ?? 0) + (i.quantity ?? 1));
    }));
    return Array.from(itemMap.entries()).sort((a, b) => b[1] - a[1]);
  });

  averageRevenue = computed(() => {
    const orders = this.ordersOfSelectedDay();
    return orders.length > 0 ? this.totalRevenue() / orders.length : 0;
  });

  maxRevenue = computed(() => {
    const revenues = this.dashboardData().map(d => d.revenue);
    const max = Math.max(...revenues);
    return max > 0 ? max : 100;
  });

  printReport(): void { window.print(); }
}