import { AfterContentInit, AfterViewInit, ChangeDetectorRef, ContentChild, Directive, ElementRef, Inject, OnDestroy, OnInit, ViewChild, forwardRef } from '@angular/core';

import { screen } from 'tns-core-modules/platform';
import { View } from 'tns-core-modules/ui';
import { TouchGestureEventData } from 'tns-core-modules/ui/gestures';
import { StackLayout } from 'tns-core-modules/ui/layouts';
import { ScrollEventData, ScrollView } from 'tns-core-modules/ui/scroll-view';

import { BehaviorSubject, Observable, Subscription, bindCallback, combineLatest, interval } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, filter, map, take, tap, throttleTime, withLatestFrom } from 'rxjs/operators';

import { IListItemComponent } from './ilist-item.component';
import { IListComponent } from './ilist.component';
import { IListService } from './ilist.service';

@Directive({
  selector: 'IListView',
})
export class IListComponentDirective implements OnInit, AfterViewInit, OnDestroy {

  private watchScrollEventSub: Subscription;
  private watchFeedSub: Subscription;

  private _scrollViewReadySubject = new BehaviorSubject(false);
  private _scrollViewReady$ = this._scrollViewReadySubject.asObservable();
  private _scrollViewHeight: number;

  private SCROLL_FACTOR;

  constructor(
    @Inject(forwardRef(() => IListComponent)) private ilistComponent: IListComponent,
    @Inject(forwardRef(() => IListService)) private ilistService: IListService,
    @Inject(forwardRef(() => ElementRef)) private scrollView: ElementRef,
  ) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.initScrollView();
  }

  ngOnDestroy() {
    this.watchScrollEventSub.unsubscribe();
    this.watchFeedSub.unsubscribe();
  }

  public getStore() { return this.ilistComponent.ilistStore; }

  public getScrollView(): ScrollView { return this.scrollView.nativeElement; }

  public calcScrollViewHeight() {
    const height = this.getScrollView().height;
    const calcHeight = (height === 'auto') || height['unit']
      ? this.getScrollView().getActualSize().height as number
      : height as number;
    this.getScrollView().height = calcHeight;
    this._scrollViewHeight = calcHeight;
    this.SCROLL_FACTOR = 0.8 * calcHeight;
    this._scrollViewReadySubject.next(true);
    return calcHeight;
  }

  public getScrollViewHeight(): number { return this._scrollViewHeight; }

  public isScrollViewReady$() { return this._scrollViewReady$; }

  public initScrollView() {

    const watchScrollViewLoadEvent = Observable.create(subscriber => {
      this.scrollView.nativeElement.on('loaded', (e) => subscriber.next(e));
    });

    watchScrollViewLoadEvent
      .pipe(
        delay(100),
        take(1),
      )
      .subscribe(e => {
        this.watchScroll();
        this.watchFeedService();
      });

  }

  private resetScrollPosition() {
    const scrollView = this.getScrollView();
    scrollView.scrollToVerticalOffset(scrollView.scrollableHeight - 25, true);
  }

  private watchScroll() {

    const scrollView = this.getScrollView();

    if (!scrollView) { throw Error('Failed to initialize Scroll View Container'); }

    this.calcScrollViewHeight();

    const watchScrollViewScrollEvent: Observable<number> = Observable.create(subscriber => {
      scrollView.on('scroll', (e: ScrollEventData) => subscriber.next(Math.floor(e.scrollY)));
    });

    this.watchScrollEventSub = watchScrollViewScrollEvent
      .pipe(
        throttleTime(100),
        tap(offset => offset + this.SCROLL_FACTOR > scrollView.scrollableHeight ? this.ilistComponent.eofItemsEmitter.emit(offset) : null),
        filter(offset => scrollView.scrollableHeight - offset < this.SCROLL_FACTOR),
        withLatestFrom(this.getStore().getFeed$, this.getStore().getCursorIndex$),
        filter(([offset, feed, index]) => feed.length > index * this.getStore().getPageSize()),
        distinctUntilChanged(),
      )
      .subscribe(e => {
        const index = ++this.ilistComponent.pageIndex;
        this.ilistComponent.ilistStore.updateCursor(index);
      });

  }

  private watchFeedService() {
    this.watchFeedSub = this.ilistService.watchFeed$()
      .pipe(
        withLatestFrom(this.getStore().getFeed$),
      )
      .subscribe(([newFeed, currentFeed]) => {
        const feed = <[]>currentFeed.concat(newFeed);
        this.getStore().setFeed(feed);
        this.resetScrollPosition();
        this.ilistComponent.addItemsEmitter.emit(feed);
      });
  }

}

@Directive({
  selector: '[ilist-item]',
})
export class IListItemComponentDirective implements OnInit, AfterViewInit, OnDestroy {

  private watchScrollEventSub: Subscription;

  @ContentChild('panelHandle', { read: ElementRef, static: false }) panelHandle: ElementRef;

  constructor(
    @Inject(forwardRef(() => IListComponent)) private ilistComponent: IListComponent,
    @Inject(forwardRef(() => IListComponentDirective)) private ilistComponentDirective: IListComponentDirective,
    @Inject(forwardRef(() => IListItemComponent)) private ilistItemComponent: IListItemComponent,
    @Inject(forwardRef(() => IListService)) private ilistService: IListService,
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.setupItem();
  }

  ngOnDestroy() {
    this.watchScrollEventSub.unsubscribe();
  }

  private getPanelHandleView(): StackLayout {
    if (!this.panelHandle) { return; }
    return this.panelHandle.nativeElement;
  }

  private getRootLayout(): StackLayout {
    if (!this.elementRef) { return; }
    return this.elementRef.nativeElement;
  }

  private getScrollView(): ScrollView {
    return this.ilistComponentDirective.getScrollView();
  }

  private setupItem() {

    const watchItemLoadedEvent$: Observable<View> = Observable.create(subscriber => {
      this.getRootLayout().on('loaded', (e) => subscriber.next((e.object)));
    });

    const itemPosition$ = watchItemLoadedEvent$
      .pipe(
        delay(100),
        map(o => o.getLocationOnScreen().y),
      );

    this.ilistComponentDirective.isScrollViewReady$()
      .pipe(
        filter(isReady => isReady),
        withLatestFrom(itemPosition$),
        filter(([isReady, posY]) => posY <  2.5 * this.ilistComponentDirective.getScrollViewHeight()),
        take(1),
      )
      .subscribe(() => {
        this.activateItem();
      });

    const watchScrollViewScrollEvent: Observable<number> = Observable.create(subscriber => {
      this.getScrollView().on('scroll', (e: ScrollEventData) => subscriber.next(Math.floor(e.scrollY)));
    });

    this.watchScrollEventSub = watchScrollViewScrollEvent
      .pipe(
        throttleTime(100),
        debounceTime(50),
        map(() => this.getPanelHandleView().getLocationOnScreen().y),
        filter(posY => posY > -100 && posY < 1.5 * this.ilistComponentDirective.getScrollViewHeight()),
        filter(() => this.ilistItemComponent._isActive === false),
      )
      .subscribe(() => {
        this.activateItem();
      });

  }

  private activateItem() {
    this.ilistItemComponent._isActive = true;
    this.ilistItemComponent.isActive.emit(true);
    this.changeDetectorRef.detectChanges();
  }

}
