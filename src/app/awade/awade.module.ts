import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {JigsawButtonModule} from "@rdkmaster/jigsaw";
import {AwadeComponent} from "./awade.component";

@NgModule({
    imports: [CommonModule, JigsawButtonModule],
    declarations: [AwadeComponent],
    exports: [],
    bootstrap: [AwadeComponent]
})
export class AwadeModule {
}
