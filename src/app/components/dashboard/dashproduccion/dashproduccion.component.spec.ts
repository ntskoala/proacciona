import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashproduccionComponent } from './dashproduccion.component';

describe('DashproduccionComponent', () => {
  let component: DashproduccionComponent;
  let fixture: ComponentFixture<DashproduccionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashproduccionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashproduccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
