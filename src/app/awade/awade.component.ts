import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CountService} from "../service/count-service";

@Component({
    selector: 'app-awade',
    template: `
        <h5>{{ title }}</h5><span>Awade component loaded!</span>
        <div>
            <j-button (click)="click()">click</j-button> <span>Click Count : {{count}}</span>
        </div>
    `,
    styles: [`
        span {
            margin-left: 5px;
        }
    `]
})
export class AwadeComponent implements OnInit {
    @Input()
    public title = 'Default';

    @Output()
    public titleChanges = new EventEmitter();

    get count(): number {
        const count = this._countService.getCount();
        return count;
    }

    constructor(private _countService: CountService) {
    }

    click() {
        console.log('AwadeComponent =====> click');
        this.titleChanges.emit('changed');
        this._countService.count();
    }

    ngOnInit() {
    }

}
