import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformesControlComponent } from './informes-control.component';

describe('InformesControlComponent', () => {
  let component: InformesControlComponent;
  let fixture: ComponentFixture<InformesControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformesControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformesControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
