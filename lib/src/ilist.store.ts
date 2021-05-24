import { Injectable } from '@angular/core';

import { ComponentStore } from '@ngrx/component-store';

import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, tap, withLatestFrom } from 'rxjs/operators';

const PAGE_SIZE = 25;

export interface IIListState {
  feed: [];
  activeFeed: [];
  cursorFeed: [];
  cursorIndex: number;
}

export const DEFAULT_STATE: IIListState = {
  feed: [],
  activeFeed: [],
  cursorFeed: [],
  cursorIndex: undefined,
};

@Injectable()
export class IListStore extends ComponentStore<IIListState> {

  private pageSize;

  constructor() {
    super(DEFAULT_STATE);
  }

  readonly getFeed$ = this.select(state => state.feed);
  readonly setFeed = this.updater((state: IIListState, feed: []) => ({ ...state, feed }));

  readonly getActiveFeed$ = this.select(state => state.activeFeed);
  readonly setActiveFeed = this.updater((state: IIListState, activeFeed: []) => ({ ...state, activeFeed }));

  readonly getCursorFeed$ = this.select(state => state.cursorFeed);
  readonly setCursorFeed = this.updater((state: IIListState, cursorFeed: []) => ({ ...state, cursorFeed }));

  readonly getCursorIndex$ = this.select(state => state.cursorIndex);
  readonly setCursorIndex = this.updater((state: IIListState, cursorIndex: number) => ({ ...state, cursorIndex }));

  readonly updateCursor = this.effect((cursorIndex$: Observable<number>) => {
    cursorIndex$
      .pipe(
        distinctUntilChanged(),
        withLatestFrom(this.getFeed$, this.getActiveFeed$),
        filter(([index, feed, activeFeed]) => feed.length > index * this.getPageSize()),
      )
      .subscribe(([index, feed, activeFeed]) => {
        const pageSize = this.getPageSize();
        const fromIndex = index * pageSize;
        const toIndex = (index + 1) * pageSize;
        const cursorFeed = <[]>feed.slice(fromIndex, toIndex);
        const activeCursorFeed = <[]>activeFeed.concat(cursorFeed);
        this.setCursorIndex(++index);
        this.setCursorFeed(cursorFeed);
        this.setActiveFeed(activeCursorFeed);
      });
    return cursorIndex$;
  });

  getPageSize(): number { return this.pageSize || PAGE_SIZE; }
  setPageSize(limit) { this.pageSize = limit; }

}
