import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FooComponent} from "./foo.component";
import {JigsawButtonModule} from "@rdkmaster/jigsaw";

@NgModule({
    imports: [CommonModule, JigsawButtonModule],
    declarations: [FooComponent],
    exports: [],
    bootstrap: [FooComponent]
})
export class FooModule {
    readonly FooComponent = FooComponent;
}
