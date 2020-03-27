import {AwadeRepeatItem, RepeatViewBase} from "./awade-repeat-item";
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {AwadeRepeatComponent} from "./awade-repeat";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";

@NgModule({
    imports: [
        CommonModule, PerfectScrollbarModule
    ],
    declarations: [AwadeRepeatComponent, AwadeRepeatItem],
    exports: [AwadeRepeatComponent, AwadeRepeatItem],
    entryComponents: [AwadeRepeatComponent, AwadeRepeatItem],
    providers: [RepeatViewBase]
})
export class AwadeRepeatModule {
}
