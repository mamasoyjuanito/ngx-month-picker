import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, HostBinding, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, Renderer2, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { DomHandler } from './domhandler';

@Component({
  selector: 'ngx-month-picker',
  templateUrl: './component.html',
  styleUrls:['./styles.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgxMonthPickerComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: NgxMonthPickerComponent,
      multi: true
    }
  ]
})
export class NgxMonthPickerComponent implements OnInit, OnDestroy, AfterContentInit, ControlValueAccessor, Validator, OnChanges {
 
  @Input('placeholder') placeholder: string;
  @Input('required') isRequired: boolean;
  @Input('disabled') disabled: boolean;
  @Input('readonly') isReadOnly: boolean;

  @Input('mode') mode: string = 'single' || 'range';
  @Input('firstYear') firstYear: number;
  @Input('lastYear') lastYear: number;

  @Input('inputContainerClass') inputContainerClass: string = "calendar-input-container";
  @Input('inputValueClass') inputValueClass: string = "calendar-input-value"; 
  @Input('inputValueClass') calendarContainerClass: string = "calendar-ui"; 
  @Input('monthItemClass') monthItemClass: string = "monthItem";
  @Input('edgeClass') edgeClass: string = "isEdge";
  @Input('notYearClass') notYearClass: string = "notCurrentYear";
  @Input('inRangeClass') inRangeClass: string = "inRange";
  @Input('lowerEdgeClass') lowerEdgeClass: string = "isLowerEdge";
  @Input('upperEdgeClass') upperEdgeClass: string = "upperEdgeClass";
  @Input('cleanBtnClass') cleanBtnClass: string = "clean-btn";
  @Input('acceptBtnClass') acceptBtnClass: string = "accept-btn";

  @ViewChild("calendarInputContainer", { static: false }) calendarInputContainer: ElementRef;
  @ViewChild("calendarUI", { static: false }) calendarUI: ElementRef;
  @ViewChild("calendarContent", { static: false }) calendarContent: ElementRef;
  @ViewChild("select", { static: false }) containerViewChild: ElementRef;

  //@Input('appendTo') 
  appendTo: string = "body";
  
  _Value: any;

  focused: boolean;
  isOpen: boolean;
  _itemFocused: number;
  overlay: HTMLDivElement;
  isClosing: boolean;

  @Output() monthRangeSelected = new EventEmitter<string>();

  @HostBinding('tabindex') tabindex = 0;

  @HostListener('blur')
  blurHandler() {
    this.focused = false;
    this.itemFocused = -1;
    this.onTouched();
  }

  @HostListener('focus')
  focusHandler() {
    this.focused = true;
  }

  onChange: (_: any) => void = (_: any) => { };
  onTouched: () => void = () => { };

  set value(val: any) {
    this._Value = val;
  }

  get value(): any {
    return this._Value;
  }

  set itemFocused(val: number) {
    this._itemFocused = val;
  }

  get itemFocused(): number {
    return this._itemFocused;
  }

  currentYearIndex: number;
  years: Array<number>;
  months: Array<string>;
  monthsData: Array<{
    monthName: string,
    month: number,
    monthYear: number,
    isInRange: boolean,
    isLowerEdge: boolean,
    isUpperEdge: boolean
  }>;
  rangeIndexes: Array<number>;
  monthViewSlicesIndexes: Array<number>;
  monthDataSlice: Array<{
    monthName: string,
    month: number,
    monthYear: number,
    isInRange: boolean,
    isLowerEdge: boolean,
    isUpperEdge: boolean
  }>;
  globalIndexOffset: number;

  constructor(private renderer: Renderer2, private cd: ChangeDetectorRef, private elem: ElementRef) {
    if (!this.placeholder) this.placeholder = 'Seleccionar...';
  }

  ngOnInit(): void {
    this.initCalendar();
    this.cd.detectChanges();
  }

  initCalendar() {
    this.initYearLabels();
    this.initMonthLabels();
    this.initViewSlices();
    this.initMonthsData();
    this.initRangeIndexes();
    if (this.value) {
      if (!this.value['start']) {
        this.currentYearIndex = this.years.findIndex(year => year === (this.value as Date).getFullYear());
      } else {
        this.currentYearIndex = this.years.findIndex(year => year === (this.value['start'] as Date).getFullYear());
      }
    } else {
      this.currentYearIndex = this.years.findIndex(year => year === (new Date()).getFullYear());
    }
    this.sliceDataIntoView();
  }

  ngOnChanges(simpleChange: SimpleChanges) {
    if (simpleChange.value) {
      this.value = simpleChange.value.currentValue;
    }
    if (simpleChange.mode) {
      this.mode = simpleChange.mode.currentValue;
    }
    if (simpleChange.placeholder) {
      this.placeholder = simpleChange.placeholder.currentValue;
    }
    if(simpleChange.acceptBtnClass) this.acceptBtnClass = simpleChange.acceptBtnClass.currentValue;
  }

