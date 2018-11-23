import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlergenosTablaComponent } from './alergenos-tabla.component';

describe('AlergenosTablaComponent', () => {
  let component: AlergenosTablaComponent;
  let fixture: ComponentFixture<AlergenosTablaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlergenosTablaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlergenosTablaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
