import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../shared/services/order.service';
import { OrderItem, Category, IngredientDetail } from '../../../shared/modals/order.model';
import { EXTRAS_LIST, SAUCE_INFO_LIST } from '../../../shared/modals/extras.data';
import { NeonButtonComponent } from '../../../shared/ui/neon-button/neon-button.component';
import { DataService } from '../../../shared/services/data.services';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';

@Component({
  selector: 'app-order-flow',
  standalone: true,
  imports: [CommonModule, FormsModule, NeonButtonComponent, OrderSummaryComponent],
  templateUrl: './order-flow.component.html',
  styleUrls: ['./order-flow.component.scss'],
})
export class OrderFlowComponent {
  public readonly order = inject(OrderService);
  public dataService = inject(DataService);

  menuItems = this.dataService.menuItems;
  categories = this.dataService.categories;

  readonly EXTRAS = signal<OrderItem[]>(EXTRAS_LIST);
  readonly TACO_ID = 'CVnnpJ5lvCwIeOHeEc0Z';

  selectedItem = signal<OrderItem | null>(null);
  selectedIngredientInfo = signal<IngredientDetail[] | null>(null);

  availableExtras = computed(() => {
    const item = this.selectedItem();
    const category = item?.category?.toLowerCase();
    const standardCategories = [
      'salad', 'doener', 'dueruem', 'doener-box',
      'lahmacun'
    ];

    if (!item || !category) return [];

    const exclusions: Record<string, string[]> = {
      'taco': ['100', '101', '102', '108', '109', '110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134'],
      ...standardCategories.reduce((acc, cat) => ({ ...acc, [cat]: ['108', '109', '110', '124', '125', '130', '131', '132', '133', '134'] }), {}),
      'kumpir': ['109', '110', '130', '131', '132', '133', '134'],
      'doener-teller': ['108', '109', '110', '124', '125', '130', '131', '132', '133', '134'],
      'noodle': ['108', '109', '110', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '130', '131', '132', '133', '134'],
      'dueruem-veg': ['108', '109', '110', '111', '112', '113', '130', '131', '132', '133', '134'],
      'pide': ['108', '109', '110', '115', '116', '117', '119', '120', '121', '122', '123', '124', '125', '130', '131', '132', '133', '134'],
      'veg-teller': ['108', '109', '110', '111', '112', '113', '124', '125', '130', '131', '132', '133', '134'],
      'doener-veg': ['108', '109', '110', '111', '112', '113', '124', '125', '130', '131', '132', '133', '134'],
      'casserole': ['100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132'],
      'pommes': ['100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128', '129', '133', '134'],
    };

    const sauceIdsToExclude = exclusions[category] || [];

    return this.EXTRAS().filter(extra => !sauceIdsToExclude.includes(extra.id));
  });

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

  toggleExtra(extra: OrderItem, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    isChecked ? this.order.addExtra(extra) : this.order.removeExtraById(extra.id);
  }

  handleNext(): void {
    if (this.canProceed()) this.order.next();
  }

  protected readonly canProceed = computed(() => this.order.totalItemsCount() > 0);

  openExtras(item: OrderItem, event: Event): void {
    event.stopPropagation();
    if (this.isDrink(item)) {
      this.order.addItem(item);
      return;
    }
    this.selectedItem.set(item);
  }

  private isDrink(item: OrderItem): boolean {
    const category = item.category?.toLowerCase();
    return category === 'bottle' || category === 'alkfree';
  }

  confirmOrder(): void {
    if (this.selectedItem()) this.order.addItem(this.selectedItem()!);
    this.cancelSelection();
  }

  cancelSelection(): void {
    this.selectedItem.set(null);
    this.order.resetExtras();
  }

  getIngredientName(idOrObj: any): string {
    if (!idOrObj) return '';
    if (typeof idOrObj === 'object') return idOrObj.name || 'Unbekannt';
    const found = this.dataService.getIngredient(idOrObj.toString());
    return found ? (found.detail || found.name) : idOrObj.toString();
  }

  getIngredients(data: string | string[] | undefined): string[] {
    if (!data) return [];
    const text = Array.isArray(data) ? data.join(', ') : data;
    return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  showAllIngredients(identifiers: string[] | undefined, event: Event): void {
    event.stopPropagation();
    const ids = identifiers ?? [];
    if (ids.length > 0) {
      this.selectedIngredientInfo.set(ids.map(id => this.mapIdToDetail(id)));
    }
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

  passCategory(catKey: string, event: Event): void {
    event.stopPropagation();
    this.order.category.set(catKey);
    this.order.next();
  }

  handleDescriptionClick(category: Category, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (category.id === this.TACO_ID) this.selectedIngredientInfo.set([...SAUCE_INFO_LIST]);
  }

  public getSafeIdArray(data: (string | number)[] | undefined): string[] {
    return data ? data.map(id => id.toString()) : [];
  }

  public getAsStringArray(data: (string | OrderItem)[] | undefined): string[] {
    if (!data) return [];
    return data.filter((item): item is string => typeof item === 'string');
  }
}