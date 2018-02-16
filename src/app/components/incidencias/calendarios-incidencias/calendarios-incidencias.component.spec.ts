import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendariosIncidenciasComponent } from './calendarios-incidencias.component';

describe('CalendariosIncidenciasComponent', () => {
  let component: CalendariosIncidenciasComponent;
  let fixture: ComponentFixture<CalendariosIncidenciasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendariosIncidenciasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendariosIncidenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
