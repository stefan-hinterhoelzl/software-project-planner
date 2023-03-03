import { TestBed } from '@angular/core/testing';

import { GitlabALMService } from './gitLab.service';

describe('GitlabService', () => {
  let service: GitlabALMService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GitlabALMService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
