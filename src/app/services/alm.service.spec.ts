import { TestBed } from '@angular/core/testing';

import { ALMService } from './alm.service';

describe('GitlabService', () => {
  let service: ALMService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ALMService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
