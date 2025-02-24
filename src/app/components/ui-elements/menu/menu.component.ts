import { Component } from '@angular/core';
import { AppRoutes } from '../../../constants/app-routes.enum';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuButton {
  text: string;
  url: string;
}

@Component({
  selector: '[app-menu]',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

  readonly MENU: MenuButton[] = [
    { text: 'List', url: AppRoutes.list },
    { text: 'Groups', url: AppRoutes.groups },
    { text: 'Table', url: AppRoutes.table },
    { text: 'Nested', url: AppRoutes.nested }
  ];

}
