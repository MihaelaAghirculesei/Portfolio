import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AboutmeComponent } from './about-me.component';

describe('AboutmeComponent', () => {
  let component: AboutmeComponent;
  let fixture: ComponentFixture<AboutmeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutmeComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutmeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have about sections', () => {
    expect(component.aboutSections.length).toBe(3);
  });

  it('should cleanup on destroy', () => {
    spyOn(component['observer'] as any, 'disconnect');
    component.ngOnDestroy();
    expect(component['observer']?.disconnect).toHaveBeenCalled();
  });
});
