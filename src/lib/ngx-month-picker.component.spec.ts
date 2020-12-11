import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxMonthPickerComponent } from './ngx-month-picker.component';

describe('NgxMonthPickerComponent', () => {
  let component: NgxMonthPickerComponent;
  let fixture: ComponentFixture<NgxMonthPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxMonthPickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxMonthPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
