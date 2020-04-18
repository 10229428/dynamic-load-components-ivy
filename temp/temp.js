(window["webpackJsonp"] = window["webpackJsonp"] || []).push([['min-module-min-module'], {

    "./src/app/min-module/AppComponent.ts":
        (function (module, __webpack_exports__, __webpack_require__) {
            // 1.生成固定代码，模块名称动态改变
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__.d(__webpack_exports__, "AppComponent", function () {
                return AppComponent;
            });
            var __metadata = (undefined && undefined.__metadata) || function (k, v) {
                if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
            };
            // 2.这个__importDefault暂不清楚作用是啥，不知道是否需要添加
            var __importDefault = (undefined && undefined.__importDefault) || function (mod) {
                return (mod && mod.__esModule) ? mod : {"default": mod};
            };

            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            var __metadata = (this && this.__metadata) || function (k, v) {
                if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
            };
            var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
                function adopt(value) {
                    return value instanceof P ? value : new P(function (resolve) {
                        resolve(value);
                    });
                }

                return new (P || (P = Promise))(function (resolve, reject) {
                    function fulfilled(value) {
                        try {
                            step(generator.next(value));
                        } catch (e) {
                            reject(e);
                        }
                    }

                    function rejected(value) {
                        try {
                            step(generator["throw"](value));
                        } catch (e) {
                            reject(e);
                        }
                    }

                    function step(result) {
                        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
                    }

                    step((generator = generator.apply(thisArg, _arguments || [])).next());
                });
            };
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
            var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/http.js");
            var _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @awade/uid-sdk */ "./node_modules/@awade/uid-sdk/__ivy_ngcc__/fesm2015/awade-uid-sdk.js");
            var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ngx-translate/core */ "./node_modules/@ngx-translate/core/__ivy_ngcc__/fesm2015/ngx-translate-core.js");
            var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");
            var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/common.js");
            var _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @rdkmaster/jigsaw */ "./node_modules/@rdkmaster/jigsaw/__ivy_ngcc__/fesm2015/rdkmaster-jigsaw.js");
            var _rxjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm2015/index.js");
            const console = _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_2__["LogService"];

            let AppComponent = class AppComponent {
                constructor(route, router, location, http, zone, eventBus, dataBus, translateService, loadingService, cdr) {
                    this.route = route;
                    this.router = router;
                    this.location = location;
                    this.http = http;
                    this.zone = zone;
                    this.eventBus = eventBus;
                    this.dataBus = dataBus;
                    this.translateService = translateService;
                    this.loadingService = loadingService;
                    this.cdr = cdr;
                    // 存放所有订阅事件
                    this._subscribers = [];
                    this._internalVariable = {};
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
                        });
                    });
                    console.log('AppComponent ==> update ${this.index}');
                }

                get i18n() {
                    return this.dataBus.i18n;
                }

                get root() {
                    return this._root;
                }

                set root(value) {
                    if (!value || value === this._root) {
                        return;
                    }
                    this._root = value;
                }

                get jigsawButton1() {
                    return this._jigsawButton1;
                }

                set jigsawButton1(value) {
                    if (!value || value === this._jigsawButton1) {
                        return;
                    }
                    this._jigsawButton1 = value;
                }

                get jigsawButton2() {
                    return this._jigsawButton2;
                }

                set jigsawButton2(value) {
                    if (!value || value === this._jigsawButton2) {
                        return;
                    }
                    this._jigsawButton2 = value;
                }

                jigsawButton1_click($event) {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            (() => {
                                // 发送事件到事件总线
                                this.eventBus.emit('a-new', {a: 'new-${this.index}'});
                            })();
                        } catch (err) {
                            console.log('do actions error: ', err);
                        }
                    });
                }

                jigsawButton2_click($event) {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            (() => {
                                // 发送事件到事件总线
                                this.eventBus.emit('b-new', {b: 'new-${this.index}'});
                            })();
                        } catch (err) {
                            console.log('do actions error: ', err);
                        }
                    });
                }

                _onInitActions_root() {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            let aaa, bbb;
                            [aaa, bbb] = yield _rxjs__WEBPACK_IMPORTED_MODULE_7__["forkJoin"](_awade_uid_sdk__WEBPACK_IMPORTED_MODULE_2__["toObservable"](this.eventBus, 'a-new'), _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_2__["toObservable"](this.eventBus, 'b-new')).toPromise();
                            yield (() => __awaiter(this, void 0, void 0, function* () {
                                // 自定义代码块
                                console.log('jigsawButton2 ==> update: ', aaa, bbb);
                            }))();
                        } catch (err) {
                            console.log('do actions error: ', err);
                        }
                    });
                }

                _onInitActions() {
                    return __awaiter(this, void 0, void 0, function* () {
                        // onInitActions加个空的await用于消除和旧版本promise的差异
                        yield (() => __awaiter(this, void 0, void 0, function* () {
                        }))();
                        this._onInitActions_root();
                    });
                }

                _afterViewInitActions() {
                }

                _onDestroyActions() {
                }

                ngOnInit() {
                    // 这里默认同步代码会触发setter，异步代码不触发setter，会导致一些问题
                    // 改成统一使用detectChanges触发
                    this.cdr.detach();
                    this.eventBus.emit('AppComponent_onInit');
                    this.route.params.subscribe((params) => {
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
            };
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('root', {static: false}),
                __metadata("design:type", Object),
                __metadata("design:paramtypes", [Object])
            ], AppComponent.prototype, "root", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('jigsawButton1', {static: false}),
                __metadata("design:type", typeof (_a = typeof JigsawButton !== "undefined" && JigsawButton) === "function" ? _a : Object),
                __metadata("design:paramtypes", [typeof (_b = typeof _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_6__["JigsawButton"] !== "undefined" && _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_6__["JigsawButton"]) === "function" ? _b : Object])
            ], AppComponent.prototype, "jigsawButton1", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('jigsawButton2', {static: false}),
                __metadata("design:type", typeof (_c = typeof JigsawButton !== "undefined" && JigsawButton) === "function" ? _c : Object),
                __metadata("design:paramtypes", [typeof (_d = typeof _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_6__["JigsawButton"] !== "undefined" && _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_6__["JigsawButton"]) === "function" ? _d : Object])
            ], AppComponent.prototype, "jigsawButton2", null);
            AppComponent = __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"]({
                    template: `
                        <div id="root" #root agent="2fcb1f2b-2c81-41c2-902d-ff217616c633" style='height:100%;'>
                            <div class="awade-layout" style="overflow: hidden; position:relative; width:100%; height:500px;min-height: inherit;">
                                <div style="position:absolute; width:80px; height:32px;left:120px;top:64px;z-index:12;display:flex;overflow:hidden;justify-content:flex-start;align-items:center;">
                                    <jigsaw-button (click)="jigsawButton1_click($event)" id="jigsawButton1" #jigsawButton1
                                                   agent="bb549991-a5cb-493e-84b5-aadaa05623bc" class="jigsawButton1_class" [width]="'100%'">a-new-${this.index}
                                    </jigsaw-button>
                                </div>
                                <div style="position:absolute; width:80px; height:32px;left:232px;top:64px;z-index:14;display:flex;overflow:hidden;justify-content:flex-start;align-items:center;">
                                    <jigsaw-button (click)="jigsawButton2_click($event)" id="jigsawButton2" #jigsawButton2
                                                   agent="fa3267e7-f06d-4585-ad41-6ff17d3c453c" class="jigsawButton2_class" [width]="'100%'">b-new-${this.index}
                                    </jigsaw-button>
                                </div>
                            </div>
                        </div>
                    `,
                    styles: [`        
                    `]
                }),
                __metadata("design:paramtypes", [typeof (_e = typeof _angular_router__WEBPACK_IMPORTED_MODULE_4__["ActivatedRoute"] !== "undefined" && _angular_router__WEBPACK_IMPORTED_MODULE_4__["ActivatedRoute"]) === "function" ? _e : Object, typeof (_f = typeof _angular_router__WEBPACK_IMPORTED_MODULE_4__["Router"] !== "undefined" && _angular_router__WEBPACK_IMPORTED_MODULE_4__["Router"]) === "function" ? _f : Object, typeof (_g = typeof _angular_common__WEBPACK_IMPORTED_MODULE_5__["Location"] !== "undefined" && _angular_common__WEBPACK_IMPORTED_MODULE_5__["Location"]) === "function" ? _g : Object, typeof (_h = typeof _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"] !== "undefined" && _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]) === "function" ? _h : Object, typeof (_j = typeof _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"] !== "undefined" && _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"]) === "function" ? _j : Object, typeof (_k = typeof _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_2__["EventBus"] !== "undefined" && _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_2__["EventBus"]) === "function" ? _k : Object, typeof (_l = typeof _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_2__["DataBus"] !== "undefined" && _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_2__["DataBus"]) === "function" ? _l : Object, typeof (_m = typeof _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"] !== "undefined" && _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"]) === "function" ? _m : Object, typeof (_o = typeof _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_2__["AwadeLoadingService"] !== "undefined" && _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_2__["AwadeLoadingService"]) === "function" ? _o : Object, typeof (_p = typeof _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"] !== "undefined" && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"]) === "function" ? _p : Object])
            ], AppComponent);

        }),

    "./src/app/min-module/min.module.ts":
        (function (module, __webpack_exports__, __webpack_require__) {
            // 1.生成固定代码，模块名称动态改变
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__.d(__webpack_exports__, "DynamicMinModule", function () {
                return DynamicMinModule;
            });
            var __metadata = (undefined && undefined.__metadata) || function (k, v) {
                if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
            };
            // 2.这个__importDefault暂不清楚作用是啥，不知道是否需要添加
            var __importDefault = (undefined && undefined.__importDefault) || function (mod) {
                return (mod && mod.__esModule) ? mod : {"default": mod};
            };

            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            var __metadata = (this && this.__metadata) || function (k, v) {
                if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
            };
            var _a, _b, _c;
            var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
            var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/common.js");
            var _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @rdkmaster/jigsaw */ "./node_modules/@rdkmaster/jigsaw/__ivy_ngcc__/fesm2015/rdkmaster-jigsaw.js");
            var _AppComponent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./AppComponent */ "./src/app/min-module/AppComponent.ts");
            var _ngx_perfect_scrollbar__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ngx-perfect-scrollbar */ "./node_modules/ngx-perfect-scrollbar/__ivy_ngcc__/dist/ngx-perfect-scrollbar.es5.js");
            var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ngx-translate/core */ "./node_modules/@ngx-translate/core/__ivy_ngcc__/fesm2015/ngx-translate-core.js");
            var _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @awade/uid-sdk */ "./node_modules/@awade/uid-sdk/__ivy_ngcc__/fesm2015/awade-uid-sdk.js");
            var _angular_common_http__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/http.js");
            var _angular_router__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");
            let DynamicMinModule = class DynamicMinModule {
                constructor(translateService, dataBus, http) {
                    this.translateService = translateService;
                    this.dataBus = dataBus;
                    this.http = http;
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
                        const language = 'en';
                        _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_2__["TranslateHelper"]["changeLanguage"](this.translateService, language);
                        this.dataBus.i18n = {};
                        i18n.data.forEach(row => {
                            const prop = row[0].replace(/(['"])/g, '\\$1');
                            this.dataBus.i18n[prop] = this.translateService.instant(prop);
                        });
                        _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_2__["TranslateHelper"]["languageChangEvent"].subscribe((langInfo) => {
                            i18n.data.forEach(row => {
                                const prop = row[0].replace(/(['"])/g, '\\$1');
                                this.dataBus.i18n[prop] = this.translateService.instant(prop);
                            });
                        });
                        console.log('DynamicMinModule.constructor ==> new content ${this.index}');
                    }
                }
            };
            DynamicMinModule = __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"]({
                    imports: [
                        _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
                        _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_2__["JigsawModule"],
                        _ngx_perfect_scrollbar__WEBPACK_IMPORTED_MODULE_4__["PerfectScrollbarModule"],
                        _angular_common_http__WEBPACK_IMPORTED_MODULE_7__["HttpClientModule"],
                        _ngx_translate_core__WEBPACK_IMPORTED_MODULE_5__["TranslateModule"]["forRoot"](),
                        _angular_router__WEBPACK_IMPORTED_MODULE_8__["RouterModule"]["forChild"]([])
                    ],
                    declarations: [_AppComponent__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]],
                    exports: [],
                    entryComponents: [_AppComponent__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]],
                    bootstrap: [_AppComponent__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]],
                    providers: [_awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__["EventBus"], _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__["DataBus"], _ngx_translate_core__WEBPACK_IMPORTED_MODULE_5__["TranslateService"]]
                }),
                __metadata("design:paramtypes", [typeof (_a = typeof _ngx_translate_core__WEBPACK_IMPORTED_MODULE_5__["TranslateService"] !== "undefined" && _ngx_translate_core__WEBPACK_IMPORTED_MODULE_5__["TranslateService"]) === "function" ? _a : Object, typeof (_b = typeof _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__["DataBus"] !== "undefined" && _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__["DataBus"]) === "function" ? _b : Object, typeof (_c = typeof _angular_common_http__WEBPACK_IMPORTED_MODULE_7__["HttpClient"] !== "undefined" && _angular_common_http__WEBPACK_IMPORTED_MODULE_7__["HttpClient"]) === "function" ? _c : Object])
            ], DynamicMinModule);
        })
}]);
