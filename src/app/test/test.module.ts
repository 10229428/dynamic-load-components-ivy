import {NgModule} from "@angular/core";
import {TestComponent} from "./test.component";

@NgModule({
    imports: [],
    declarations: [TestComponent],
    exports: [],
    bootstrap: [TestComponent]
})
export class TestModule {
    constructor() {
        console.log("TestModule =====> loaded!");
    }
}
