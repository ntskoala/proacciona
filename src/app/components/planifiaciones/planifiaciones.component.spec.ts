import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanifiacionesComponent } from './planifiaciones.component';

describe('PlanifiacionesComponent', () => {
  let component: PlanifiacionesComponent;
  let fixture: ComponentFixture<PlanifiacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanifiacionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanifiacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
