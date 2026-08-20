import { TestBed } from '@angular/core/testing';
import { DeferGateService } from './defer-gate.service';

describe('DeferGateService', () => {
  let service: DeferGateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DeferGateService] });
    service = TestBed.inject(DeferGateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default revealAll to false', () => {
    expect(service.revealAll()).toBe(false);
  });

  it('should let revealAll be toggled', () => {
    service.revealAll.set(true);
    expect(service.revealAll()).toBe(true);

    service.revealAll.set(false);
    expect(service.revealAll()).toBe(false);
  });
});
