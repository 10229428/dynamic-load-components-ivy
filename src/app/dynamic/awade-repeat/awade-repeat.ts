import {Component, Input, Type} from "@angular/core";
import {RepeatViewBase} from "./awade-repeat-item";

@Component({
    selector: 'awade-repeat',
    template: `
        <div style="overflow: auto;display: flex; height: 100%; width: 100%; "
             [style.flex-direction]="direction" [style.flex-wrap]="wrap"
             [perfectScrollbar]="{wheelSpeed: 0.5, wheelPropagation: true}">
            <awade-repeat-item *ngFor="let item of data;
                                       let index= index;
                                       let odd = odd;
                                       let even =even;
                                       let first =first;
                                       let last = last"
                               [data]="item" [index]="index" [iterateWith]="iterateWith" [odd]="odd"
                               [even]="even" [first]="first" [last]="last" [collection]="data">
            </awade-repeat-item>
        </div>     `
})
export class AwadeRepeatComponent {
    @Input()
    public iterateWith: Type<RepeatViewBase>;

    private _data: any;

    @Input()
    public get data(): any {
        return this._data;
    }

    public set data(value: any) {
        if (value === this._data) {
            return;
        }
        this._data = value;
    }

    @Input()
    public tileDirection: "horizontal" | "vertical" = "horizontal";

    @Input()
    public growDirection: "horizontal" | "vertical" = "vertical";

    public get direction() {
        return this.tileDirection == "vertical" ? "column" : "row";
    }

    public get wrap() {
        return this.tileDirection == this.growDirection ? "nowrap" : "wrap";
    }

}







