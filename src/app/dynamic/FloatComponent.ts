import {ChangeDetectorRef, Component, NgZone, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Location} from '@angular/common';
import {JigsawListLite, TableData} from '@rdkmaster/jigsaw';
import {DataBus} from "../service/data-bus";
import {EventBus} from "../service/event-bus";

@Component({
    template: `
        <div #moduleRoot agent="0e573530-f022-4872-a66d-a418267bae29" class="moduleRoot_class" [style.width]="'160PX'"
             [style.height]="'240PX'">
            <div #root agent="d68bc97f-b461-43f0-8f37-62a9415dd52e" [perfectScrollbar]='{"wheelSpeed":0.5,"wheelPropagation":true}'
                 class="root_class awade-layout" style='overflow: hidden;height:100%;'>
                <div [perfectScrollbar]='{"wheelSpeed":0.5,"wheelPropagation":true}'
                     style="width:160px; height:100%; flex-shrink: 0;;display:flex;justify-content:flex-start;align-items:center">
                    <jigsaw-list-lite [data]="jigsawListLite24_data" #jigsawListLite24 agent="cecbac2c-6843-410e-97ba-2d9e70b76fae"
                                      class="jigsawListLite24_class" [width]="'100%'"></jigsaw-list-lite>
                </div>
            </div>
        </div>
    `,
    styles: [`

        .moduleRoot_class {
            width: 160PX;
            height: 240PX;

        }

    `]
})
export class FloatComponent {
    // 存放所有订阅事件
    private _subscribers: any[] = [];

    constructor(private route: ActivatedRoute,
                private router: Router,
                private location: Location,
                private http: HttpClient,
                private zone: NgZone,
                public eventBus: EventBus,
                public dataBus: DataBus,
                public translateService: TranslateService,
                public cdr: ChangeDetectorRef) {


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


    private _jigsawListLite24: JigsawListLite;
    @ViewChild('jigsawListLite24', {static: false})
    get jigsawListLite24(): JigsawListLite {
        return this._jigsawListLite24;
    }

    set jigsawListLite24(value: JigsawListLite) {
        if (!value || value === this._jigsawListLite24) {
            return;
        }
        this._jigsawListLite24 = value;

    }


    public routerParamValue;
    public paramName;
    public jigsawListLite24_data: any;


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

        this.eventBus.emit('FloatComponent_onInit');

        this.route.params.subscribe((params: Params) => {
            this.routerParamValue = params[this.paramName];
        });


        let rt_jigsawListLite24_data;
        try {
            rt_jigsawListLite24_data = ["选项1", "选项2", "选项3", "选项4", "选项5", "选项6", "选项7", "选项8", "选项9", "选项0", "选项03"];
        } catch (e) {
            console.error('init raw value failed: ', e);
            rt_jigsawListLite24_data = {};
        }

        this.jigsawListLite24_data = TableData.isTableData(rt_jigsawListLite24_data) ? TableData.toArray(rt_jigsawListLite24_data) : rt_jigsawListLite24_data;

        this._onInitActions();

    }

    ngAfterViewInit() {
        this.eventBus.emit('FloatComponent_afterViewInit');

        this._afterViewInitActions();

    }

    ngOnDestroy() {

        this._onDestroyActions();
        this._subscribers.forEach(subscriber => {
            subscriber.unsubscribe();
        });
    }
}

;var __uid_ts_1585189853905
