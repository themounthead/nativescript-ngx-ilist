# Nativescript-Ngx-IList

A Nativescript Angular UI Control that simulates the List View with
added benefits

## Why

The existing NativeScript ListView control works great when you define the
ListItem Template and associate it to an Angular Component. 

But what if you wish to have the benefits of the ListView and couple with
Angular's *ngFor loop and not compromise on the performance. That's where this
control helps.

## How

The IListView control essentially takes a collection of items and loads only a
specifed limit from the list; and its loads the item only when it appears in the
device view port. 

For instance, consider a collection of 1000 items. If you were to load all of them at once, by
instantiating them in an Angular ngFor loop, it would be terribly slow. The
IListView control takes the list by renders the items incrementally, as you scroll; thereby ensuring performance and a better user experience.

## Setup

`npm install nativescript-ngx-ilist --save`

Import the module into your _app-module_ 

```
import { IListViewModule } from 'nativescript-ngx-ilist';

```

## Getting Started

Similar to the ListView, you need to define the ListItem template, as shown
below.

```
<IListView
    limit="30"
    [items]="items"
    [templateRef]="templateRef"
    (eofItems)="addMore()"
  >
    <ng-template #templateRef let-item="item" let-index="index">
      <IListItem>
        <IListContent>
        <!-- You content goes here -->
        </IListContent>
        <IListDivider>
        <!-- Use this as an item separator -->
        </IListDivider>
        <IListPlaceholder>
        <!-- The wireframe/skeleton placeholder before content load -->
        </IListPlaceholder>
      </IListItem>
    </ng-template>
  </IListView>
```

- The IListContent is where you would insert your item content, possibly an Angular Component
- The IListDivider is simply a spacer tag for the items, like a horizontal line
- The IListPlaceholder is the skeleton for your item before it gets instantiated

### Options

The IListView accepts __limit__ as an argument which is default to 30.

It emits a value with the __eofItems__ emitter when the list has reaches the end, for async loading more data to the list.

### IListViewService

The IListService can be used to add more items to the list with the method
__addItems()__


# Examples

Provided in the demo app



