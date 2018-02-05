import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionIncidenciaComponent } from './gestion-incidencia.component';

describe('GestionIncidenciaComponent', () => {
  let component: GestionIncidenciaComponent;
  let fixture: ComponentFixture<GestionIncidenciaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionIncidenciaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionIncidenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
