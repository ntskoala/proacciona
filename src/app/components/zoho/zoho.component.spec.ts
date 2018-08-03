import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZohoComponent } from './zoho.component';

describe('ZohoComponent', () => {
  let component: ZohoComponent;
  let fixture: ComponentFixture<ZohoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZohoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZohoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
