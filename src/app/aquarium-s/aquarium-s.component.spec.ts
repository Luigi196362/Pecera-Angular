import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AquariumSComponent } from './aquarium-s.component';

describe('AquariumSComponent', () => {
  let component: AquariumSComponent;
  let fixture: ComponentFixture<AquariumSComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AquariumSComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AquariumSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
