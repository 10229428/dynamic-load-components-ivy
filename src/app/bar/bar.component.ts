import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CountService} from "../service/count-service";

@Component({
    selector: 'app-bar',
    template: `
        <h5>{{ title }}</h5><span>Foo component loaded!</span>
        <div>
            <j-button (click)="click()">click</j-button>
            <span>Click Count : {{count}}</span>
            <button mat-raised-button color="primary" style="margin-left: 30px;">Primary</button>
        </div>
    `,
    styles: [`
        span {
            margin-left: 5px;
        }
    `]
})
export class BarComponent implements OnInit, AfterViewInit {
    @Input()
    public title = 'Default';

    @Output()
    public titleChanges = new EventEmitter();

    get count(): number {
        const count = this._countService.getCount();
        console.log('BarComponent =====> get count: ', count);
        return count;
    }

    constructor(private _countService: CountService) {
    }

    click() {
        console.log('BarComponent =====> click');
        this.titleChanges.emit('changed');
        this._countService.count();
    }

    ngOnInit() {
        console.log('BarComponent =====> ngOnInit');
    }

    ngAfterViewInit(): void {
        console.log(`BarComponent =====> ngAfterViewInit`);
    }
}
