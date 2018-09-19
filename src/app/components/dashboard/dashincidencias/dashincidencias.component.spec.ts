import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashincidenciasComponent } from './dashincidencias.component';

describe('DashincidenciasComponent', () => {
  let component: DashincidenciasComponent;
  let fixture: ComponentFixture<DashincidenciasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashincidenciasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashincidenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
