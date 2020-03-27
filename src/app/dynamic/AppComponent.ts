import {ChangeDetectorRef, Component, NgZone, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Location} from '@angular/common';
import {JigsawButton, JigsawTab, JigsawTable, PopupEffect, PopupOptions, PopupService, TableData} from '@rdkmaster/jigsaw';
import {DialogComponent} from './DialogComponent';
import {RepeatComponent} from './RepeatComponent';
import {FloatComponent} from './FloatComponent';
import {EventBus} from "../service/event-bus";
import {DataBus} from "../service/data-bus";

@Component({
    selector: 'awade-dynamic-app',
    template: `
        <div #root agent="e985c6d6-68c9-4b3a-91e2-de0d0b4be267" class="root_class awade-layout"
             style='overflow: hidden;height:100%; padding-bottom: 48px;  padding-right: 32px; '>
            <div style="display:flex; flex-direction:column; height:100%; flex-grow: 97; flex-shrink: 1; flex-basis: 0%; -ms-flex-preferred-size: auto; overflow: hidden;">
                <div style="min-height:48px; max-height:48px;"></div>
                <div style="display:flex; flex-direction:row; width:100%; flex-grow: 58; flex-shrink: 1; flex-basis: 0%; -ms-flex-preferred-size: auto; overflow: hidden;">
                    <div style="min-width:32px; max-width:32px;"></div>
                    <div style="height:100%; flex-grow: 97; flex-shrink: 1; flex-basis: 0%; -ms-flex-preferred-size: auto; overflow: hidden;;display:flex;justify-content:flex-start;align-items:flex-start">
                        <jigsaw-tabs #jigsawTabs18 agent="08c465d9-52f3-4033-8f66-374b625546bd" class="jigsawTabs18_class" [width]="'100%'"
                                     [height]="'100%'">
                            <jigsaw-tab-pane title='table'>
                                <ng-template>
                                    <div #awadeTabsLayout19 agent="56006ae7-48dd-4b48-b2ba-c4bf25889a6a"
                                         class="awadeTabsLayout19_class awade-layout"
                                         style='overflow: hidden;height:100%; padding-bottom: 16px;  padding-right: 24px; '>
                                        <div style="display:flex; flex-direction:column; height:100%; flex-grow: 89; flex-shrink: 1; flex-basis: 0%; -ms-flex-preferred-size: auto; overflow: hidden;">
                                            <div style="min-height:16px; max-height:16px;"></div>
                                            <div style="display:flex; flex-direction:row; width:100%; height:32px; flex-shrink: 0;">
                                                <div style="min-width:24px; max-width:24px;"></div>
                                                <div style="width:80px; height:32px; flex-shrink: 0;;display:flex;justify-content:flex-start;align-items:center">
                                                    <jigsaw-button (click)="jigsawButton20_click($event)" #jigsawButton20
                                                                   agent="b4a71e84-ff72-465b-be99-928674a09a0a" class="jigsawButton20_class"
                                                                   [width]="'100%'">update
                                                    </jigsaw-button>
                                                </div>
                                                <div style="min-width:40px; max-width:40px;"></div>
                                                <div style="width:80px; height:32px; flex-shrink: 0;;display:flex;justify-content:flex-start;align-items:center">
                                                    <jigsaw-button (click)="jigsawButton23_click($event)" #jigsawButton23
                                                                   agent="274917b4-a682-4f1b-87cb-d4ffabd6e122" class="jigsawButton23_class"
                                                                   [width]="'100%'">dialog
                                                    </jigsaw-button>
                                                </div>
                                                <div style="min-width:32px; max-width:32px;"></div>
                                                <div style="display:flex; flex-direction:column; height:100%; flex-grow: 9; flex-shrink: 1; flex-basis: 0%; -ms-flex-preferred-size: auto; overflow: hidden;">
                                                    <div style="width:100%; height:24px; flex-shrink: 0;;display:flex;justify-content:flex-start;align-items:flex-start">
                                                        <span #span34 agent="28f4cc7f-08b1-42be-9ac4-ca82345d0c72" class="span34_class">国际化词条：</span>
                                                    </div>
                                                    <div style="min-height:8px; max-height:8px;"></div>
                                                </div>
                                                <div style="min-width:8px; max-width:8px;"></div>
                                                <div style="display:flex; flex-direction:column; height:100%; flex-grow: 10; flex-shrink: 1; flex-basis: 0%; -ms-flex-preferred-size: auto; overflow: hidden;">
                                                    <div style="width:100%; height:24px; flex-shrink: 0;;display:flex;justify-content:flex-start;align-items:flex-start">
                                                        <span #span35 agent="5a7768e4-2898-4e89-8e0a-7f579655b203"
                                                              class="span35_class">{{span35_innerHtml_member_0}}</span>
                                                    </div>
                                                    <div style="min-height:8px; max-height:8px;"></div>
                                                </div>
                                                <div style="min-width:320px; max-width:320px;"></div>
                                            </div>
                                            <div style="min-height:16px; max-height:16px;"></div>
                                            <div style="display:flex; flex-direction:row; width:100%; height:304px; flex-shrink: 0;">
                                                <div style="min-width:24px; max-width:24px;"></div>
                                                <div style="height:304px; flex-grow: 89; flex-shrink: 1; flex-basis: 0%; -ms-flex-preferred-size: auto; overflow: hidden;;display:flex;justify-content:flex-start;align-items:flex-start">
                                                    <jigsaw-table [data]="jigsawTable21_data" [columnDefines]="jigsawTable21_columnDefines"
                                                                  #jigsawTable21 agent="30ad49cb-2bb8-47b6-a51e-af985a9d9c31"
                                                                  class="jigsawTable21_class"
                                                                  [(additionalData)]="jigsawTable21_additionalData" [width]="'100%'"
                                                                  [height]="'100%'"></jigsaw-table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ng-template>
                            </jigsaw-tab-pane>
                            <jigsaw-tab-pane title='other'>
                                <ng-template>
                                    <div #awadeTabsLayout22 agent="10b57578-1d2a-4133-a897-862991b1de93"
                                         class="awadeTabsLayout22_class awade-layout"
                                         style='overflow: hidden;height:100%; padding-bottom: 24px;  padding-right: 32px; '>
                                        <div style="display:flex; flex-direction:column; height:100%; flex-grow: 80; flex-shrink: 1; flex-basis: 0%; -ms-flex-preferred-size: auto; overflow: hidden;">
                                            <div style="min-height:24px; max-height:24px;"></div>
                                            <div style="display:flex; flex-direction:row; width:100%; height:32px; flex-shrink: 0;">
                                                <div style="min-width:40px; max-width:40px;"></div>
                                                <div style="width:80px; height:32px; flex-shrink: 0;;display:flex;justify-content:flex-start;align-items:center">
                                                    <jigsaw-button jigsaw-float [jigsawFloatTarget]="jigsawFloat29_jigsawFloatTarget"
                                                                   [jigsawFloatOpenTrigger]="jigsawFloat29_jigsawFloatOpenTrigger"
                                                                   [jigsawFloatCloseTrigger]="jigsawFloat29_jigsawFloatCloseTrigger"
                                                                   #jigsawButton28 agent="e5fe0488-bf33-4742-ad0e-c4ad70372559"
                                                                   class="jigsawButton28_class" [width]="'100%'">float
                                                    </jigsaw-button>
                                                </div>
                                                <div style="min-width:552px; max-width:552px;"></div>
                                            </div>
                                            <div style="min-height:40px; max-height:40px;"></div>
                                            <div style="display:flex; flex-direction:row; width:100%; height:264px; flex-shrink: 0;">
                                                <div style="min-width:32px; max-width:32px;"></div>
                                                <div style="height:264px; flex-grow: 80; flex-shrink: 1; flex-basis: 0%; -ms-flex-preferred-size: auto; overflow: hidden;overflow: auto;display: flex;flex-direction: row;flex-wrap: wrap;">
                                                    <awade-repeat [data]="awadeRepeat27_data" [iterateWith]="awadeRepeat27_iterateWith"
                                                                  #awadeRepeat27 agent="8a41261e-c6a8-4ace-ae35-8c46558abe2f"
                                                                  class="awadeRepeat27_class" [style.width]="'100%'"
                                                                  [style.height]="'100%'"></awade-repeat>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ng-template>
                            </jigsaw-tab-pane>
                        </jigsaw-tabs>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`

        .span34_class {
            display: inline-block;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

        }

        .span35_class {
            display: inline-block;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

        }

    `]
})
export class AppComponent {
    // 存放所有订阅事件
    private _subscribers: any[] = [];

    constructor(private route: ActivatedRoute,
                private router: Router,
                private location: Location,
                private _popupService: PopupService,
                private http: HttpClient,
                private zone: NgZone,
                public eventBus: EventBus,
                public dataBus: DataBus,
                public translateService: TranslateService,
                public cdr: ChangeDetectorRef) {


        this.jigsawTable21_data = new TableData();


        this._subscribers.push(this.eventBus.subscribe(["updateTable", "updateTableD"], $event => {
            try {
                this.jigsawTable21_data.fromObject(this.dataBus.tableData ? this.dataBus.tableData : {header: [], field: [], data: []});
            } catch (e) {
                console.error('convert TableData from memory failed: ', e);
            }
        }));


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


    private _jigsawTabs18: JigsawTab;
    @ViewChild('jigsawTabs18', {static: false})
    get jigsawTabs18(): JigsawTab {
        return this._jigsawTabs18;
    }

    set jigsawTabs18(value: JigsawTab) {
        if (!value || value === this._jigsawTabs18) {
            return;
        }
        this._jigsawTabs18 = value;

    }


    private _awadeTabsLayout19: any;
    @ViewChild('awadeTabsLayout19', {static: false})
    get awadeTabsLayout19(): any {
        return this._awadeTabsLayout19;
    }

    set awadeTabsLayout19(value: any) {
        if (!value || value === this._awadeTabsLayout19) {
            return;
        }
        this._awadeTabsLayout19 = value;

    }


    private _jigsawButton20: JigsawButton;
    @ViewChild('jigsawButton20', {static: false})
    get jigsawButton20(): JigsawButton {
        return this._jigsawButton20;
    }

    set jigsawButton20(value: JigsawButton) {
        if (!value || value === this._jigsawButton20) {
            return;
        }
        this._jigsawButton20 = value;

    }


    private _jigsawTable21: JigsawTable;
    @ViewChild('jigsawTable21', {static: false})
    get jigsawTable21(): JigsawTable {
        return this._jigsawTable21;
    }

    set jigsawTable21(value: JigsawTable) {
        if (!value || value === this._jigsawTable21) {
            return;
        }
        this._jigsawTable21 = value;

    }


    private _jigsawButton23: JigsawButton;
    @ViewChild('jigsawButton23', {static: false})
    get jigsawButton23(): JigsawButton {
        return this._jigsawButton23;
    }

    set jigsawButton23(value: JigsawButton) {
        if (!value || value === this._jigsawButton23) {
            return;
        }
        this._jigsawButton23 = value;

    }


    private _span34: any;
    @ViewChild('span34', {static: false})
    get span34(): any {
        return this._span34;
    }

    set span34(value: any) {
        if (!value || value === this._span34) {
            return;
        }
        this._span34 = value;

    }


    private _span35: any;
    @ViewChild('span35', {static: false})
    get span35(): any {
        return this._span35;
    }

    set span35(value: any) {
        if (!value || value === this._span35) {
            return;
        }
        this._span35 = value;

    }


    private _awadeTabsLayout22: any;
    @ViewChild('awadeTabsLayout22', {static: false})
    get awadeTabsLayout22(): any {
        return this._awadeTabsLayout22;
    }

    set awadeTabsLayout22(value: any) {
        if (!value || value === this._awadeTabsLayout22) {
            return;
        }
        this._awadeTabsLayout22 = value;

    }


    private _awadeRepeat27: any;
    @ViewChild('awadeRepeat27', {static: false})
    get awadeRepeat27(): any {
        return this._awadeRepeat27;
    }

    set awadeRepeat27(value: any) {
        if (!value || value === this._awadeRepeat27) {
            return;
        }
        this._awadeRepeat27 = value;

    }


    private _jigsawButton28: JigsawButton;
    @ViewChild('jigsawButton28', {static: false})
    get jigsawButton28(): JigsawButton {
        return this._jigsawButton28;
    }

    set jigsawButton28(value: JigsawButton) {
        if (!value || value === this._jigsawButton28) {
            return;
        }
        this._jigsawButton28 = value;

    }


    private _jigsawFloat29: any;
    @ViewChild('jigsawFloat29', {static: false})
    get jigsawFloat29(): any {
        return this._jigsawFloat29;
    }

    set jigsawFloat29(value: any) {
        if (!value || value === this._jigsawFloat29) {
            return;
        }
        this._jigsawFloat29 = value;

    }


    get span35_innerHtml_member_0() {
        try {
            return this.i18n.field;
        } catch (e) {
            return '';
        }
    }

    public jigsawTable21_additionalData: any;
    public routerParamValue;
    public paramName;
    public awadeTabsLayout19_title: string;
    public jigsawTable21_data: TableData;
    public jigsawTable21_columnDefines: any;
    public awadeTabsLayout22_title: string;
    public awadeRepeat27_data: any;
    public awadeRepeat27_iterateWith: any;
    public jigsawFloat29_jigsawFloatTarget: any;
    public jigsawFloat29_jigsawFloatOpenTrigger: any;
    public jigsawFloat29_jigsawFloatCloseTrigger: any;

    async jigsawButton20_click($event) {

        try {


            await (async () => {
                // 自定义代码块
                this.dataBus.tableData = {
                    header: ["Column1", "Column2", "Column3", "Column4"],
                    field: ["field1", "field2", "field3", "field4"],
                    data: [
                        ["cell11", "cell12", "cell13", "cell14"],
                        ["cell21", "cell22", "cell23", "cell24"],
                        ["cell31", "cell32", "cell33", "cell34"],
                        ["cell41", "cell42", "cell43", "cell44"],
                        ["cell51", "cell52", "cell53", "cell54"]
                    ]
                }

            })();


            (() => {
                // 发送事件到事件总线
                this.eventBus.emit('updateTable', {});
            })();

        } catch (err) {
            console.log('do actions error: ', err);
        }
    }


    async jigsawButton23_click($event) {

        try {
            let $result: any;

            await (async () => {
                // 对话框

                let option: PopupOptions = {
                    modal: true,
                    showBorder: true
                };

                option.showEffect = PopupEffect.fadeIn;
                option.hideEffect = PopupEffect.fadeOut;
                const initData = {caption: ''};
                const jigsawButton23_click_dialog_DialogComponent = this._popupService.popup(DialogComponent/**GeneratedByAwade**/, option, initData);

                return new Promise<any>(resolve =>
                    jigsawButton23_click_dialog_DialogComponent.answer.subscribe((result) => {
                        if (jigsawButton23_click_dialog_DialogComponent) {
                            jigsawButton23_click_dialog_DialogComponent.answer.unsubscribe();
                        }
                        $result = result;
                        resolve(result);
                    }));
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

        this.eventBus.emit('AppComponent_onInit');

        this.route.params.subscribe((params: Params) => {
            this.routerParamValue = params[this.paramName];
        });


        try {
            this.awadeTabsLayout19_title = 'table';
        } catch (e) {
        }


        let rt_jigsawTable21_data;
        try {
            rt_jigsawTable21_data = {
                header: ["Column1", "Column2", "Column3"],
                field: ["field1", "field2", "field3"],
                data: [
                    ["cell11", "cell12", "cell13"], //row1
                    ["cell21", "cell22", "cell23"], //row2
                    ["cell31", "cell32", "cell33"]  //row3
                ]
            }
            ;
        } catch (e) {
            console.error('init raw value failed: ', e);
            rt_jigsawTable21_data = {};
        }

        this.jigsawTable21_data.fromObject(rt_jigsawTable21_data)


        try {
            this.jigsawTable21_columnDefines = [];
        } catch (e) {
        }


        try {
            this.awadeTabsLayout22_title = 'other';
        } catch (e) {
        }


        try {
            this.awadeRepeat27_data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        } catch (e) {
        }


        try {
            this.awadeRepeat27_iterateWith = RepeatComponent;
        } catch (e) {
        }


        try {
            this.jigsawFloat29_jigsawFloatTarget = FloatComponent;
        } catch (e) {
        }


        try {
            this.jigsawFloat29_jigsawFloatOpenTrigger = "click";
        } catch (e) {
        }


        try {
            this.jigsawFloat29_jigsawFloatCloseTrigger = "click";
        } catch (e) {
        }

        this._onInitActions();

    }

    ngAfterViewInit() {
        this.eventBus.emit('AppComponent_afterViewInit');

        this._afterViewInitActions();

    }

    ngOnDestroy() {

        this._onDestroyActions();
        this._subscribers.forEach(subscriber => {
            subscriber.unsubscribe();
        });
    }
}

;var __uid_ts_1585191784155
