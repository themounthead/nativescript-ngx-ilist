import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';

import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { registerElement } from 'nativescript-angular/element-registry';

import { FlexboxLayout, StackLayout } from 'tns-core-modules/ui/layouts';
import { ScrollView } from 'tns-core-modules/ui/scroll-view';

import { IListItemComponent } from './ilist-item.component';
import { IListComponent } from './ilist.component';
import { IListComponentDirective, IListItemComponentDirective } from './ilist.directives';

registerElement('IListView', () => ScrollView);

const COMPONENTS = [
  IListComponent,
  IListItemComponent,
];
const CONTAINERS = [];
const DIRECTIVES = [
  IListComponentDirective,
  IListItemComponentDirective,
];

@NgModule({
  imports: [
    CommonModule,
    NativeScriptCommonModule,
  ],
  providers: [],
  declarations: [
    ...COMPONENTS,
    ...DIRECTIVES,
  ],
  exports: [
    ...COMPONENTS,
    ...DIRECTIVES,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class IListViewModule { }
