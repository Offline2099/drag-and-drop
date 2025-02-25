import { Component, HostBinding } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from './components/ui-elements/menu/menu.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  @HostBinding('class.allow-touch-screen') isTouchScreenAllowed: boolean = false;

  allowTouchScreen(): void {
    this.isTouchScreenAllowed = true;
  }

}
