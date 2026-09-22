import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { HeroThreeComponent } from './hero-three.component';
import { OrderService } from '../../../shared/services/order.service';

describe('HeroThreeComponent', () => {
  let component: HeroThreeComponent;
  let fixture: ComponentFixture<HeroThreeComponent>;

  beforeEach(async () => {
    const mockOrderService = {
      step: signal(1)
    };

    await TestBed.configureTestingModule({
      imports: [HeroThreeComponent],
      providers: [
        provideRouter([]),
        { provide: OrderService, useValue: mockOrderService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeroThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
