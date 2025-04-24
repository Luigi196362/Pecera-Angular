import { TestBed } from '@angular/core/testing';

import { AquariumDataService } from './aquarium-data.service';

describe('AquariumDataService', () => {
  let service: AquariumDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AquariumDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
