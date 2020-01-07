import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroesComponent } from './heroes.component';
import { Hero } from '../hero';
import { HeroComponent } from '../hero/hero.component';
import { HeroService } from '../hero.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import {
  Component,
  Input,
  Directive,
  HostListener,
  Output,
  EventEmitter
} from '@angular/core';
import { RouterLinkDirectiveStub } from '../../testing/RouterLinkDirectiveStub';

describe('Heroes Component (unit tests)', () => {
  let component: HeroesComponent;
  let HEROES;
  let mockHeroService;

  beforeEach(() => {
    HEROES = [
      { id: 1, name: 'testhero1', strength: 5 },
      { id: 2, name: 'testhero2', strength: 8 },
      { id: 3, name: 'testhero3', strength: 10 }
    ];

    mockHeroService = jasmine.createSpyObj([
      'getHeroes',
      'addHero',
      'deleteHero'
    ]);

    component = new HeroesComponent(mockHeroService);
  });

  describe('delete', () => {
    // test state
    it('should remove indicated hero from array', () => {
      mockHeroService.deleteHero.and.returnValue(of(true));
      component.heroes = HEROES;

      component.delete(HEROES[2]);

      expect(component.heroes.length).toBe(2);
      expect(component.heroes.map(h => h.name).includes('testhero3')).toBe(
        false
      );
    });

    // an interaction test
    it('should call heroService.deleteHero with the correct hero', () => {
      mockHeroService.deleteHero.and.returnValue(of(true));
      component.heroes = HEROES;

      component.delete(HEROES[2]);

      expect(mockHeroService.deleteHero).toHaveBeenCalledWith(HEROES[2]);
    });

    it('should subscribe to the observable of heroService.deleteHero', () => {
      mockHeroService.deleteHero.and.returnValue(of(new Hero()));
      component.heroes = HEROES;

      // ? does this work the way I think it is or is this a false positive?
      const observable = mockHeroService.deleteHero();
      spyOn(observable, 'subscribe');

      component.delete(HEROES[2]);

      expect(observable.subscribe).toHaveBeenCalled();
    });
  });
});

