import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IListService {

  private feedSubject = new Subject<[]>();

  public watchFeed$() { return this.feedSubject.asObservable(); }

  public addItems(feed: []) {
    this.feedSubject.next(feed);
  }

}
