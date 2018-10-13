
import { fakeAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ToolsComponent } from './tools.component';

describe('ToolsComponent', () => {
  let component: ToolsComponent;
  let fixture: ComponentFixture<ToolsComponent>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSidenavModule],
      declarations: [ToolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
