import { TestBed } from '@angular/core/testing';

import { RightGuardGuard } from './right-guard.guard';

describe('RightGuardGuard', () => {
  let guard: RightGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RightGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
