import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtocolosCuadroComponent } from './protocolos-cuadro.component';

describe('ProtocolosCuadroComponent', () => {
  let component: ProtocolosCuadroComponent;
  let fixture: ComponentFixture<ProtocolosCuadroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtocolosCuadroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolosCuadroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