  ngAfterContentInit() {
    this.renderer.listen(this.elem.nativeElement, "keydown", ($event) => onKeydown($event, this));

  }

  ngOnDestroy() {
    if (this.isOpen) {
      this.onShowCalendar();
    }
    this.renderer.listen(this.elem.nativeElement, "keydown", null);
  }

  onShowCalendar(event?) {
    if (this.disabled) return;
    if (event) {
      event.stopPropagation();
    }
    if (!this.isOpen) {
      this.show(event);
    } else {
      this.hide(event);
    }
  }

  show(event?) {
    if (event) {
      event.stopPropagation();
    }
    this.initCalendar();
    this.isOpen = true;
    const selectedStyles = document.querySelectorAll('.calendar-input-container');
    selectedStyles.forEach(element => {
      if (element.getAttribute('class').includes('active')) {
        this.renderer.removeClass(element, 'active');
      }
    });

    const selectedOptions = document.querySelectorAll('.calendar-ui');
    selectedOptions.forEach(element => {
      this.renderer.setStyle(element, 'display', 'none');
    });
    this.renderer.addClass(this.calendarInputContainer.nativeElement, 'active');
    this.appendOverlay();
    this.alignOverlay();
    this.renderer.setStyle(this.calendarUI.nativeElement, 'display', 'block');
  }

  hide(event?) {
    if (event) {
      event.stopPropagation();
    }
    this.isOpen = false;
    this.renderer.removeClass(this.calendarInputContainer.nativeElement, 'active');
    this.renderer.setStyle(this.calendarUI.nativeElement, 'display', 'none');
    this.restoreOverlayAppend();

  }

  appendOverlay() {
    console.log(this.appendTo);
    if (this.appendTo) {
      if (this.appendTo === 'body')
        document.body.appendChild(this.calendarUI.nativeElement);
      else
        DomHandler.appendChild(this.calendarUI, this.appendTo);
    }
    this.calendarUI.nativeElement.style.width = DomHandler.getWidth(this.containerViewChild.nativeElement) + 'px';
  }

  restoreOverlayAppend() {
    if (this.calendarUI) { 
      if(this.appendTo) {
        
        this.elem.nativeElement.appendChild(this.calendarUI.nativeElement);
      }
    }
  }

  alignOverlay() {
    if (this.calendarUI) {
      if (this.appendTo)
        DomHandler.absolutePosition(this.calendarUI.nativeElement, this.containerViewChild.nativeElement);
      else
        DomHandler.relativePosition(this.calendarUI.nativeElement, this.containerViewChild.nativeElement);
    }
  }

  onClick(indexClicked) {
    if (this.mode === 'single') {
      this.rangeIndexes[0] = this.globalIndexOffset + indexClicked;
      let fromMonthYear = this.monthsData[this.rangeIndexes[0]];

      let initDate = new Date(fromMonthYear.monthYear, fromMonthYear.month, 1);
      this.value = initDate;
      return;
    }
    if (this.rangeIndexes[0] !== null && this.rangeIndexes[1] !== null) {
      console.log("Entra a limpiar ")
      this.clearData();
    }
    if (this.rangeIndexes[0] === null) {
      this.rangeIndexes[0] = this.globalIndexOffset + indexClicked;
    } else
      if (this.rangeIndexes[1] === null) {
        this.rangeIndexes[1] = this.globalIndexOffset + indexClicked;
        this.paintRange();
        let fromMonthYear = this.monthsData[this.rangeIndexes[0]];
        let toMonthYear = this.monthsData[this.rangeIndexes[1]];
        let initDate = new Date(fromMonthYear.monthYear, fromMonthYear.month, 1);
        let endDate = new Date(toMonthYear.monthYear, toMonthYear.month + 1, 0);
        this.value = { start: initDate, end: endDate };

      } else {
        this.initRangeIndexes();
        this.initMonthsData();
        this.onClick(indexClicked);
        this.sliceDataIntoView();
      };
  };

  paintRange() {
    this.rangeIndexes.sort((a, b) => a - b);
    this.monthsData.forEach((month, index) => {
      if ((this.rangeIndexes[0] <= index) && (index <= this.rangeIndexes[1])) {
        month.isInRange = true;
      };
      if (this.rangeIndexes[0] === index) {
        month.isLowerEdge = true;
      };
      if (this.rangeIndexes[1] === index) {
        month.isUpperEdge = true;
      };
    });
  }

  emitData() {
    this.isClosing = true;
    this.updateChanges();
    this.onTouched();
    this.monthRangeSelected.emit(this.value);
    this.hide();
  };

