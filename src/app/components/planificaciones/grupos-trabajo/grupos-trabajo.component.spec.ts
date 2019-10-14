import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GruposTrabajoComponent } from './grupos-trabajo.component';

describe('GruposTrabajoComponent', () => {
  let component: GruposTrabajoComponent;
  let fixture: ComponentFixture<GruposTrabajoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GruposTrabajoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GruposTrabajoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
