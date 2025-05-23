import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AquariumLComponent } from './aquarium-l.component';

describe('AquariumLComponent', () => {
  let component: AquariumLComponent;
  let fixture: ComponentFixture<AquariumLComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AquariumLComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AquariumLComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
