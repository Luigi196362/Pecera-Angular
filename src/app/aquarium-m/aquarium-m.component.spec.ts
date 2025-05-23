import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AquariumMComponent } from './aquarium-m.component';

describe('AquariumMComponent', () => {
  let component: AquariumMComponent;
  let fixture: ComponentFixture<AquariumMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AquariumMComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AquariumMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
