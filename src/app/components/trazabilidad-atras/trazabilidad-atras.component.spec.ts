import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrazabilidadAtrasComponent } from './trazabilidad-atras.component';

describe('TrazabilidadAtrasComponent', () => {
  let component: TrazabilidadAtrasComponent;
  let fixture: ComponentFixture<TrazabilidadAtrasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrazabilidadAtrasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrazabilidadAtrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
