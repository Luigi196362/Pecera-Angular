import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoAquariumComponent } from './info-aquarium.component';

describe('InfoAquariumComponent', () => {
  let component: InfoAquariumComponent;
  let fixture: ComponentFixture<InfoAquariumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoAquariumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoAquariumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
