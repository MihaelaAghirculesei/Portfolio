import { TestBed } from '@angular/core/testing';

import { TranslationserviceService } from './translationservice.service';

describe('TranslationserviceService', () => {
  let service: TranslationserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslationserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
