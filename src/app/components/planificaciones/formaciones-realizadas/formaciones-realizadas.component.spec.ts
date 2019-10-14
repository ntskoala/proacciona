import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormacionesRealizadasComponent } from './formaciones-realizadas.component';

describe('FormacionesRealizadasComponent', () => {
  let component: FormacionesRealizadasComponent;
  let fixture: ComponentFixture<FormacionesRealizadasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormacionesRealizadasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormacionesRealizadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
