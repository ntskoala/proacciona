import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformesExcelComponent } from './informes-excel.component';

describe('InformesExcelComponent', () => {
  let component: InformesExcelComponent;
  let fixture: ComponentFixture<InformesExcelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformesExcelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformesExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
