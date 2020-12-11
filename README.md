# NgxMonthPicker

Esta libreria fue generada con [Angular CLI](https://github.com/angular/angular-cli) version 8.2.9.

## Instalación

Ejecutar `npm i --save ngx-month-picker` para instalar la dependencia en tu proyecto.

## Uso

Para hacer uso de la libreria debes importarla en tu `app.module.ts` como en el ejemplo:

```ts 
    import {NgxMonthPickerModule} from 'ngx-month-picker';
    ...
    imports: [
        ...
        NgxMonthPickerModule
        ...
    ],
```

Una vez importado, para usarlo en tu componente puedes usar el siguiente ejemplo: 

```html
    <ngx-month-picker 
        mode="single|range" 
        [(ngModel)]="value" 
        [firstYear]="2010" 
    ></ngx-month-picker>
```

Las propiedades del componente son:

| Propiedad   |      Tipo      |      Descripción      |
|:----------|:-------------:|:-------------|
| placeholder | string | Por defecto es "Seleccionar..." |
| required | boolean | Por defecto false |
| disabled | boolean | Por defecto false |
| readonly | boolean | Por defecto false |
| mode | string (single/range) | Por defecto "single" |
| firstYear | number | Por defecto año en curso - 5 |
| lastYear | number | Por defecto año en curso + 5 |

Se puede personalizar, para ello es necesario asignar la clase para cada parte del componente

| Propiedad   |      Descripción      |
|:----------|:-------------|
| inputContainerClass | Clase para el contenedor del valor actual (div) |
| inputValueClass | Clase para el span donde se muestra el valor actual |
| monthItemClass | Clase para cada mes |
| edgeClass | Clase para un mes en el borde del rango |
| inRangeClass | Clase para un mes que esta dentro del rango |
| notYearClass | Clase para los meses que no están dentro del año en curso |
| lowerEdgeClass | Clase para el mes inicial del rango |
| upperEdgeClass | Clase para el mes final del rango |
| cleanBtnClass | Clase para el botón para limpiar los valores actuales |
| acceptBtnClass | Clase para el botón que cierra el calendario y emite el valor actual |



## Github

Puedes consultar el código en el repositorio de [Github](https://github.com/jmenesesi/ngx-month-picker).