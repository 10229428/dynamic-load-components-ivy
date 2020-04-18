import {ChangeDetectorRef, Component, NgZone, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AwadeLoadingService, DataBus, EventBus, LogService, toObservable} from '@awade/uid-sdk';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Location} from '@angular/common';
import {JigsawButton} from '@rdkmaster/jigsaw';
import {forkJoin} from 'rxjs';

const console = LogService;

@Component({
    template: `
        <div id="root" #root agent="2fcb1f2b-2c81-41c2-902d-ff217616c633" style='height:100%;'>
            <div class="awade-layout" style="overflow: hidden; position:relative; width:100%; height:500px;min-height: inherit;">
                <div style="position:absolute; width:80px; height:32px;left:120px;top:64px;z-index:12;display:flex;overflow:hidden;justify-content:flex-start;align-items:center;">
                    <jigsaw-button (click)="jigsawButton1_click($event)" id="jigsawButton1" #jigsawButton1
                                   agent="bb549991-a5cb-493e-84b5-aadaa05623bc" class="jigsawButton1_class" [width]="'100%'">a
                    </jigsaw-button>
                </div>
                <div style="position:absolute; width:80px; height:32px;left:232px;top:64px;z-index:14;display:flex;overflow:hidden;justify-content:flex-start;align-items:center;">
                    <jigsaw-button (click)="jigsawButton2_click($event)" id="jigsawButton2" #jigsawButton2
                                   agent="fa3267e7-f06d-4585-ad41-6ff17d3c453c" class="jigsawButton2_class" [width]="'100%'">b
                    </jigsaw-button>
                </div>
            </div>
        </div>
    `,
    styles: [`        
    `]
})
export class AppComponent {
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
                public loadingService: AwadeLoadingService,
                public cdr: ChangeDetectorRef) {

        if (this.dataBus.removeZoneSubscribe) {
            this.dataBus.removeZoneSubscribe.unsubscribe();
        }
        this.dataBus.removeZoneSubscribe = this.zone.onStable.subscribe(() => {
            if (this.dataBus.removeZoneSubscribe) {
                this.dataBus.removeZoneSubscribe.unsubscribe();
                this.dataBus.removeZoneSubscribe = null;
            }
            // reattach必须在zone里面跑，不然初次加载可能会出问题
            this.zone.run(() => {
                // detectChanges不能删，因为在editor界面还是detach状态下给画布reattach不会自动触发变更检查
                this.cdr.detectChanges();
                this.cdr.reattach();
                console.log('AppComponent layout cdr.reattach');
            })
        })

    }

    public get i18n() {
        return this.dataBus.i18n;
    }

    private _internalVariable: any = {};

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

    private _jigsawButton1: JigsawButton;
    @ViewChild('jigsawButton1', {static: false})
    get jigsawButton1(): JigsawButton {
        return this._jigsawButton1;
    }

    set jigsawButton1(value: JigsawButton) {
        if (!value || value === this._jigsawButton1) {
            return;
        }
        this._jigsawButton1 = value;
    }

    private _jigsawButton2: JigsawButton;
    @ViewChild('jigsawButton2', {static: false})
    get jigsawButton2(): JigsawButton {
        return this._jigsawButton2;
    }

    set jigsawButton2(value: JigsawButton) {
        if (!value || value === this._jigsawButton2) {
            return;
        }
        this._jigsawButton2 = value;
    }

    public routerParamValue;
    public paramName;

    async jigsawButton1_click($event) {
        try {
            (() => {
                // 发送事件到事件总线
                this.eventBus.emit('a', {a: 1});
            })();
        } catch (err) {
            console.log('do actions error: ', err);
        }
    }

    async jigsawButton2_click($event) {
        try {
            (() => {
                // 发送事件到事件总线
                this.eventBus.emit('b', {b: 1});
            })();
        } catch (err) {
            console.log('do actions error: ', err);
        }
    }

    async _onInitActions_root() {
        try {
            let aaa: any, bbb: any;
            [aaa, bbb] = await forkJoin(
                toObservable(this.eventBus, 'a'), toObservable(this.eventBus, 'b')
            ).toPromise();
            await (async () => {
                // 自定义代码块
                console.log('jigsawButton2 ==> ', aaa, bbb);
            })();
        } catch (err) {
            console.log('do actions error: ', err);
        }
    }

    async _onInitActions() {
        // onInitActions加个空的await用于消除和旧版本promise的差异
        await (async () => {
        })();
        this._onInitActions_root();
    }

    _afterViewInitActions() {

    }

    _onDestroyActions() {

    }

    ngOnInit() {
        console.log('AppComponent layout init and cdr.detach');
        // 这里默认同步代码会触发setter，异步代码不触发setter，会导致一些问题
        // 改成统一使用detectChanges触发
        this.cdr.detach();

        this.eventBus.emit('AppComponent_onInit');

        this.route.params.subscribe((params: Params) => {
            this.routerParamValue = params[this.paramName];
        });

        this._onInitActions();

        // 增加手动变更检查，防止产生的二次变更检查跑到reattach里面
        this.cdr.detectChanges();

    }

    ngAfterViewInit() {
        this.eventBus.emit('AppComponent_afterViewInit');

        this._afterViewInitActions();

        // 增加手动变更检查，防止产生的二次变更检查跑到reattach里面
        this.cdr.detectChanges();
    }

    ngOnDestroy() {
        this._onDestroyActions();
        this._subscribers.forEach(subscriber => {
            subscriber.unsubscribe();
        });
    }
}

