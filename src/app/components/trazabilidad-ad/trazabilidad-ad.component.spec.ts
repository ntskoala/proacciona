import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrazabilidadAdComponent } from './trazabilidad-ad.component';

describe('TrazabilidadAdComponent', () => {
  let component: TrazabilidadAdComponent;
  let fixture: ComponentFixture<TrazabilidadAdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrazabilidadAdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrazabilidadAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
