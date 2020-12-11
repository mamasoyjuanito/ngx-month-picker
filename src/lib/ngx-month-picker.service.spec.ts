import { TestBed } from '@angular/core/testing';

import { NgxMonthPickerService } from './ngx-month-picker.service';

describe('NgxMonthPickerService', () => {
  let service: NgxMonthPickerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxMonthPickerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
