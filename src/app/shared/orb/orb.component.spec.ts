import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrbComponent } from './orb.component';

describe('OrbComponent', () => {
  let component: OrbComponent;
  let fixture: ComponentFixture<OrbComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrbComponent]
    });
    fixture = TestBed.createComponent(OrbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
