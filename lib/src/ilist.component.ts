import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';

import { ScrollView } from 'tns-core-modules/ui/scroll-view';

import { Subscription } from 'rxjs';

import { IListItemComponent } from './ilist-item.component';
import { IListViewService } from './ilist.service';
import { IListStore } from './ilist.store';

@Component({
  selector: 'IListView',
  templateUrl: './ilist.component.html',
  styleUrls: ['./ilist.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [IListStore],
})
export class IListComponent extends ScrollView implements OnInit, AfterViewInit, OnDestroy {

  public pageList = [];
  public pageIndex = 0;

  private activeFeedSub: Subscription;

  @Input() templateRef;

  @Input() set limit(value) {
    const pageSize = (value > 0) ? value : null;
    this.ilistStore.setPageSize(pageSize);
  }

  @Input() set items(feed) {
    this.ilistStore.setFeed(feed);
    this.addItemsEmitter.emit(feed);
  }

  @Output('addItems') addItemsEmitter = new EventEmitter();
  @Output('eofItems') eofItemsEmitter = new EventEmitter();

  get activeFeed$() { return this.ilistStore.getActiveFeed$; }

  constructor(
    public ilistStore: IListStore,
    private ilistService: IListViewService,
    private changeDetectorRef: ChangeDetectorRef,
    private elementRef: ElementRef,
  ) {
    super();
  }

  ngOnInit() {
    this.ilistStore.updateCursor(0);
    this.activeFeedSub = this.ilistStore.getActiveFeed$.subscribe(feed => {
      this.pageList = feed;
      this.changeDetectorRef.detectChanges();
    });
  }

  ngAfterViewInit() { }

  ngOnDestroy() {
    this.activeFeedSub.unsubscribe();
  }

}
