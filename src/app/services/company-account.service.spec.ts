import { TestBed } from '@angular/core/testing';

import { CompanyAccountService } from './company-account.service';

describe('CompanyAccountService', () => {
  let service: CompanyAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
