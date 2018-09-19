import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLoginsClienteComponent } from './admin-logins-cliente.component';

describe('AdminLoginsClienteComponent', () => {
  let component: AdminLoginsClienteComponent;
  let fixture: ComponentFixture<AdminLoginsClienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminLoginsClienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminLoginsClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
