import { TestBed } from '@angular/core/testing';
import { DataService } from './app/shared/services/data.services';
import { Firestore } from '@angular/fire/firestore';

describe('DataService (Shared)', () => {
  let service: DataService;
  let firestoreMock: any;

  beforeEach(() => {
    firestoreMock = {}; // Basis-Mock

    TestBed.configureTestingModule({
      providers: [
        DataService,
        { provide: Firestore, useValue: firestoreMock }
      ]
    });
    service = TestBed.inject(DataService);
  });

  it('should calculate the full 24h range for any date', () => {
    const testDate = new Date('2026-04-20');
    const range = (service as any).calculateDayRange(testDate);
    
    // Teste, ob Start auf 00:00:00 Uhr gesetzt wurde
    expect(range.start.toDate().getHours()).toBe(0);
    expect(range.start.toDate().getMinutes()).toBe(0);
    
    // Teste, ob Ende auf 23:59:59 Uhr gesetzt wurde
    expect(range.end.toDate().getHours()).toBe(23);
    expect(range.end.toDate().getMilliseconds()).toBe(999);
  });

  it('should ensure image paths always start with a slash', () => {
    const item: any = { imgPath: 'assets/img.png' };
    const formatted = (service as any).formatItem('id1', item);
    expect(formatted.imgPath).toBe('/assets/img.png');
  });
});