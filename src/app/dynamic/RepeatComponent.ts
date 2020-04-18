import {ChangeDetectorRef, Component, NgZone, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {JigsawIcon} from '@rdkmaster/jigsaw';
import {DataBus, EventBus, RepeatViewBase} from '@awade/uid-sdk';

@Component({
    template: `
        <div #moduleRoot agent="5f37e2d7-c6e5-4a99-b0bc-06f8a3b84bd5" class="moduleRoot_class" [style.width]="'80PX'"
             [style.height]="'64PX'">
            <div #root agent="1b108879-653f-4a75-b2bc-df400329a55b" class="root_class awade-layout"
                 style='overflow: hidden;height:100%; padding-bottom: 8px;  padding-right: 8px; '>
                <div style="display:flex; flex-direction:column; width:72px; height:100%; flex-shrink: 0;">
                    <div style="min-height:8px; max-height:8px;"></div>
                    <div style="display:flex; flex-direction:row; width:100%; height:48px; flex-shrink: 0;">
                        <div style="min-width:8px; max-width:8px;"></div>
                        <div style="width:64px; height:48px; flex-shrink: 0;;display:flex;justify-content:center;align-items:center">
                            <jigsaw-icon [icon]="jigsawIcon25_icon" [text]="jigsawIcon25_text" #jigsawIcon25
                                         agent="b9137676-1a86-4832-a395-af18510695ea" class="jigsawIcon25_class" width="100%" height="100%"
                                         style="display: flex; align-items: inherit; justify-content: inherit;"></jigsaw-icon>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`

        .moduleRoot_class {
            width: 80PX;
            height: 64PX;

        }

        .jigsawIcon25_class {

            border-color: #ccc;
            border-width: 1px;
            border-radius: 3px;
            border-style: solid;
        }

    `]
})
export class RepeatComponent extends RepeatViewBase {
    // 存放所有订阅事件
    private _subscribers: any[] = [];

    constructor(private http: HttpClient,
                private zone: NgZone,
                public eventBus: EventBus,
                public dataBus: DataBus,
                public translateService: TranslateService,
                public cdr: ChangeDetectorRef) {
        super();


    }

    public get i18n() {
        return this.dataBus.i18n;
    }

    private _internalVariable: any = {};


    private _moduleRoot: any;
    @ViewChild('moduleRoot', {static: false})
    get moduleRoot(): any {
        return this._moduleRoot;
    }

    set moduleRoot(value: any) {
        if (!value || value === this._moduleRoot) {
            return;
        }
        this._moduleRoot = value;

    }


    private _root: any;
    @ViewChild('root', {static: false})
    get root(): any {
        return this._root;
    }

    set root(value: any) {
        if (!value || value === this._root) {
            return;
        }
        this._root = value;

    }


    private _jigsawIcon25: JigsawIcon;
    @ViewChild('jigsawIcon25', {static: false})
    get jigsawIcon25(): JigsawIcon {
        return this._jigsawIcon25;
    }

    set jigsawIcon25(value: JigsawIcon) {
        if (!value || value === this._jigsawIcon25) {
            return;
        }
        this._jigsawIcon25 = value;

    }


    public jigsawIcon25_icon: any;
    public jigsawIcon25_text: string;


    async _onInitActions() {
        // onInitActions加个空的await用于消除和旧版本promise的差异
        await (async () => {
        })();

    }

    _afterViewInitActions() {

    }

    _onDestroyActions() {

    }

    ngOnInit() {

        this.eventBus.emit('RepeatComponent_onInit');

        try {
            this.jigsawIcon25_icon = "iconfont iconfont-e91d";
        } catch (e) {
        }


        try {
            this.jigsawIcon25_text = '图标' + this.it;
        } catch (e) {
        }

        this._onInitActions();

    }

    ngAfterViewInit() {
        this.eventBus.emit('RepeatComponent_afterViewInit');

        this._afterViewInitActions();

    }

    ngOnDestroy() {

        this._onDestroyActions();
        this._subscribers.forEach(subscriber => {
            subscriber.unsubscribe();
        });
    }
}

;var __uid_ts_1585189853921
