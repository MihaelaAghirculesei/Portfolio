import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerSectionComponent } from './banner-section.component';

describe('BannerSectionComponent', () => {
  let component: BannerSectionComponent;
  let fixture: ComponentFixture<BannerSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerSectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BannerSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
