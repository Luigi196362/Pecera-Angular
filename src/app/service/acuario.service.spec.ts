import { TestBed } from '@angular/core/testing';

import { AcuarioService } from './acuario.service';

describe('AcuarioService', () => {
  let service: AcuarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AcuarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