  sliceDataIntoView() {
    this.globalIndexOffset = this.monthViewSlicesIndexes[this.currentYearIndex];
    this.monthDataSlice = this.monthsData.slice(this.globalIndexOffset, this.globalIndexOffset + 24);
  };

  incrementYear() {
    if (this.currentYearIndex !== this.years.length - 1) {
      this.currentYearIndex++
      this.sliceDataIntoView()
    };
  };

  decrementYear() {
    if (this.currentYearIndex !== 0) {
      this.currentYearIndex--;
      this.sliceDataIntoView()
    };
  };

  initRangeIndexes() {
    if (this.value) {
      this.rangeIndexes = [];
      if (this.value['start']) {
        this.rangeIndexes.push(this.monthsData.findIndex((v, i) => (v.month === (this.value['start'] as Date).getMonth() && v.monthYear === (this.value['start'] as Date).getFullYear())));
        if (this.value['end'])
          this.rangeIndexes.push(this.monthsData.findIndex((v, i) => (v.month === (this.value['end'] as Date).getMonth() && v.monthYear === (this.value['end'] as Date).getFullYear())));
        this.paintRange();
      } else {
        this.rangeIndexes.push(this.monthsData.findIndex((v, i) => (v.month === (this.value as Date).getMonth() && v.monthYear === (this.value as Date).getFullYear())));
      }
    } else
      this.rangeIndexes = [null, null];
  };

  initMonthsData() {
    this.monthsData = new Array();
    this.years.forEach(year => {
      this.months.forEach((month, i) => {
        this.monthsData.push({
          monthName: month,
          month: i,
          monthYear: year,
          isInRange: false,
          isLowerEdge: false,
          isUpperEdge: false
        })
      })
    })
  };

  initYearLabels() {
    const currentYear = (new Date()).getFullYear();
    const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step));
    this.years = range(this.firstYear ? this.firstYear : (currentYear - 5), this.lastYear ? this.lastYear : (currentYear + 5), 1)
  };

  initMonthLabels() {
    this.months = new Array(12).fill(0).map((_, i) => {
      return new Date(`${i + 1}/1`).toLocaleDateString(undefined, { month: 'short' })
    });
  };

  initViewSlices() {
    this.monthViewSlicesIndexes = [];
    this.years.forEach((year, index) => {
      if (index === 0) { this.monthViewSlicesIndexes.push(0) } else
        if (index === 1) { this.monthViewSlicesIndexes.push(6) } else
          this.monthViewSlicesIndexes.push(this.monthViewSlicesIndexes[index - 1] + 12);
    })
  }

  get valueText() {
    let text = "";
    let fromMonthYear = this.monthsData[this.rangeIndexes[0]];
    let toMonthYear = this.monthsData[this.rangeIndexes[1]];
    if (this.mode === 'single') {
      if (fromMonthYear) {
        text += `${fromMonthYear.monthName}, ${fromMonthYear.monthYear}`;
      }
    } else if (fromMonthYear && toMonthYear) {
      if (fromMonthYear.monthYear === toMonthYear.monthYear) {
        if (fromMonthYear.monthName !== toMonthYear.monthName) {
          text += `${fromMonthYear.monthName} - ${toMonthYear.monthName}, ${fromMonthYear.monthYear}`
        } else {
          text += `${fromMonthYear.monthName}, ${fromMonthYear.monthYear}`;
        }
      } else {
        text += `${fromMonthYear.monthName}, ${fromMonthYear.monthYear} - ${toMonthYear.monthName}, ${toMonthYear.monthYear}`
      }
    }
    if (text === '') {
      text = this.placeholder ? this.placeholder : "Seleccionar...";
    }
    return text;
  }

  clearData() {
    this.value = undefined;
    this.updateChanges();
    this.ngOnInit();
  }


  validate({ value }: FormControl) {
    const isNotValid = this.isRequired && this.value == undefined;
    return isNotValid && {
      invalid: true
    }
  }

  updateChanges() {
    this.onChange(this.value);
  }

  writeValue(value: any): void {
    this.value = value;
    this.updateChanges();

  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(val: boolean): void {
    this.disabled = val;
  }

  onModelTouched: Function = () => { };


  setReadOnlyState(val: boolean): void {
    this.isReadOnly = val;
  }
}


function onKeydown(event: KeyboardEvent, component?: NgxMonthPickerComponent) {
  console.log(event);
  switch (event.which) {
    //down
    case 40:
      if (!component.isOpen && event.altKey) {
        component.onShowCalendar();
        component.itemFocused = -1;
      }

      event.preventDefault();

      break;
    case 13:
      component.onShowCalendar();
      component.itemFocused = -1;

      event.preventDefault();

      break;
    case 27:
      component.hide();
      component.itemFocused = -1;

      event.preventDefault();

      break;
    case 8:
      component.clearData();
      component.itemFocused = -1;
      event.preventDefault();

      break;
  }
}