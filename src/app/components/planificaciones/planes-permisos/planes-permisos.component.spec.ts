import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanesPermisosComponent } from './planes-permisos.component';

describe('PlanesPermisosComponent', () => {
  let component: PlanesPermisosComponent;
  let fixture: ComponentFixture<PlanesPermisosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanesPermisosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanesPermisosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
