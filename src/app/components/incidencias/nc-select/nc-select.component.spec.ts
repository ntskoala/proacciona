import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NcSelectComponent } from './nc-select.component';

describe('NcSelectComponent', () => {
  let component: NcSelectComponent;
  let fixture: ComponentFixture<NcSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NcSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NcSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
