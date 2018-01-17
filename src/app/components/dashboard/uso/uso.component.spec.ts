import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsoComponent } from './uso.component';

describe('UsoComponent', () => {
  let component: UsoComponent;
  let fixture: ComponentFixture<UsoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
