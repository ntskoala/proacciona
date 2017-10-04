import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosCuadroComponent } from './productos-cuadro.component';

describe('ProductosCuadroComponent', () => {
  let component: ProductosCuadroComponent;
  let fixture: ComponentFixture<ProductosCuadroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductosCuadroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductosCuadroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