describe('Heroes Component (shallow tests)', () => {
  let fixture: ComponentFixture<HeroesComponent>;
  let mockHeroService;
  let HEROES;

  // mock child component
  @Component({
    selector: 'app-hero',
    template: '<div></div>'
  })
  class FakeHeroComponent {
    @Input() hero: Hero;
    @Output() delete = new EventEmitter();

    onDeleteClick($event): void {
      $event.stopPropagation();
      this.delete.next();
    }
  }

  beforeEach(() => {
    HEROES = [
      { id: 1, name: 'testhero1', strength: 5 },
      { id: 2, name: 'testhero2', strength: 8 },
      { id: 3, name: 'testhero3', strength: 10 }
    ];

    mockHeroService = jasmine.createSpyObj([
      'getHeroes',
      'addHero',
      'deleteHero'
    ]);

    TestBed.configureTestingModule({
      declarations: [
        HeroesComponent,
        FakeHeroComponent,
        RouterLinkDirectiveStub
      ],
      providers: [{ provide: HeroService, useValue: mockHeroService }]
      // can use to ignore child elements in the template, but try to avoid this. Just mock the children.
      // schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(HeroesComponent);
  });

  it('should set heroes correctly from service', () => {
    mockHeroService.getHeroes.and.returnValue(of(HEROES));
    fixture.detectChanges();

    expect(fixture.componentInstance.heroes.length).toBe(3);
  });

  it('should render one li for each hero', () => {
    mockHeroService.getHeroes.and.returnValue(of(HEROES));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('li').length).toBe(
      HEROES.length
    );
  });
});

describe('Heroes Component (deep tests)', () => {
  let fixture: ComponentFixture<HeroesComponent>;
  let HEROES: Hero[];
  let mockHeroService;

  beforeEach(() => {
    HEROES = [
      { id: 1, name: 'PiderMan', strength: 8 },
      { id: 2, name: 'DuperMan', strength: 10 },
      { id: 2, name: 'BadMan', strength: 5 }
    ];

    mockHeroService = jasmine.createSpyObj([
      'getHeroes',
      'addHero',
      'deleteHero'
    ]);

    TestBed.configureTestingModule({
      declarations: [HeroesComponent, HeroComponent, RouterLinkDirectiveStub],
      providers: [{ provide: HeroService, useValue: mockHeroService }]
    });

    fixture = TestBed.createComponent(HeroesComponent);
  });

  it('should should render each hero as hero component', () => {
    mockHeroService.getHeroes.and.returnValue(of(HEROES));
    // when running change detection on parent, it gets run on all children
    fixture.detectChanges();

    // one of the cool capabilities of the debugElement
    const heroComponents = fixture.debugElement.queryAll(
      // component is a subclass of Directive in Angular, so you can use By.directive to find component Directives
      // as well as attribute directives
      By.directive(HeroComponent)
    );

    // with debug elements you can also get a hook into the componentInstance as well
    expect(heroComponents.length).toEqual(HEROES.length);
    for (let i = 0; i < heroComponents.length; i++) {
      // toEqual is a deep equivalency, so it checks props
      expect(heroComponents[i].componentInstance.hero).toEqual(HEROES[i]);
    }
  });

  it(`should call heroService.deleteHero when the hero
      component's delete button is clicked`, () => {
    // watch HeroesComponent.delete to see if it gets invoked
    spyOn(fixture.componentInstance, 'delete');

    mockHeroService.getHeroes.and.returnValue(of(HEROES));
    fixture.detectChanges();

    const heroComponents = fixture.debugElement.queryAll(
      By.directive(HeroComponent)
    );

    // * you can trigger the HTML click, or you could just tell the child component to raise its event.
    // * Here we'll just raise the event because the HTML click event handling is more specific to
    // * the child component and should be tested in its own integration tests

    // heroComponents[0]
    //   .query(By.css("button"))
    //   .triggerEventHandler("click", { stopPropagation: () => {} });

    // * When triggering with event, we can get an instance of the component, or we could
    // * grab the debugElement which has a nice tool to trigger events as well
    // (<HeroComponent>heroComponents[0].componentInstance).delete.emit(undefined);
    heroComponents[0].triggerEventHandler('delete', undefined);

    expect(fixture.componentInstance.delete).toHaveBeenCalledWith(HEROES[0]);
  });

  it('should add a new hero to the hero list when the add button is clicked', () => {
    mockHeroService.getHeroes.and.returnValue(of(HEROES));
    fixture.detectChanges();

    const name = 'Hero Bro';
    mockHeroService.addHero.and.returnValue(of({ id: 5, name, strength: 5 }));

    const inputElement = fixture.debugElement.query(By.css('input'))
      .nativeElement;
    const addButton = fixture.debugElement.queryAll(By.css('button'))[0];

    // simulate typing into input and clicking add button
    inputElement.value = name;
    addButton.triggerEventHandler('click', null);

    // have to run change detection in order to update template
    fixture.detectChanges();

    const heroText = fixture.debugElement.query(By.css('ul')).nativeElement
      .textContent;
    expect(heroText).toContain('Hero Bro');
  });

  it('should have the correct route for the first hero', () => {
    mockHeroService.getHeroes.and.returnValue(of(HEROES));
    fixture.detectChanges();

    const heroComponents = fixture.debugElement.queryAll(
      By.directive(HeroComponent)
    );

    expect(heroComponents.length > 0).toBe(true);

    const routerLink = heroComponents[0]
      .query(By.directive(RouterLinkDirectiveStub))
      .injector.get<RouterLinkDirectiveStub>(RouterLinkDirectiveStub);

    heroComponents[0].query(By.css('a')).triggerEventHandler('click', null);

    expect(routerLink.navigatedTo).toBe('/detail/1');
  });
});
