import { ComponentFixture, TestBed, DeferBlockBehavior, DeferBlockState } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HomeComponent } from './home.component';

@Component({ selector: 'app-landing-page', template: '', standalone: true })
class StubLandingPageComponent {}

@Component({ selector: 'app-about-me', template: '', standalone: true })
class StubAboutMeComponent {}

@Component({ selector: 'app-skills', template: '', standalone: true })
class StubSkillsComponent {}

@Component({ selector: 'app-portfolio', template: '', standalone: true })
class StubPortfolioComponent {}

@Component({ selector: 'app-feedbacks', template: '', standalone: true })
class StubFeedbacksComponent {}

@Component({ selector: 'app-contact', template: '', standalone: true })
class StubContactComponent {}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      deferBlockBehavior: DeferBlockBehavior.Manual,
    })
      .overrideComponent(HomeComponent, {
        set: {
          imports: [
            StubLandingPageComponent,
            StubAboutMeComponent,
            StubSkillsComponent,
            StubPortfolioComponent,
            StubFeedbacksComponent,
            StubContactComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Component Metadata', () => {
    it('should use OnPush change detection strategy', () => {
      expect((HomeComponent as any).ɵcmp.onPush).toBeTrue();
    });
  });

  describe('Eagerly Loaded Sections', () => {
    it('should render app-landing-page immediately', () => {
      expect(fixture.debugElement.query(By.css('app-landing-page'))).toBeTruthy();
    });

    it('should render app-about-me immediately', () => {
      expect(fixture.debugElement.query(By.css('app-about-me'))).toBeTruthy();
    });
  });

  describe('@defer Blocks - Placeholder State', () => {
    it('should expose exactly 4 defer blocks', async () => {
      const deferBlocks = await fixture.getDeferBlocks();
      expect(deferBlocks.length).toBe(4);
    });

    it('should not render deferred components before viewport trigger', () => {
      expect(fixture.debugElement.query(By.css('app-skills'))).toBeNull();
      expect(fixture.debugElement.query(By.css('app-portfolio'))).toBeNull();
      expect(fixture.debugElement.query(By.css('app-feedbacks'))).toBeNull();
      expect(fixture.debugElement.query(By.css('app-contact'))).toBeNull();
    });
  });

  describe('@defer Blocks - Resolved State', () => {
    it('should render app-skills after its defer block is triggered', async () => {
      const [skillsBlock] = await fixture.getDeferBlocks();
      await skillsBlock.render(DeferBlockState.Complete);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('app-skills'))).toBeTruthy();
    });

    it('should render app-portfolio after its defer block is triggered', async () => {
      const deferBlocks = await fixture.getDeferBlocks();
      await deferBlocks[1].render(DeferBlockState.Complete);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('app-portfolio'))).toBeTruthy();
    });

    it('should render app-feedbacks after its defer block is triggered', async () => {
      const deferBlocks = await fixture.getDeferBlocks();
      await deferBlocks[2].render(DeferBlockState.Complete);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('app-feedbacks'))).toBeTruthy();
    });

    it('should render app-contact after its defer block is triggered', async () => {
      const deferBlocks = await fixture.getDeferBlocks();
      await deferBlocks[3].render(DeferBlockState.Complete);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('app-contact'))).toBeTruthy();
    });

    it('should render all deferred sections when all blocks are triggered', async () => {
      const deferBlocks = await fixture.getDeferBlocks();
      for (const block of deferBlocks) {
        await block.render(DeferBlockState.Complete);
      }
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('app-skills'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('app-portfolio'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('app-feedbacks'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('app-contact'))).toBeTruthy();
    });
  });
});
