import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvocatoriasFormacionComponent } from './convocatorias-formacion.component';

describe('ConvocatoriasFormacionComponent', () => {
  let component: ConvocatoriasFormacionComponent;
  let fixture: ComponentFixture<ConvocatoriasFormacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConvocatoriasFormacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvocatoriasFormacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
