import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanRealizadoComponent } from './plan-realizado.component';

describe('PlanRealizadoComponent', () => {
  let component: PlanRealizadoComponent;
  let fixture: ComponentFixture<PlanRealizadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanRealizadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanRealizadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
