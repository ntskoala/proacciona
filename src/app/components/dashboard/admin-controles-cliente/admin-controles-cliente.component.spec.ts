import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminControlesClienteComponent } from './admin-controles-cliente.component';

describe('AdminControlesClienteComponent', () => {
  let component: AdminControlesClienteComponent;
  let fixture: ComponentFixture<AdminControlesClienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminControlesClienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminControlesClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
