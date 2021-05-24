import { Component } from '@angular/core';

import { IListService } from 'nativescript-ngx-ilist';

import { clamp, times } from 'ramda';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {

  title = 'nativescript-ngx-ilist';

  public items = times(() => ({ h: clamp(50, 300, Math.floor(Math.random() * 300)) }), 100);

  constructor(
    private ilistService: IListService,
  ) { }

  public isActive(args) { console.log(args); }

  public addMore() {
    const list = times(() => ({ h: clamp(50, 300, Math.floor(Math.random() * 300)) }), 100);
    this.ilistService.addItems(list);
  }

}
