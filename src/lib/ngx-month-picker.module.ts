import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { NgxMonthPickerComponent } from './ngx-month-picker.component';



@NgModule({
  declarations: [NgxMonthPickerComponent],
  imports: [
    CommonModule
  ],
  exports: [NgxMonthPickerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NgxMonthPickerModule { }
