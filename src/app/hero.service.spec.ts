import { TestBed, inject } from '@angular/core/testing';
import { HeroService } from './hero.service';
import { MessageService } from './message.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

describe('Hero Service (integration tests)', () => {
  let mockMessageService;
  let httpTestingController: HttpTestingController;
  let service;

  beforeEach(() => {
    mockMessageService = jasmine.createSpyObj(['add']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HeroService,
        { provide: MessageService, useValue: mockMessageService }
      ]
    });

    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(HeroService);
  });

  describe('getHero', () => {
    it('should call get with the correct url', () => {
      service.getHero(4).subscribe(() => {
        console.log('does not execute until the request is flushed');
      });

      const request = httpTestingController.expectOne('api/heroes/4');
      request.flush({ id: 4, name: 'testhero', strength: 100 });
      httpTestingController.verify();
    });
  });
});
