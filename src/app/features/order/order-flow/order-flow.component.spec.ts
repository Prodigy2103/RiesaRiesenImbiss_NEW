import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { SAUCE_INFO_LIST } from '../../../shared/modals/extras.data';
import { OrderFlowComponent } from './order-flow.component';
import { Category } from '../../../shared/modals/order.model';
import { OrderService } from '../../../shared/services/order.service';
import { DataService, normalizeCategory } from '../../../shared/services/data.services';

describe('OrderFlowComponent', () => {
  let component: OrderFlowComponent;
  let fixture: ComponentFixture<OrderFlowComponent>;

  beforeEach(async () => {
    const mockOrderService = {
      category: signal(''),
      step: signal(1),
      totalItemsCount: signal(0),
      addItem: jasmine.createSpy('addItem'),
      addExtra: jasmine.createSpy('addExtra'),
      removeExtraById: jasmine.createSpy('removeExtraById'),
      resetExtras: jasmine.createSpy('resetExtras'),
      next: jasmine.createSpy('next')
    };

    const mockDataService = {
      menuItems: signal([]),
      categories: signal([
        normalizeCategory('pizza', {
          id: 'pizza',
          key: 'pizza ',
          label: 'Hausgemachte Pizza',
          img: 'assets/CatImg/pizza_margherita.webp ',
          description: 'Hausgemachter Teig, fruchtige Tomatensauce, Käse',
          order: 14
        })
      ]),
      getIngredient: jasmine.createSpy('getIngredient')
    };

    await TestBed.configureTestingModule({
      imports: [OrderFlowComponent],
      providers: [
        { provide: OrderService, useValue: mockOrderService },
        { provide: DataService, useValue: mockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load SAUCE_INFO_LIST into the signal when taco category is clicked', () => {
    const tacoCategory = { id: 'CVnnpJ5lvCwIeOHeEc0Z' } as Category;
    const clickEvent = new MouseEvent('click');

    component.handleDescriptionClick(tacoCategory, clickEvent);
    expect(component.selectedIngredientInfo()).toEqual(SAUCE_INFO_LIST);
  });

  it('should normalize the "Hausgemachte Pizza" category from DataService properly', () => {
    const allCategories = component.categories();
    const pizzaCategories = allCategories.filter(category => category.key === 'pizza');

    expect(pizzaCategories.length).toBe(1);
    expect(pizzaCategories[0].label).toBe('Hausgemachte Pizza');
    expect(pizzaCategories[0].img).toBe('/assets/CatImg/pizza_margherita.webp');
  });

  it('should filter extras for the pizza category and show Extrawunsch for 100, 101, 102', () => {
    component.selectedItem.set({
      id: 'pizza-1',
      name: 'Pizza Margherita',
      category: 'pizza',
      price: 8.5,
      amount: 1
    });

    const filteredExtras = component.availableExtras();
    const herbSauce = filteredExtras.find(extra => extra.id === '100')!;

    expect(filteredExtras.length).toBeGreaterThan(0);
    expect(herbSauce).toBeDefined();
    expect(component.getFreeExtraLabel(herbSauce)).toBe('Extrawunsch');

    component.selectedItem.set({
      id: 'doener-1',
      name: 'Döner Kebab',
      category: 'doener',
      price: 7.5,
      amount: 1
    });
    expect(component.getFreeExtraLabel(herbSauce)).toBe('Inklusive');
  });
});
