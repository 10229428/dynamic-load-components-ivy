import {DialogBase, JigsawButton, JigsawDialog} from '@rdkmaster/jigsaw';
import {ChangeDetectorRef, Component, NgZone, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Location} from '@angular/common';
import {DataBus} from "../service/data-bus";
import {EventBus} from "../service/event-bus";

@Component({
    template: `
        <jigsaw-dialog [buttons]="moduleRoot_buttons" [caption]="moduleRoot_caption" (answer)="moduleRoot_answer($event)" #moduleRoot
                       agent="44a3b5e6-675f-4039-8815-8a8594e73241" class="moduleRoot_class" [width]="'600PX'" [height]="'480PX'">
            <div #root agent="df01b420-0028-4d2c-ac14-2ab60d3cacc9" [perfectScrollbar]='{"wheelSpeed":0.5,"wheelPropagation":true}'
                 class="root_class awade-layout" style='overflow: hidden;height:100%; padding-bottom: 24px;  padding-right: 16px; '>
                <div style="display:flex; flex-direction:column; height:100%; flex-grow: 68; flex-shrink: 1; flex-basis: 0%; -ms-flex-preferred-size: auto; ">
                    <div style="min-height:24px; max-height:24px;"></div>
                    <div style="display:flex; flex-direction:row; width:100%; height:32px; flex-shrink: 0;">
                        <div style="min-width:24px; max-width:24px;"></div>
                        <div style="display:flex; flex-direction:column; height:100%; flex-grow: 41; flex-shrink: 1; flex-basis: 0%; -ms-flex-preferred-size: auto; ">
                            <div style="width:100%; height:24px; flex-shrink: 0;;display:flex;justify-content:flex-start;align-items:flex-start">
                                <p #p26 agent="3a81fbb2-7f1c-446c-8919-e10ee93fd843" class="p26_class" [style.width]="'100%'"
                                   [style.height]="'100%'">一段文本，这是一个对话框</p>
                            </div>
                            <div style="min-height:8px; max-height:8px;"></div>
                        </div>
                        <div style="min-width:24px; max-width:24px;"></div>
                        <div style="width:80px; height:32px; flex-shrink: 0;;display:flex;justify-content:flex-start;align-items:center">
                            <jigsaw-button (click)="jigsawButton33_click($event)" #jigsawButton33
                                           agent="d44c4237-5e47-4cfd-96eb-c35ad988f821" class="jigsawButton33_class" [width]="'100%'">update
                            </jigsaw-button>
                        </div>
                        <div style="min-width:104px; max-width:104px;"></div>
                    </div>
                    <div style="min-height:24px; max-height:24px;"></div>
                    <div style="display:flex; flex-direction:row; width:100%; height:272px; flex-shrink: 0;">
                        <div style="min-width:16px; max-width:16px;"></div>
                        <div style="height:272px; flex-grow: 68; flex-shrink: 1; flex-basis: 0%; -ms-flex-preferred-size: auto; ;display:flex;justify-content:flex-start;align-items:flex-start">
                            <p #p30 agent="5552814f-d117-48ee-a32b-192a74ca0aec" class="p30_class" [style.width]="'100%'"
                               [style.height]="'100%'">{{p30_innerHtml_member_0}}</p>
                        </div>
                    </div>
                </div>
            </div>
        </jigsaw-dialog>
    `,
    styles: [`
        .moduleRoot_class {
            width: 600PX;
            height: 480PX;
        }
    `]
})
export class DialogComponent extends DialogBase {
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
        super();
        this.buttons = this.moduleRoot_buttons;
    }

    public get i18n() {
        return this.dataBus.i18n;
    }

    private _internalVariable: any = {};

    private _moduleRoot: JigsawDialog;
    @ViewChild('moduleRoot', {static: false})
    get moduleRoot(): JigsawDialog {
        return this._moduleRoot;
    }

    set moduleRoot(value: JigsawDialog) {
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

    private _p26: any;
    @ViewChild('p26', {static: false})
    get p26(): any {
        return this._p26;
    }

    set p26(value: any) {
        if (!value || value === this._p26) {
            return;
        }
        this._p26 = value;

    }


    private _p30: any;
    @ViewChild('p30', {static: false})
    get p30(): any {
        return this._p30;
    }

    set p30(value: any) {
        if (!value || value === this._p30) {
            return;
        }
        this._p30 = value;

    }


    private _jigsawButton33: JigsawButton;
    @ViewChild('jigsawButton33', {static: false})
    get jigsawButton33(): JigsawButton {
        return this._jigsawButton33;
    }

    set jigsawButton33(value: JigsawButton) {
        if (!value || value === this._jigsawButton33) {
            return;
        }
        this._jigsawButton33 = value;

    }


    get p30_innerHtml_member_0() {
        try {
            return this.dataBus.tableData ? JSON.stringify(this.dataBus.tableData, null, '    ') : '';
        } catch (e) {
            return '';
        }
    }

    @ViewChild(JigsawDialog, {static: false}) public dialog: JigsawDialog;

    public routerParamValue;
    public paramName;
    public moduleRoot_buttons: any;
    public moduleRoot_caption: string;

    async moduleRoot_answer($event) {
        if (this.dispose == undefined || typeof this.dispose != 'function') {
            console.log("在设计态下，关闭对话框及按钮功能无法正常工作");
            return;
        }
        // 防止出现，在emit之后的监听中，使用了某个变量，而该变量的初始化在用户自定义的 script 中，导致变量未初始化的问题
        setTimeout(() => {
            this.answer.emit($event);
        }, 0);

        try {


            await (async () => {
                // 按钮点击

                if ($event == undefined) {
                    console.log("关闭按钮被点击了");
                    this.dispose();
                    return;
                }
                if ($event.value == 0) {
                    console.log("确定按钮被点击了");
                    this.dispose();
                }
                if ($event.value == 1) {
                    console.log("取消按钮被点击了");
                    this.dispose();
                }

            })();


        } catch (err) {
            console.log('do actions error: ', err);
        }
    }


    async jigsawButton33_click($event) {

        try {


            await (async () => {
                // 自定义代码块
                this.dataBus.tableData = {
                    header: ["dColumn1", "dColumn2", "dColumn3", "dColumn4"],
                    field: ["field1", "field2", "field3", "field4"],
                    data: [
                        ["cell11", "cell12", "cell13", "cell14"],
                        ["cell21", "cell22", "cell23", "cell24"],
                        ["cell31", "cell32", "cell33", "cell34"],
                        ["cell41", "cell42", "cell43", "cell44"],
                        ["cell51", "cell52", "cell53", "cell54"],
                        ["cell21", "cell22", "cell23", "cell24"],
                        ["cell31", "cell32", "cell33", "cell34"],
                        ["cell41", "cell42", "cell43", "cell44"],
                        ["cell51", "cell52", "cell53", "cell54"]
                    ]
                }

            })();


            (() => {
                // 发送事件到事件总线
                this.eventBus.emit('updateTableD', {});
            })();

        } catch (err) {
            console.log('do actions error: ', err);
        }
    }


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

        this.eventBus.emit('DialogComponent_onInit');

        this.route.params.subscribe((params: Params) => {
            this.routerParamValue = params[this.paramName];
        });


        try {
            this.moduleRoot_buttons = [{label: '确定', 'type': 'primary', value: 0}, {label: '取消', value: 1}];
        } catch (e) {
        }


        try {
            this.moduleRoot_caption = '对话框模块';
        } catch (e) {
        }

        this._onInitActions();

    }

    ngAfterViewInit() {
        this.eventBus.emit('DialogComponent_afterViewInit');


        setTimeout(() => {
            this.caption = (this.initData && this.initData.caption && this.initData.caption != 'undefined') ? this.initData.caption : this.moduleRoot_caption;
        });

        this._afterViewInitActions();

    }

    ngOnDestroy() {

        this._onDestroyActions();
        this._subscribers.forEach(subscriber => {
            subscriber.unsubscribe();
        });
    }
}

;var __uid_ts_1585189853899
