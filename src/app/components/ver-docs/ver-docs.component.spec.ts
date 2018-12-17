import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerDocsComponent } from './ver-docs.component';

describe('VerDocsComponent', () => {
  let component: VerDocsComponent;
  let fixture: ComponentFixture<VerDocsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerDocsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
