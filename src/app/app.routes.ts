import { Routes } from '@angular/router';
import { AppRoutes } from './constants/app-routes.enum';
import { ListDemoComponent } from './components/pages/01-list-demo/list-demo.component';
import { GroupsDemoComponent } from './components/pages/02-groups-demo/groups-demo.component';
import { TableDemoComponent } from './components/pages/03-table-demo/table-demo.component';
import { NestedDemoComponent } from './components/pages/04-nested-demo/nested-demo.component';

export const routes: Routes = [
  { path: AppRoutes.list, component: ListDemoComponent },
  { path: AppRoutes.groups, component: GroupsDemoComponent },
  { path: AppRoutes.table, component: TableDemoComponent },
  { path: AppRoutes.nested, component: NestedDemoComponent },
  { path: '', redirectTo: `/${AppRoutes.list}`, pathMatch: 'full' }
];
