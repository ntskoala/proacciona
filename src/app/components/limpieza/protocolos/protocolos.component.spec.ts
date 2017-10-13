import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtocolosComponent } from './protocolos.component';

describe('ProtocolosComponent', () => {
  let component: ProtocolosComponent;
  let fixture: ComponentFixture<ProtocolosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtocolosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
