import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanesRealizadosComponent } from './planes-realizados.component';

describe('PlanesRealizadosComponent', () => {
  let component: PlanesRealizadosComponent;
  let fixture: ComponentFixture<PlanesRealizadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanesRealizadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanesRealizadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
