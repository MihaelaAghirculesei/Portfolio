import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { LegalNoticeComponent } from './legal-notice.component';

describe('LegalNoticeComponent', () => {
  let component: LegalNoticeComponent;
  let fixture: ComponentFixture<LegalNoticeComponent>;
  let mockLocation: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    mockLocation = jasmine.createSpyObj('Location', ['back']);

    await TestBed.configureTestingModule({
      imports: [LegalNoticeComponent],
      providers: [
        { provide: Location, useValue: mockLocation }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call location.back() when goBack() is called', () => {
    component.goBack();
    expect(mockLocation.back).toHaveBeenCalled();
  });

  it('should return correctly formatted full address', () => {
    expect(component.fullAddress).toBe('Springwiesen, 29, 38446 Wolfsburg');
  });

  it('should return correctly formatted phone link', () => {
    expect(component.phoneLink).toMatch(/^tel:/);
  });

  it('should return correctly formatted email link', () => {
    expect(component.emailLink).toMatch(/^mailto:/);
  });
});
