import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminIncidenciasClienteComponent } from './admin-incidencias-cliente.component';

describe('AdminIncidenciasClienteComponent', () => {
  let component: AdminIncidenciasClienteComponent;
  let fixture: ComponentFixture<AdminIncidenciasClienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminIncidenciasClienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminIncidenciasClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
