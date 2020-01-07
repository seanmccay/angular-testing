import { HeroComponent } from './hero.component';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Hero } from '../hero';
import { HeroesComponent } from '../heroes/heroes.component';
import { HeroService } from '../hero.service';
import { By } from '@angular/platform-browser';
import { RouterLinkDirectiveStub } from '../../testing/RouterLinkDirectiveStub';

describe('Hero Component (shallow tests)', () => {
  let fixture: ComponentFixture<HeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [HeroComponent, RouterLinkDirectiveStub]
    });
    fixture = TestBed.createComponent(HeroComponent);
  });

  it('should have the correct hero', () => {
    fixture.componentInstance.hero = { id: 1, name: 'testhero', strength: 8 };
    expect(fixture.componentInstance.hero.name).toEqual('testhero');
  });

  it('should render the hero name in an anchor tag', () => {
    fixture.componentInstance.hero = { id: 1, name: 'testhero', strength: 8 };

    // * run change detection / init component
    fixture.detectChanges();

    // you can use the debug element or native element. debug element has a few more capabiliites available.
    expect(
      fixture.debugElement.query(By.css('a')).nativeElement.textContent
    ).toContain('testhero');

    expect(fixture.nativeElement.querySelector('a').textContent).toContain(
      'testhero'
    );
  });
});

describe('Hero Component (deep tests)', () => {
  let fixture: ComponentFixture<HeroesComponent>;
  let HEROES: Hero[];
  let heroService;

  beforeEach(() => {
    HEROES = [
      { id: 1, name: 'PiderMan', strength: 8 },
      { id: 2, name: 'DuperMan', strength: 10 },
      { id: 2, name: 'BadMan', strength: 5 }
    ];

    heroService = jasmine.createSpyObj(['getHeroes', 'addHero', 'deleteHero']);

    TestBed.configureTestingModule({
      declarations: [HeroesComponent, HeroComponent],
      providers: [{ provide: HeroService, useValue: heroService }]
    });

    fixture = TestBed.createComponent(HeroesComponent);
  });
});
