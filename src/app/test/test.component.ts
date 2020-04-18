import {Component} from '@angular/core';

@Component({
    selector: 'app-test',
    template: `
        <h4>Test component loaded!</h4>
    `
})
export class TestComponent {
    constructor() {
        console.log('TestComponent =====> loaded!');
    }
}
