import {
  TestBed,
  ComponentFixture,
  fakeAsync,
  flush,
  async
} from '@angular/core/testing';
import { HeroDetailComponent } from './hero-detail.component';
import { ActivatedRoute } from '@angular/router';
import { HeroService } from '../hero.service';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs/internal/observable/of';

describe('HeroDetailComponent', () => {
  let fixture: ComponentFixture<HeroDetailComponent>;
  let mockActivatedRoute, mockHeroService, mockLocation;

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: { paramMap: { get: () => '3' } }
    };
    mockHeroService = jasmine.createSpyObj(['getHero', 'updateHero']);
    mockLocation = jasmine.createSpyObj(['back']);

    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [HeroDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: HeroService, useValue: mockHeroService },
        { provide: Location, useValue: mockLocation }
      ]
    });

    fixture = TestBed.createComponent(HeroDetailComponent);
    mockHeroService.getHero.and.returnValue(
      of({ id: 3, name: 'hero', strength: 100 })
    );
  });

  it('should render the hero name in an h2 tag', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h2').textContent).toContain(
      'HERO'
    );
  });

  // fake async works with both Observables and Promises/all async code
  it('should call updateHero when save is called', fakeAsync(() => {
    mockHeroService.updateHero.and.returnValue(of({}));
    fixture.detectChanges();

    fixture.componentInstance.save();
    // you can controll the clock with fakeAsync tick, so clock moves forward 250ms
    // tick(250);

    // you can also use flush which fast forwards clock to execute waiting tasks
    flush();

    expect(mockHeroService.updateHero).toHaveBeenCalled();
  }));
});
