import {BrowserModule} from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {RouterModule} from "@angular/router";
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {JigsawModule} from '@rdkmaster/jigsaw';
import {AwadeLoadingService, DataBus, EventBus} from '@awade/uid-sdk';

import {AppComponent} from './app.component';
import {CountService} from "./service/count-service";
import {DynamicComponentService} from "./service/dynamic-component.service";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule, FormsModule, BrowserAnimationsModule, JigsawModule, TranslateModule.forRoot(), MatButtonModule,
        RouterModule.forRoot([])
    ],
    providers: [TranslateService, DynamicComponentService, CountService, EventBus, DataBus, AwadeLoadingService],
    bootstrap: [AppComponent],
    entryComponents: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
    constructor(translateService: TranslateService) {
        translateService.setTranslation('zh', {
            'get-started': '马上开始',
            'give-star': '给 Jigsaw 点个星星'
        });
        translateService.setTranslation('en', {
            'get-started': 'Get started',
            'give-star': 'Give us a star on Github.com'
        });

        const lang: string = translateService.getBrowserLang();
        translateService.setDefaultLang(lang);
        translateService.use(lang);
    }
}
