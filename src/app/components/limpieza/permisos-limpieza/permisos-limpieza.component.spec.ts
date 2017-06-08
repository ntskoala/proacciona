import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermisosLimpiezaComponent } from './permisos-limpieza.component';

describe('PermisosLimpiezaComponent', () => {
  let component: PermisosLimpiezaComponent;
  let fixture: ComponentFixture<PermisosLimpiezaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermisosLimpiezaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermisosLimpiezaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
