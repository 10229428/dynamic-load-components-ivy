import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {JigsawModule, TranslateHelper} from "@rdkmaster/jigsaw";
import {AppComponent} from "./AppComponent";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {EventBus} from "../service/event-bus";
import {DataBus} from "../service/data-bus";
import {DialogComponent} from "./DialogComponent";
import {RepeatComponent} from "./RepeatComponent";
import {FloatComponent} from "./FloatComponent";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {RouterModule} from "@angular/router";
import {AwadeRepeatModule} from "./awade-repeat";

@NgModule({
    imports: [
        CommonModule, JigsawModule, PerfectScrollbarModule, HttpClientModule, AwadeRepeatModule,
        TranslateModule.forRoot(),
        RouterModule.forChild([])
    ],
    declarations: [AppComponent, DialogComponent, RepeatComponent, FloatComponent],
    exports: [],
    entryComponents: [AppComponent, DialogComponent, RepeatComponent, FloatComponent],
    bootstrap: [AppComponent],
    providers: [EventBus, DataBus, TranslateService]
})
export class DynamicRuntimeModule {
    constructor(public translateService: TranslateService, public dataBus: DataBus, private http: HttpClient) {
        const i18n = {
            field: ["field", "zh", "en"],
            header: ["字段", "中文", "英文"],
            data: [["field", "字段", "Field"]],
            localeService: ''
        };
        if (i18n && i18n.data) {
            const i18nZhSetter = {};
            const i18nEnSetter = {};
            i18n.data.forEach(row => {
                const prop = row[0].replace(/(['"])/g, '\\$1');
                i18nZhSetter[prop] = row[1];
                i18nEnSetter[prop] = row[2];
            });
            translateService.setTranslation('zh', i18nZhSetter, true);
            translateService.setTranslation('en', i18nEnSetter, true);

            const language = 'en'; // ch
            TranslateHelper.changeLanguage(this.translateService, language);
            this.dataBus.i18n = {};
            i18n.data.forEach(row => {
                const prop = row[0].replace(/(['"])/g, '\\$1');
                this.dataBus.i18n[prop] = this.translateService.instant(prop);
            });
            TranslateHelper.languageChangEvent.subscribe((langInfo: { oldLang: string, curLang: string }) => {
                i18n.data.forEach(row => {
                    const prop = row[0].replace(/(['"])/g, '\\$1');
                    this.dataBus.i18n[prop] = this.translateService.instant(prop);
                });
            });
            console.log('DynamicRuntimeModule.constructor =====> i18n: ', this.dataBus.i18n);
        }
    }
}
