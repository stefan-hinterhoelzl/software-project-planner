import { TestBed } from '@angular/core/testing';

import { ALMDataAggregator } from './alm-data-aggregator.service';

describe('AlmDataAggregatorService', () => {
  let service: ALMDataAggregator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ALMDataAggregator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
