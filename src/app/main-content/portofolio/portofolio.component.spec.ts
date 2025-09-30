import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortofolioComponent } from './portofolio.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PlatformService } from '../../shared/services/platform.service';

describe('PortofolioComponent', () => {
  let component: PortofolioComponent;
  let fixture: ComponentFixture<PortofolioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortofolioComponent, TranslateModule.forRoot()],
      providers: [PlatformService, TranslateService],
    }).compileComponents();

    fixture = TestBed.createComponent(PortofolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have projects array', () => {
    expect(component.projects).toBeDefined();
    expect(component.projects.length).toBeGreaterThan(0);
  });

  it('should open project overlay', () => {
    const project = component.projects[0];
    component.openProjectOverlay(project, 0);
    expect(component.selectedProject).toBe(project);
    expect(component.selectedIndex).toBe(0);
  });

  it('should close overlay', () => {
    component.selectedProject = component.projects[0];
    component.closeOverlay();
    expect(component.selectedProject).toBeNull();
  });

  it('should navigate to next project', () => {
    component.selectedProject = component.projects[0];
    component.selectedIndex = 0;
    component.nextProject();
    expect(component.selectedIndex).toBe(1);
    expect(component.selectedProject).toBe(component.projects[1]);
  });

  it('should wrap to first project when at end', () => {
    const lastIndex = component.projects.length - 1;
    component.selectedIndex = lastIndex;
    component.selectedProject = component.projects[lastIndex];
    component.nextProject();
    expect(component.selectedIndex).toBe(0);
    expect(component.selectedProject).toBe(component.projects[0]);
  });

  it('should set active project on hover', () => {
    const mockEvent = new MouseEvent('mouseenter');
    Object.defineProperty(mockEvent, 'currentTarget', {
      value: document.createElement('div'),
      writable: false,
    });
    component.setActiveProject(0, mockEvent);
    expect(component.activeProjectId).toBe(0);
  });

  it('should clear active project', () => {
    component.activeProjectId = 0;
    component.clearActiveProject();
    expect(component.activeProjectId).toBeNull();
  });
});
