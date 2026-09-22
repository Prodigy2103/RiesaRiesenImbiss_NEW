import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { SAUCE_INFO_LIST } from '../../../shared/modals/extras.data';
import { OrderFlowComponent } from './order-flow.component';
import { Category } from '../../../shared/modals/order.model';
import { OrderService } from '../../../shared/services/order.service';
import { DataService } from '../../../shared/services/data.services';

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
      categories: signal([]),
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
});
