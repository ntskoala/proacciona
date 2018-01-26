import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BotonIncidenciaComponent } from './boton-incidencia.component';

describe('BotonIncidenciaComponent', () => {
  let component: BotonIncidenciaComponent;
  let fixture: ComponentFixture<BotonIncidenciaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BotonIncidenciaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BotonIncidenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
