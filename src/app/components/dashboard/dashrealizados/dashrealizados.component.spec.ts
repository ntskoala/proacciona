import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashrealizadosComponent } from './dashrealizados.component';

describe('DashrealizadosComponent', () => {
  let component: DashrealizadosComponent;
  let fixture: ComponentFixture<DashrealizadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashrealizadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashrealizadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
