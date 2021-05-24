import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { IListItemView } from './ilist';

@Component({
  selector: 'IListItem',
  templateUrl: './ilist-item.component.html',
  styleUrls: ['./ilist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IListItemComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() index;
  @Input() _isActive = false;

  @Output() isActive = new EventEmitter();

  ngOnInit() { }

  ngAfterViewInit() { }

  ngOnDestroy() { }

}
