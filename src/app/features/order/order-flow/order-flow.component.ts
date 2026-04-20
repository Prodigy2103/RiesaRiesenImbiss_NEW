import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../shared/services/order.service';
import { OrderItem, Category, IngredientDetail } from '../../../shared/modals/order.model';
import { EXTRAS_LIST, SAUCE_INFO_LIST } from '../../../shared/modals/extras.data';
import { NeonButtonComponent } from '../../../shared/ui/neon-button/neon-button.component';
import { DataService } from '../../../shared/services/data.services';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';
import { HighlightPipe } from '../../../shared/services/highlight.pipe';

@Component({
  selector: 'app-order-flow',
  standalone: true,
  imports: [CommonModule, FormsModule, NeonButtonComponent, OrderSummaryComponent, HighlightPipe],
  templateUrl: './order-flow.component.html',
  styleUrls: ['./order-flow.component.scss'],
})
export class OrderFlowComponent {
  public order = inject(OrderService);
  public dataService = inject(DataService);

  menuItems = this.dataService.menuItems;
  categories = this.dataService.categories;

  extrasList = EXTRAS_LIST;

  selectedItem = signal<OrderItem | null>(null);
  selectedIngredientInfo = signal<IngredientDetail[] | null>(null);
  readonly TACO_ID = 'CVnnpJ5lvCwIeOHeEc0Z';

  selectedCategoryLabel = computed(() => {
    const currentKey = this.order.category();
    const allCats = this.categories() as Category[];
    return allCats.find(c => c.key === currentKey)?.label || 'Menü';
  });

  filteredItems = computed(() => {
    const key = this.order.category()?.toLowerCase();
    const all = this.menuItems() as OrderItem[];
    return key ? all.filter(i => i.category?.toLowerCase() === key) : [];
  });

  isSauceMode = computed(() => {
    const info = this.selectedIngredientInfo();
    return !!info?.length && SAUCE_INFO_LIST.some(s => s.id === info[0].id);
  });

  public isTacoSauce(extraName: string): boolean {
    return SAUCE_INFO_LIST.some(sauce => sauce.name === extraName);
  }

  showAllIngredients(identifiers: string[] | undefined, event: Event): void {
    event.stopPropagation();
    const ids = identifiers ?? [];
    if (ids.length > 0) {
      this.selectedIngredientInfo.set(ids.map(id => this.mapIdToDetail(id)));
    }
  }

  getIngredients(data: string | string[] | undefined): string[] {
    if (!data) return [];
    const text = Array.isArray(data) ? data.join(', ') : data;
    return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  getIngredientName(idOrObj: string | number | IngredientDetail | null | undefined): string {
    if (!idOrObj) return '';

    // Fall: Es ist eine ID (String oder Number)
    if (typeof idOrObj === 'string' || typeof idOrObj === 'number') {
        const found = this.dataService.getIngredient(idOrObj.toString());
        return found ? (found.detail || found.name) : idOrObj.toString();
    }

    // Fall: Es ist bereits ein Objekt vom Typ IngredientDetail
    return idOrObj.name || 'Unbekannt';
}

  // Hilfsmethode für das Klick-Event (String-Array für die Info-Karte)
  public getSafeIdArray(data: (string | number)[] | undefined): string[] {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map(id => id.toString());
}

  someFunction(item: OrderItem) {
    console.log(item.name);
  }

  handleDescriptionClick(category: Category, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (category.id === this.TACO_ID) {
      this.selectedIngredientInfo.set([...SAUCE_INFO_LIST]);
    }
  }

  passCategory(catKey: string, event: Event): void {
    event.stopPropagation();
    this.order.category.set(catKey);
    this.order.next();
  }

  openExtras(item: OrderItem, event: Event): void {
    event.stopPropagation();
    this.selectedItem.set(item);
  }

  toggleExtra(extra: OrderItem, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    isChecked ? this.order.addExtra(extra) : this.order.removeExtraById(extra.id);
  }

  confirmOrder(): void {
    if (this.selectedItem()) this.order.addItem(this.selectedItem()!);
    this.cancelSelection();
  }

  cancelSelection(): void {
    this.selectedItem.set(null);
    this.order.resetExtras();
  }

  private mapIdToDetail(id: string): IngredientDetail {
    const found = this.dataService.getIngredient(id);
    return {
      id,
      name: found?.name ?? id,
      detail: found?.detail ?? (this.isSauceMode() ? 'Sauce' : 'Basis-Zutat'),
      composition: found?.composition ?? ''
    };
  }

  public isString(val: unknown): val is string {
    return typeof val === 'string';
}

  // Konvertiert das Array sicher für die showAllIngredients Funktion
  public getAsStringArray(data: (string | OrderItem)[] | undefined): string[] {
    if (!data) return [];
    return data.filter((item): item is string => typeof item === 'string');
  }
}