import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BocadilloComponent } from './bocadillo.component';

describe('BocadilloComponent', () => {
  let component: BocadilloComponent;
  let fixture: ComponentFixture<BocadilloComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BocadilloComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BocadilloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
