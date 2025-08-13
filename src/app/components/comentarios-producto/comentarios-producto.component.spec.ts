import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComentariosProductoComponent } from './comentarios-producto.component';
import { FormsModule } from '@angular/forms';

describe('ComentariosProductoComponent', () => {
  let component: ComentariosProductoComponent;
  let fixture: ComponentFixture<ComentariosProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComentariosProductoComponent ],
      imports: [ FormsModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComentariosProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
