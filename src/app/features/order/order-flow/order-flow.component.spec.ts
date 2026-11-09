import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { SAUCE_INFO_LIST } from '../../../shared/modals/extras.data';
import { OrderFlowComponent } from './order-flow.component';
import { Category, OrderItem } from '../../../shared/modals/order.model';
import { OrderService } from '../../../shared/services/order.service';
import { DataService, normalizeCategory } from '../../../shared/services/data.services';

describe('OrderFlowComponent', () => {
  let component: OrderFlowComponent;
  let fixture: ComponentFixture<OrderFlowComponent>;
  let mockOrderService: {
    category: ReturnType<typeof signal<string>>;
    step: ReturnType<typeof signal<number>>;
    totalItemsCount: ReturnType<typeof signal<number>>;
    addItem: jasmine.Spy;
    addExtra: jasmine.Spy;
    removeExtraById: jasmine.Spy;
    resetExtras: jasmine.Spy;
    next: jasmine.Spy;
  };

  beforeEach(async () => {
    mockOrderService = {
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

  it('should add drink directly and display toast message when category is alkfree', () => {
    const drinkItem: OrderItem = { id: 'cola-1', name: 'Coca Cola 0.33l', category: 'alkfree', price: 2.5, amount: 1 };
    component.openExtras(drinkItem, new MouseEvent('click'));
    expect(mockOrderService.addItem).toHaveBeenCalledWith(drinkItem);
    expect(component.toastMessage()).toContain('Coca Cola 0.33l');
  });

  it('should add drink directly and display toast message when category is bottle', () => {
    const beerItem: OrderItem = { id: 'beer-1', name: 'Radeberger 0.5l', category: 'bottle', price: 3.0, amount: 1 };
    component.openExtras(beerItem, new MouseEvent('click'));
    expect(mockOrderService.addItem).toHaveBeenCalledWith(beerItem);
    expect(component.toastMessage()).toContain('Radeberger 0.5l');
  });

  it('should open extras modal and NOT show drink toast when category is food', () => {
    const foodItem: OrderItem = { id: 'doener-1', name: 'Döner Kebab', category: 'doener', price: 7.5, amount: 1 };
    component.openExtras(foodItem, new MouseEvent('click'));
    expect(component.selectedItem()).toBe(foodItem);
    expect(component.toastMessage()).toBeNull();
  });

  it('should clear toast message after timeout', fakeAsync(() => {
    component.showToast('Test Drink');
    expect(component.toastMessage()).toBe('Test Drink zum Warenkorb hinzugefügt');
    tick(2500);
    expect(component.toastMessage()).toBeNull();
  }));

  it('should evaluate isDrinkCategory correctly for different categories', () => {
    mockOrderService.category.set('alkfree');
    expect(component.isDrinkCategory()).toBeTrue();
    mockOrderService.category.set('bottle');
    expect(component.isDrinkCategory()).toBeTrue();
    mockOrderService.category.set('doener');
    expect(component.isDrinkCategory()).toBeFalse();
  });

  it('should format numbers, clean names, and parse drink volumes accurately', () => {
    const testDish: OrderItem = { id: 'd-7', name: '07 Riesen-Döner', category: 'doener', price: 10, amount: 1 };
    const testDrink: OrderItem = { id: 'c-1', name: 'Coca Cola 0.33l', category: 'alkfree', price: 2, amount: 1 };
    expect(component.getItemNumber(testDish, 0)).toBe('07');
    expect(component.getItemNumber(testDrink, 0)).toBe('0,33 l');
    expect(component.getCleanItemName(testDish)).toBe('Riesen-Döner');
    expect(component.getDrinkVolume(testDrink)).toBe('0,33 l');
    expect(component.getDrinkTitle(testDrink)).toBe('Coca Cola');
  });

  it('should update active hero item on preview item selection', () => {
    const firstDish: OrderItem = { id: 'd-1', name: '01 Döner', category: 'doener', price: 6.5, amount: 1 };
    const secondDish: OrderItem = { id: 'd-2', name: '02 Döner Käse', category: 'doener', price: 7.5, amount: 1 };
    component.setPreviewItem(secondDish);
    expect(component.previewItem()).toBe(secondDish);
    expect(component.activeHeroItem()).toBe(secondDish);
  });
});
