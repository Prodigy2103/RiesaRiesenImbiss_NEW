import { signal } from '@angular/core';
import { DataService, calculateDayTimestampRange, normalizeMenuItem } from './app/shared/services/data.services';
import { OrderItem } from './app/shared/modals/order.model';

describe('DataService (Shared)', () => {
  it('should calculate the full 24h range for any date', () => {
    const testDate = new Date('2026-04-20');
    const range = calculateDayTimestampRange(testDate);
    expect(range.start.toDate().getHours()).toBe(0);
    expect(range.start.toDate().getMinutes()).toBe(0);
    expect(range.end.toDate().getHours()).toBe(23);
    expect(range.end.toDate().getMilliseconds()).toBe(999);
  });

  it('should ensure image paths always start with a slash', () => {
    const sourceItem: OrderItem = {
      id: 'item-1',
      name: 'Pizza Margherita',
      category: 'pizza',
      price: 8.5,
      amount: 1,
      imgPath: 'assets/img.png'
    };
    const formatted = normalizeMenuItem('doc-1', sourceItem);
    expect(formatted.imgPath).toBe('/assets/img.png');
    expect(formatted.id).toBe('doc-1');
  });

  it('should preserve leading slash if already present', () => {
    const sourceItem: OrderItem = {
      id: 'item-2',
      name: 'Pasta Carbonara',
      category: 'pasta',
      price: 9.0,
      amount: 1,
      imgPath: '/assets/pasta.png'
    };
    const formatted = normalizeMenuItem('doc-2', sourceItem);
    expect(formatted.imgPath).toBe('/assets/pasta.png');
  });

  it('should return ingredient by identifier from ingredientDetailsMap', () => {
    const serviceInstance = Object.create(DataService.prototype);
    serviceInstance.ingredientDetailsMap = signal({
      '1': { id: '1', name: 'Zwiebeln', detail: 'Frische Zwiebeln' }
    });

    const resolvedIngredient = serviceInstance.getIngredient('1');
    expect(resolvedIngredient?.name).toBe('Zwiebeln');
  });
});