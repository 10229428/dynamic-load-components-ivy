import {
    ChangeDetectorRef,
    Compiler,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    Injector,
    NgModuleFactory,
    NgModuleRef,
    OnDestroy,
    Type,
    ViewChild,
    ViewContainerRef,
    ɵcreateInjector,
    ɵLifecycleHooksFeature,
    ɵrenderComponent
} from '@angular/core';
import {DynamicComponentService, ICreatedModule} from "./service/dynamic-component.service";
import {DataBus, EventBus} from '@awade/uid-sdk';

export type CreatedModule = {
    moduleRef: NgModuleRef<any>;
    componentRef?: ComponentRef<any>;
}

export class RepeatViewBase {
    it: any;
    index: number;
    odd: boolean;
    even: boolean;
    first: boolean;
    last: boolean;
    collection: Array<any>;
}

type IdentifierInfo = { name: string, path?: string, rawName?: string };
const identifierPackages: { [identifier: string]: IdentifierInfo } = {};

@Component({
    selector: 'awade-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
    title = 'Ivy Load';
    @ViewChild('dynamicContainer', {read: ViewContainerRef, static: false}) _dynamicContainer: ViewContainerRef;
    fooRef: ComponentRef<any>;

    private _handler;

    constructor(private _injector: Injector,
                private _factoryResolver: ComponentFactoryResolver,
                private _dynamicComponentService: DynamicComponentService,
                private _compiler: Compiler,
                private _changeDetectorRef: ChangeDetectorRef,
                private eventBus: EventBus,
                private dataBus: DataBus) {
        const tsCode = require('!!raw-loader!./service/typescript.js');
        this._initTypescriptCompiler(tsCode.default);
    }

    loadFooComponentWithRender() {
        import('./foo/foo.component').then(({FooComponent}) => {
            const fooRef = ɵrenderComponent(FooComponent, {
                // host: 'awade-app',
                injector: this._injector,
                hostFeatures: [ɵLifecycleHooksFeature]
            });
            fooRef.title = 'With ɵrenderComponent';
            this._handler = fooRef.titleChanges.subscribe($event => {
                console.log('titleChanges =====> ', $event);
            });
        });
    }

    async loadFooComponentWithFactory() {
        if (!this.fooRef) {
            const {FooComponent} = await import('./foo/foo.component');
            this.fooRef = this._dynamicContainer.createComponent(this._factoryResolver.resolveComponentFactory(FooComponent));
            this.fooRef.instance.title = 'With resolveComponentFactory';
            this._handler = this.fooRef.instance.titleChanges.subscribe($event => {
                console.log('titleChanges =====> ', $event);
            });
        }
    }

    loadFoo() {
        import('./foo/foo.module').then(({FooModule}) => {
            const injector = ɵcreateInjector(FooModule, this._injector);
            const {FooComponent} = injector.get(FooModule);
            const fooRef = ɵrenderComponent(FooComponent, {host: 'app-foo', injector: this._injector});
            fooRef.title = 'Load Foo Module'; // 输入属性修改无效？
            this._handler = fooRef.titleChanges.subscribe($event => {
                console.log('titleChanges =====> ', $event);
            });
        });
    }

    loadFooByService() {
        import('./foo/foo.module').then(m => m.FooModule)
            .then(elementModuleOrFactory => {
                return this._compiler.compileModuleAsync(elementModuleOrFactory);
            })
            .then((compiledModule: NgModuleFactory<any>) => {
                return this._dynamicComponentService.createAndAttachModuleAsync(compiledModule, this._injector, {vcr: this._dynamicContainer});
            })
            .then(({moduleRef, componentRef}: ICreatedModule) => {
                console.log(componentRef);
                componentRef.componentRef.instance.title = 'With Load Service';
                this._handler = componentRef.componentRef.instance.titleChanges.subscribe($event => {
                    console.log('titleChanges =====> ', $event);
                });
            });
    }

    dynamicLoadModuleByService() {
        import('./dynamic/dynamic.module').then(m => m.DynamicRuntimeModule)
            .then(elementModuleOrFactory => {
                return this._compiler.compileModuleAsync(elementModuleOrFactory);
            })
            .then((compiledModule: NgModuleFactory<any>) => {
                return this._dynamicComponentService.createAndAttachModuleAsync(compiledModule, this._injector, {vcr: this._dynamicContainer});
            })
            .then(({moduleRef, componentRef}: ICreatedModule) => {
                console.log(componentRef); // componentRef.componentRef.instance
            });
    }

    /******************************** Dynamic Load Start*****************************************/

    private index = 0;

    createModule(compiledModule: NgModuleFactory<any>, injector: Injector, vcr): CreatedModule {
        // Create an instance of the module from the moduleFactory
        const createdModule = compiledModule.create(injector) as NgModuleRef<any>;
        // Take the bootstrap component from that module.
        // Using any, as in AngularV8 the InternalNgModuleRef no longer gets exported.
        const type = (createdModule as any)._bootstrapComponents[0];
        const factory = createdModule.componentFactoryResolver.resolveComponentFactory(type);
        const componentRef = vcr.createComponent(factory);
        return {
            moduleRef: createdModule,
            componentRef: componentRef,
        };
    }

    viewRender(moduleType: Type<any>): void {
        // console.log("viewRender =====> ", moduleType);
        this._compiler.compileModuleAsync(moduleType).then((compiledModule: NgModuleFactory<any>) => {
            this._dynamicContainer.clear();
            const {moduleRef, componentRef} = this.createModule(compiledModule, this._injector, this._dynamicContainer);
        });
    }

    dynamicLoadModule() {
        import('./dynamic/dynamic.module').then(m => m.DynamicRuntimeModule).then(elementModuleOrFactory => {
            this.viewRender(elementModuleOrFactory);
        });
    }

    updateDynamicModule() {
        const webpackJsonp = window["webpackJsonp"] || [];
        const appComponentId = "./src/app/dynamic/AppComponent.ts";
        const dialogComponentId = "./src/app/dynamic/DialogComponent.ts";
        const repeatComponentId = "./src/app/dynamic/RepeatComponent.ts";
        const floatComponentId = "./src/app/dynamic/FloatComponent.ts";

        const moduleId = "./src/app/dynamic/dynamic.module.ts";
        const chunkId = "dynamic-dynamic-module";
        const chunkIndex = webpackJsonp.findIndex(item => item[0][0] == chunkId);
        if (chunkIndex > -1) {
            // 清理掉，后面会重新添加
            webpackJsonp.splice(chunkIndex, 1);
        }
        const hackResultFunc = this.dynamicModuleHacker(chunkId, moduleId);
        const result = hackResultFunc();
        // console.log('update =====> result: ', result);
        if (result) {
            // 清除webpack的缓存，这里需要将模块中所有的component都删掉，否则会报异常：
            // Type AppComponent is part of the declarations of 2 modules: DynamicRuntimeModule and DynamicRuntimeModule
            delete require.cache[appComponentId];
            delete require.cache[dialogComponentId];
            delete require.cache[repeatComponentId];
            delete require.cache[floatComponentId];
            delete require.cache[moduleId];
            // 重新渲染页面
            result.then(module => {
                this.viewRender(module.DynamicRuntimeModule);
            });
        }
    }

    dynamicLoadMinModule() {
        import('./min-module/min.module').then(module => {
            this.viewRender(module.DynamicMinModule);
        });
    }

    updateMinModule() {
        const webpackJsonp = window["webpackJsonp"] || [];
        const appComponentId = "./src/app/min-module/AppComponent.ts";
        const moduleId = "./src/app/min-module/min.module.ts";
        const chunkId = "min-module-min-module";
        const chunkIndex = webpackJsonp.findIndex(item => item[0][0] == chunkId);
        // console.log('update =====> chunk: ', chunkIndex);
        if (chunkIndex > -1) {
            // 清理掉，后面会重新添加
            webpackJsonp.splice(chunkIndex, 1);
        }

        const hackResultFunc = this.minModuleHacker(chunkId, moduleId);
        const result = hackResultFunc();
        // console.log('update =====> result: ', result);
        if (result) {
            // 清除webpack的缓存
            delete require.cache[appComponentId];
            delete require.cache[moduleId];
            // 重新渲染页面
            result.then(module => {
                this.viewRender(module.DynamicMinModule);
            });
        }
    }

    dynamicLoadTestModule() {
        import('./test/test.module').then(module => {
            this.viewRender(module.TestModule);
        });
    }

    updateTestModule() {
        const webpackJsonp = window["webpackJsonp"] || [];
        const componentId = "./src/app/test/test.component.ts";
        const moduleId = "./src/app/test/test.module.ts";
        const chunkId = "test-test-module";
        const chunkIndex = webpackJsonp.findIndex(item => item[0][0] == chunkId);
        // console.log('update =====> chunk: ', chunkIndex);
        if (chunkIndex > -1) {
            // 清理掉，后面会重新添加
            webpackJsonp.splice(chunkIndex, 1);
        }

        const hackResultFunc = this.testModuleHacker(chunkId, moduleId);
        const result = hackResultFunc();
        // console.log('update =====> result: ', result);
        if (result) {
            // 清除webpack的缓存
            delete require.cache[componentId];
            delete require.cache[moduleId];
            // 重新渲染页面
            result.then(module => {
                this.viewRender(module.TestModule);
            });
        }
    }

    getTestModuleBundle() {
        this.index = this.index + 1;
        return `
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([['test-test-module'], {

                
"./src/app/test/test.component.ts":
(function (module, __webpack_exports__, __webpack_require__) {
    // 1.生成固定代码，模块名称动态改变
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    __webpack_require__.d(__webpack_exports__, "TestComponent", function () {
        return TestComponent;
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
var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
let TestComponent = class TestComponent {
    constructor() {
        console.log('TestComponent =====> update-${this.index}');
    }
};
TestComponent = __decorate([
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"]({
        selector: 'app-test',
        template: \`
        <h4>Test component update-${this.index}</h4>
    \`
    }),
    __metadata("design:paramtypes", [])
], TestComponent);

    
})
        ,
                
"./src/app/test/test.module.ts":
(function (module, __webpack_exports__, __webpack_require__) {
    // 1.生成固定代码，模块名称动态改变
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    __webpack_require__.d(__webpack_exports__, "TestModule", function () {
        return TestModule;
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
var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
var _test_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./test.component */ "./src/app/test/test.component.ts");
let TestModule = class TestModule {
    constructor() {
        console.log("TestModule =====> update-${this.index}");
    }
};
TestModule = __decorate([
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"]({
        imports: [],
        declarations: [_test_component__WEBPACK_IMPORTED_MODULE_1__["TestComponent"]],
        exports: [],
        bootstrap: [_test_component__WEBPACK_IMPORTED_MODULE_1__["TestComponent"]]
    }),
    __metadata("design:paramtypes", [])
], TestModule);

    
})
}]);
        
        `;
    }

    testModuleHacker(chunkId, moduleId) {
        return eval(`
            (function () {
                ${this.getTestModuleBundle()};
                
                return __webpack_require__.e('${chunkId}').then(__webpack_require__.bind(null, '${moduleId}'));
            })
        `);
    }

    minModuleHacker(chunkId, moduleId) {
        return eval(`
            (function () {
                ${this.getMinModuleBundle()};
                
                return __webpack_require__.e('${chunkId}').then(__webpack_require__.bind(null, '${moduleId}'));
            })
        `);
    }

    getMinModuleBundle() {
        this.index = this.index + 1;
        return `
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
                    template: \`
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
                    \`,
                    styles: [\`        
                    \`]
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
                            const prop = row[0].replace(/(['"])/g, '\\\\$1');
                            i18nZhSetter[prop] = row[1];
                            i18nEnSetter[prop] = row[2];
                        });
                        translateService.setTranslation('zh', i18nZhSetter, true);
                        translateService.setTranslation('en', i18nEnSetter, true);
                        const language = 'en';
                        _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_2__["TranslateHelper"]["changeLanguage"](this.translateService, language);
                        this.dataBus.i18n = {};
                        i18n.data.forEach(row => {
                            const prop = row[0].replace(/(['"])/g, '\\\\$1');
                            this.dataBus.i18n[prop] = this.translateService.instant(prop);
                        });
                        _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_2__["TranslateHelper"]["languageChangEvent"].subscribe((langInfo) => {
                            i18n.data.forEach(row => {
                                const prop = row[0].replace(/(['"])/g, '\\\\$1');
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

        `;
    }

    dynamicModuleHacker(chunkId, moduleId) {
        return eval(`
            (function () {
                ${this.getDynamicModuleBundle()};
                
                return __webpack_require__.e('${chunkId}').then(__webpack_require__.bind(null, '${moduleId}'));
            })
        `);
    }

    getDynamicModuleBundle() {
        this.index = this.index + 1;
        return `
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([['dynamic-dynamic-module'], {

    "./src/app/dynamic/AppComponent.ts":
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
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
            var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
            var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/http.js");
            var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ngx-translate/core */ "./node_modules/@ngx-translate/core/__ivy_ngcc__/fesm2015/ngx-translate-core.js");
            var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");
            var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/common.js");
            var _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @rdkmaster/jigsaw */ "./node_modules/@rdkmaster/jigsaw/__ivy_ngcc__/fesm2015/rdkmaster-jigsaw.js");
            var _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @awade/uid-sdk */ "./node_modules/@awade/uid-sdk/__ivy_ngcc__/fesm2015/awade-uid-sdk.js");
            var _DialogComponent__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./DialogComponent */ "./src/app/dynamic/DialogComponent.ts");
            var _RepeatComponent__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./RepeatComponent */ "./src/app/dynamic/RepeatComponent.ts");
            var _FloatComponent__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./FloatComponent */ "./src/app/dynamic/FloatComponent.ts");
            let AppComponent = class AppComponent {
                constructor(route, router, location, _popupService, http, zone, eventBus, dataBus, translateService, cdr) {
                    this.route = route;
                    this.router = router;
                    this.location = location;
                    this._popupService = _popupService;
                    this.http = http;
                    this.zone = zone;
                    this.eventBus = eventBus;
                    this.dataBus = dataBus;
                    this.translateService = translateService;
                    this.cdr = cdr;
                    // 存放所有订阅事件
                    this._subscribers = [];
                    this._internalVariable = {};
                    this.jigsawTable21_data = new _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["TableData"]();
                    this._subscribers.push(this.eventBus.subscribe(["updateTable", "updateTableD"], $event => {
                        try {
                            this.jigsawTable21_data.fromObject(this.dataBus.tableData ? this.dataBus.tableData : {header: [], field: [], data: []});
                        } catch (e) {
                            console.error('convert TableData from memory failed: ', e);
                        }
                    }));
                    console.log('AppComponent =====> update ${this.index}');
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

                get jigsawTabs18() {
                    return this._jigsawTabs18;
                }

                set jigsawTabs18(value) {
                    if (!value || value === this._jigsawTabs18) {
                        return;
                    }
                    this._jigsawTabs18 = value;
                }

                get awadeTabsLayout19() {
                    return this._awadeTabsLayout19;
                }

                set awadeTabsLayout19(value) {
                    if (!value || value === this._awadeTabsLayout19) {
                        return;
                    }
                    this._awadeTabsLayout19 = value;
                }

                get jigsawButton20() {
                    return this._jigsawButton20;
                }

                set jigsawButton20(value) {
                    if (!value || value === this._jigsawButton20) {
                        return;
                    }
                    this._jigsawButton20 = value;
                }

                get jigsawTable21() {
                    return this._jigsawTable21;
                }

                set jigsawTable21(value) {
                    if (!value || value === this._jigsawTable21) {
                        return;
                    }
                    this._jigsawTable21 = value;
                }

                get jigsawButton23() {
                    return this._jigsawButton23;
                }

                set jigsawButton23(value) {
                    if (!value || value === this._jigsawButton23) {
                        return;
                    }
                    this._jigsawButton23 = value;
                }

                get span34() {
                    return this._span34;
                }

                set span34(value) {
                    if (!value || value === this._span34) {
                        return;
                    }
                    this._span34 = value;
                }

                get span35() {
                    return this._span35;
                }

                set span35(value) {
                    if (!value || value === this._span35) {
                        return;
                    }
                    this._span35 = value;
                }

                get awadeTabsLayout22() {
                    return this._awadeTabsLayout22;
                }

                set awadeTabsLayout22(value) {
                    if (!value || value === this._awadeTabsLayout22) {
                        return;
                    }
                    this._awadeTabsLayout22 = value;
                }

                get awadeRepeat27() {
                    return this._awadeRepeat27;
                }

                set awadeRepeat27(value) {
                    if (!value || value === this._awadeRepeat27) {
                        return;
                    }
                    this._awadeRepeat27 = value;
                }

                get jigsawButton28() {
                    return this._jigsawButton28;
                }

                set jigsawButton28(value) {
                    if (!value || value === this._jigsawButton28) {
                        return;
                    }
                    this._jigsawButton28 = value;
                }

                get jigsawFloat29() {
                    return this._jigsawFloat29;
                }

                set jigsawFloat29(value) {
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

                jigsawButton20_click($event) {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            yield (() => __awaiter(this, void 0, void 0, function* () {
                                // 自定义代码块
                                this.dataBus.tableData = {
                                    header: ["new1-${this.index}", "new2-${this.index}", "new3-${this.index}", "new4-${this.index}"],
                                    field: ["field1", "field2", "field3", "field4"],
                                    data: [
                                        ["cell11", "cell12", "cell13", "cell14"],
                                        ["cell21", "cell22", "cell23", "cell24"],
                                        ["cell31", "cell32", "cell33", "cell34"],
                                        ["cell41", "cell42", "cell43", "cell44"],
                                        ["cell51", "cell52", "cell53", "cell54"]
                                    ]
                                };
                            }))();
                            (() => {
                                // 发送事件到事件总线
                                this.eventBus.emit('updateTable', {});
                            })();
                        } catch (err) {
                            console.log('do actions error: ', err);
                        }
                    });
                }

                jigsawButton23_click($event) {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            let $result;
                            yield (() => __awaiter(this, void 0, void 0, function* () {
                                // 对话框
                                let option = {
                                    modal: true,
                                    showBorder: true
                                };
                                option.showEffect = _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["PopupEffect"]["fadeIn"];
                                option.hideEffect = _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["PopupEffect"]["fadeOut"];
                                const initData = {caption: ''};
                                const jigsawButton23_click_dialog_DialogComponent = this._popupService.popup(_DialogComponent__WEBPACK_IMPORTED_MODULE_7__["DialogComponent"], option, initData);
                                return new Promise(resolve => jigsawButton23_click_dialog_DialogComponent.answer.subscribe((result) => {
                                    if (jigsawButton23_click_dialog_DialogComponent) {
                                        jigsawButton23_click_dialog_DialogComponent.answer.unsubscribe();
                                    }
                                    $result = result;
                                    resolve(result);
                                }));
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
                    });
                }

                _afterViewInitActions() {
                }

                _onDestroyActions() {
                }

                ngOnInit() {
                    this.eventBus.emit('AppComponent_onInit');
                    this.route.params.subscribe((params) => {
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
                                ["cell11", "cell12", "cell13"],
                                ["cell21", "cell22", "cell23"],
                                ["cell31", "cell32", "cell33"] //row3
                            ]
                        };
                    } catch (e) {
                        console.error('init raw value failed: ', e);
                        rt_jigsawTable21_data = {};
                    }
                    this.jigsawTable21_data.fromObject(rt_jigsawTable21_data);
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
                        this.awadeRepeat27_iterateWith = _RepeatComponent__WEBPACK_IMPORTED_MODULE_8__["RepeatComponent"];
                    } catch (e) {
                    }
                    try {
                        this.jigsawFloat29_jigsawFloatTarget = _FloatComponent__WEBPACK_IMPORTED_MODULE_9__["FloatComponent"];
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
            };
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('root', {static: false}),
                __metadata("design:type", Object),
                __metadata("design:paramtypes", [Object])
            ], AppComponent.prototype, "root", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('jigsawTabs18', {static: false}),
                __metadata("design:type", typeof (_a = typeof JigsawTab !== "undefined" && JigsawTab) === "function" ? _a : Object),
                __metadata("design:paramtypes", [typeof (_b = typeof _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["JigsawTab"] !== "undefined" && _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["JigsawTab"]) === "function" ? _b : Object])
            ], AppComponent.prototype, "jigsawTabs18", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('awadeTabsLayout19', {static: false}),
                __metadata("design:type", Object),
                __metadata("design:paramtypes", [Object])
            ], AppComponent.prototype, "awadeTabsLayout19", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('jigsawButton20', {static: false}),
                __metadata("design:type", typeof (_c = typeof JigsawButton !== "undefined" && JigsawButton) === "function" ? _c : Object),
                __metadata("design:paramtypes", [typeof (_d = typeof _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["JigsawButton"] !== "undefined" && _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["JigsawButton"]) === "function" ? _d : Object])
            ], AppComponent.prototype, "jigsawButton20", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('jigsawTable21', {static: false}),
                __metadata("design:type", typeof (_e = typeof JigsawTable !== "undefined" && JigsawTable) === "function" ? _e : Object),
                __metadata("design:paramtypes", [typeof (_f = typeof _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["JigsawTable"] !== "undefined" && _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["JigsawTable"]) === "function" ? _f : Object])
            ], AppComponent.prototype, "jigsawTable21", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('jigsawButton23', {static: false}),
                __metadata("design:type", typeof (_g = typeof JigsawButton !== "undefined" && JigsawButton) === "function" ? _g : Object),
                __metadata("design:paramtypes", [typeof (_h = typeof _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["JigsawButton"] !== "undefined" && _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["JigsawButton"]) === "function" ? _h : Object])
            ], AppComponent.prototype, "jigsawButton23", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('span34', {static: false}),
                __metadata("design:type", Object),
                __metadata("design:paramtypes", [Object])
            ], AppComponent.prototype, "span34", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('span35', {static: false}),
                __metadata("design:type", Object),
                __metadata("design:paramtypes", [Object])
            ], AppComponent.prototype, "span35", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('awadeTabsLayout22', {static: false}),
                __metadata("design:type", Object),
                __metadata("design:paramtypes", [Object])
            ], AppComponent.prototype, "awadeTabsLayout22", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('awadeRepeat27', {static: false}),
                __metadata("design:type", Object),
                __metadata("design:paramtypes", [Object])
            ], AppComponent.prototype, "awadeRepeat27", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('jigsawButton28', {static: false}),
                __metadata("design:type", typeof (_j = typeof JigsawButton !== "undefined" && JigsawButton) === "function" ? _j : Object),
                __metadata("design:paramtypes", [typeof (_k = typeof _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["JigsawButton"] !== "undefined" && _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["JigsawButton"]) === "function" ? _k : Object])
            ], AppComponent.prototype, "jigsawButton28", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('jigsawFloat29', {static: false}),
                __metadata("design:type", Object),
                __metadata("design:paramtypes", [Object])
            ], AppComponent.prototype, "jigsawFloat29", null);
            AppComponent = __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"]({
                    selector: 'awade-dynamic-app',
                    template: \`
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
                                                                                   [width]="'100%'">update-${this.index}
                                                                    </jigsaw-button>
                                                                </div>
                                                                <div style="min-width:40px; max-width:40px;"></div>
                                                                <div style="width:80px; height:32px; flex-shrink: 0;;display:flex;justify-content:flex-start;align-items:center">
                                                                    <jigsaw-button (click)="jigsawButton23_click($event)" #jigsawButton23
                                                                                   agent="274917b4-a682-4f1b-87cb-d4ffabd6e122" class="jigsawButton23_class"
                                                                                   [width]="'100%'">dialog-${this.index}
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
                    \`,
                    styles: [\`

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

                    \`]
                }),
                __metadata("design:paramtypes", [typeof (_l = typeof _angular_router__WEBPACK_IMPORTED_MODULE_3__["ActivatedRoute"] !== "undefined" && _angular_router__WEBPACK_IMPORTED_MODULE_3__["ActivatedRoute"]) === "function" ? _l : Object, typeof (_m = typeof _angular_router__WEBPACK_IMPORTED_MODULE_3__["Router"] !== "undefined" && _angular_router__WEBPACK_IMPORTED_MODULE_3__["Router"]) === "function" ? _m : Object, typeof (_o = typeof _angular_common__WEBPACK_IMPORTED_MODULE_4__["Location"] !== "undefined" && _angular_common__WEBPACK_IMPORTED_MODULE_4__["Location"]) === "function" ? _o : Object, typeof (_p = typeof _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["PopupService"] !== "undefined" && _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["PopupService"]) === "function" ? _p : Object, typeof (_q = typeof _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"] !== "undefined" && _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]) === "function" ? _q : Object, typeof (_r = typeof _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"] !== "undefined" && _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"]) === "function" ? _r : Object, typeof (_s = typeof _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__["EventBus"] !== "undefined" && _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__["EventBus"]) === "function" ? _s : Object, typeof (_t = typeof _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__["DataBus"] !== "undefined" && _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__["DataBus"]) === "function" ? _t : Object, typeof (_u = typeof _ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__["TranslateService"] !== "undefined" && _ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__["TranslateService"]) === "function" ? _u : Object, typeof (_v = typeof _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"] !== "undefined" && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"]) === "function" ? _v : Object])
            ], AppComponent);
            ;
            var __uid_ts_1585191784155;


        }),

    "./src/app/dynamic/DialogComponent.ts":
        (function (module, __webpack_exports__, __webpack_require__) {
            // 1.生成固定代码，模块名称动态改变
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__.d(__webpack_exports__, "DialogComponent", function () {
                return DialogComponent;
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
            var _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @rdkmaster/jigsaw */ "./node_modules/@rdkmaster/jigsaw/__ivy_ngcc__/fesm2015/rdkmaster-jigsaw.js");
            var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
            var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/http.js");
            var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ngx-translate/core */ "./node_modules/@ngx-translate/core/__ivy_ngcc__/fesm2015/ngx-translate-core.js");
            var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");
            var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/common.js");
            var _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @awade/uid-sdk */ "./node_modules/@awade/uid-sdk/__ivy_ngcc__/fesm2015/awade-uid-sdk.js");
            let DialogComponent = class DialogComponent extends _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_0__["DialogBase"] {
                constructor(route, router, location, http, zone, eventBus, dataBus, translateService, cdr) {
                    super();
                    this.route = route;
                    this.router = router;
                    this.location = location;
                    this.http = http;
                    this.zone = zone;
                    this.eventBus = eventBus;
                    this.dataBus = dataBus;
                    this.translateService = translateService;
                    this.cdr = cdr;
                    // 存放所有订阅事件
                    this._subscribers = [];
                    this._internalVariable = {};
                    this.buttons = this.moduleRoot_buttons;
                    console.log('DialogComponent =====> update - ${this.index}')
                }

                get i18n() {
                    return this.dataBus.i18n;
                }

                get moduleRoot() {
                    return this._moduleRoot;
                }

                set moduleRoot(value) {
                    if (!value || value === this._moduleRoot) {
                        return;
                    }
                    this._moduleRoot = value;
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

                get p26() {
                    return this._p26;
                }

                set p26(value) {
                    if (!value || value === this._p26) {
                        return;
                    }
                    this._p26 = value;
                }

                get p30() {
                    return this._p30;
                }

                set p30(value) {
                    if (!value || value === this._p30) {
                        return;
                    }
                    this._p30 = value;
                }

                get jigsawButton33() {
                    return this._jigsawButton33;
                }

                set jigsawButton33(value) {
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

                moduleRoot_answer($event) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (this.dispose == undefined || typeof this.dispose != 'function') {
                            console.log("在设计态下，关闭对话框及按钮功能无法正常工作");
                            return;
                        }
                        // 防止出现，在emit之后的监听中，使用了某个变量，而该变量的初始化在用户自定义的 script 中，导致变量未初始化的问题
                        setTimeout(() => {
                            this.answer.emit($event);
                        }, 0);
                        try {
                            yield (() => __awaiter(this, void 0, void 0, function* () {
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
                            }))();
                        } catch (err) {
                            console.log('do actions error: ', err);
                        }
                    });
                }

                jigsawButton33_click($event) {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            yield (() => __awaiter(this, void 0, void 0, function* () {
                                // 自定义代码块
                                this.dataBus.tableData = {
                                    header: ["d-new1-${this.index}", "d-new2-${this.index}", "d-new3-${this.index}", "d-new4-${this.index}"],
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
                                };
                            }))();
                            (() => {
                                // 发送事件到事件总线
                                this.eventBus.emit('updateTableD', {});
                            })();
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
                    });
                }

                _afterViewInitActions() {
                }

                _onDestroyActions() {
                }

                ngOnInit() {
                    this.eventBus.emit('DialogComponent_onInit');
                    this.route.params.subscribe((params) => {
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
            };
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"]('moduleRoot', {static: false}),
                __metadata("design:type", typeof (_a = typeof JigsawDialog !== "undefined" && JigsawDialog) === "function" ? _a : Object),
                __metadata("design:paramtypes", [typeof (_b = typeof _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_0__["JigsawDialog"] !== "undefined" && _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_0__["JigsawDialog"]) === "function" ? _b : Object])
            ], DialogComponent.prototype, "moduleRoot", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"]('root', {static: false}),
                __metadata("design:type", Object),
                __metadata("design:paramtypes", [Object])
            ], DialogComponent.prototype, "root", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"]('p26', {static: false}),
                __metadata("design:type", Object),
                __metadata("design:paramtypes", [Object])
            ], DialogComponent.prototype, "p26", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"]('p30', {static: false}),
                __metadata("design:type", Object),
                __metadata("design:paramtypes", [Object])
            ], DialogComponent.prototype, "p30", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"]('jigsawButton33', {static: false}),
                __metadata("design:type", typeof (_c = typeof JigsawButton !== "undefined" && JigsawButton) === "function" ? _c : Object),
                __metadata("design:paramtypes", [typeof (_d = typeof _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_0__["JigsawButton"] !== "undefined" && _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_0__["JigsawButton"]) === "function" ? _d : Object])
            ], DialogComponent.prototype, "jigsawButton33", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"](_rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_0__["JigsawDialog"], {static: false}),
                __metadata("design:type", typeof (_e = typeof _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_0__["JigsawDialog"] !== "undefined" && _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_0__["JigsawDialog"]) === "function" ? _e : Object)
            ], DialogComponent.prototype, "dialog", void 0);
            DialogComponent = __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"]({
                    template: \`
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
                                                   [style.height]="'100%'">一段文本，这是一个对话框-${this.index}</p>
                                            </div>
                                            <div style="min-height:8px; max-height:8px;"></div>
                                        </div>
                                        <div style="min-width:24px; max-width:24px;"></div>
                                        <div style="width:80px; height:32px; flex-shrink: 0;;display:flex;justify-content:flex-start;align-items:center">
                                            <jigsaw-button (click)="jigsawButton33_click($event)" #jigsawButton33
                                                           agent="d44c4237-5e47-4cfd-96eb-c35ad988f821" class="jigsawButton33_class" [width]="'100%'">update-${this.index}
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
                    \`,
                    styles: [\`
                        .moduleRoot_class {
                            width: 600PX;
                            height: 480PX;
                        }
                    \`]
                }),
                __metadata("design:paramtypes", [typeof (_f = typeof _angular_router__WEBPACK_IMPORTED_MODULE_4__["ActivatedRoute"] !== "undefined" && _angular_router__WEBPACK_IMPORTED_MODULE_4__["ActivatedRoute"]) === "function" ? _f : Object, typeof (_g = typeof _angular_router__WEBPACK_IMPORTED_MODULE_4__["Router"] !== "undefined" && _angular_router__WEBPACK_IMPORTED_MODULE_4__["Router"]) === "function" ? _g : Object, typeof (_h = typeof _angular_common__WEBPACK_IMPORTED_MODULE_5__["Location"] !== "undefined" && _angular_common__WEBPACK_IMPORTED_MODULE_5__["Location"]) === "function" ? _h : Object, typeof (_j = typeof _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"] !== "undefined" && _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"]) === "function" ? _j : Object, typeof (_k = typeof _angular_core__WEBPACK_IMPORTED_MODULE_1__["NgZone"] !== "undefined" && _angular_core__WEBPACK_IMPORTED_MODULE_1__["NgZone"]) === "function" ? _k : Object, typeof (_l = typeof _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__["EventBus"] !== "undefined" && _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__["EventBus"]) === "function" ? _l : Object, typeof (_m = typeof _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__["DataBus"] !== "undefined" && _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__["DataBus"]) === "function" ? _m : Object, typeof (_o = typeof _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"] !== "undefined" && _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"]) === "function" ? _o : Object, typeof (_p = typeof _angular_core__WEBPACK_IMPORTED_MODULE_1__["ChangeDetectorRef"] !== "undefined" && _angular_core__WEBPACK_IMPORTED_MODULE_1__["ChangeDetectorRef"]) === "function" ? _p : Object])
            ], DialogComponent);
            ;
            var __uid_ts_1585189853899;


        }),

    "./src/app/dynamic/FloatComponent.ts":
        (function (module, __webpack_exports__, __webpack_require__) {
            // 1.生成固定代码，模块名称动态改变
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__.d(__webpack_exports__, "FloatComponent", function () {
                return FloatComponent;
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
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
            var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/http.js");
            var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ngx-translate/core */ "./node_modules/@ngx-translate/core/__ivy_ngcc__/fesm2015/ngx-translate-core.js");
            var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");
            var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/common.js");
            var _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @rdkmaster/jigsaw */ "./node_modules/@rdkmaster/jigsaw/__ivy_ngcc__/fesm2015/rdkmaster-jigsaw.js");
            var _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @awade/uid-sdk */ "./node_modules/@awade/uid-sdk/__ivy_ngcc__/fesm2015/awade-uid-sdk.js");
            let FloatComponent = class FloatComponent {
                constructor(route, router, location, http, zone, eventBus, dataBus, translateService, cdr) {
                    this.route = route;
                    this.router = router;
                    this.location = location;
                    this.http = http;
                    this.zone = zone;
                    this.eventBus = eventBus;
                    this.dataBus = dataBus;
                    this.translateService = translateService;
                    this.cdr = cdr;
                    // 存放所有订阅事件
                    this._subscribers = [];
                    this._internalVariable = {};
                    console.log(' FloatComponent =====> update-${this.index} ');
                    if (_rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["CommonUtils"]["isUndefined"](this.dataBus.abc)) {
                        console.log('xxx-${this.index}');
                    }
                }

                get i18n() {
                    return this.dataBus.i18n;
                }

                get moduleRoot() {
                    return this._moduleRoot;
                }

                set moduleRoot(value) {
                    if (!value || value === this._moduleRoot) {
                        return;
                    }
                    this._moduleRoot = value;
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

                get jigsawListLite24() {
                    return this._jigsawListLite24;
                }

                set jigsawListLite24(value) {
                    if (!value || value === this._jigsawListLite24) {
                        return;
                    }
                    this._jigsawListLite24 = value;
                }

                _onInitActions() {
                    return __awaiter(this, void 0, void 0, function* () {
                        // onInitActions加个空的await用于消除和旧版本promise的差异
                        yield (() => __awaiter(this, void 0, void 0, function* () {
                        }))();
                    });
                }

                _afterViewInitActions() {
                }

                _onDestroyActions() {
                }

                ngOnInit() {
                    this.eventBus.emit('FloatComponent_onInit');
                    this.route.params.subscribe((params) => {
                        this.routerParamValue = params[this.paramName];
                    });
                    let rt_jigsawListLite24_data;
                    try {
                        rt_jigsawListLite24_data = ["new1-${this.index}", "new2-${this.index}", "new3-${this.index}", "new4-${this.index}", "new5-${this.index}", "new6-${this.index}", "new7", "new8", "new9", "new0", "new03"];
                    } catch (e) {
                        console.error('init raw value failed: ', e);
                        rt_jigsawListLite24_data = {};
                    }
                    this.jigsawListLite24_data = _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["TableData"]["isTableData"](rt_jigsawListLite24_data) ? _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["TableData"]["toArray"](rt_jigsawListLite24_data) : rt_jigsawListLite24_data;
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
            };
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('moduleRoot', {static: false}),
                __metadata("design:type", Object),
                __metadata("design:paramtypes", [Object])
            ], FloatComponent.prototype, "moduleRoot", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('root', {static: false}),
                __metadata("design:type", Object),
                __metadata("design:paramtypes", [Object])
            ], FloatComponent.prototype, "root", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('jigsawListLite24', {static: false}),
                __metadata("design:type", typeof (_a = typeof JigsawListLite !== "undefined" && JigsawListLite) === "function" ? _a : Object),
                __metadata("design:paramtypes", [typeof (_b = typeof _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["JigsawListLite"] !== "undefined" && _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_5__["JigsawListLite"]) === "function" ? _b : Object])
            ], FloatComponent.prototype, "jigsawListLite24", null);
            FloatComponent = __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"]({
                    template: \`
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
                    \`,
                    styles: [\`

                        .moduleRoot_class {
                            width: 160PX;
                            height: 240PX;

                        }

                    \`]
                }),
                __metadata("design:paramtypes", [typeof (_c = typeof _angular_router__WEBPACK_IMPORTED_MODULE_3__["ActivatedRoute"] !== "undefined" && _angular_router__WEBPACK_IMPORTED_MODULE_3__["ActivatedRoute"]) === "function" ? _c : Object, typeof (_d = typeof _angular_router__WEBPACK_IMPORTED_MODULE_3__["Router"] !== "undefined" && _angular_router__WEBPACK_IMPORTED_MODULE_3__["Router"]) === "function" ? _d : Object, typeof (_e = typeof _angular_common__WEBPACK_IMPORTED_MODULE_4__["Location"] !== "undefined" && _angular_common__WEBPACK_IMPORTED_MODULE_4__["Location"]) === "function" ? _e : Object, typeof (_f = typeof _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"] !== "undefined" && _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]) === "function" ? _f : Object, typeof (_g = typeof _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"] !== "undefined" && _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"]) === "function" ? _g : Object, typeof (_h = typeof _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__["EventBus"] !== "undefined" && _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__["EventBus"]) === "function" ? _h : Object, typeof (_j = typeof _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__["DataBus"] !== "undefined" && _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_6__["DataBus"]) === "function" ? _j : Object, typeof (_k = typeof _ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__["TranslateService"] !== "undefined" && _ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__["TranslateService"]) === "function" ? _k : Object, typeof (_l = typeof _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"] !== "undefined" && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"]) === "function" ? _l : Object])
            ], FloatComponent);
            ;
            var __uid_ts_1585189853905;


        }),

    "./src/app/dynamic/RepeatComponent.ts":
        (function (module, __webpack_exports__, __webpack_require__) {
            // 1.生成固定代码，模块名称动态改变
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__.d(__webpack_exports__, "RepeatComponent", function () {
                return RepeatComponent;
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
            var _a, _b, _c, _d, _e, _f, _g, _h;
            var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
            var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/http.js");
            var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ngx-translate/core */ "./node_modules/@ngx-translate/core/__ivy_ngcc__/fesm2015/ngx-translate-core.js");
            var _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @rdkmaster/jigsaw */ "./node_modules/@rdkmaster/jigsaw/__ivy_ngcc__/fesm2015/rdkmaster-jigsaw.js");
            var _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @awade/uid-sdk */ "./node_modules/@awade/uid-sdk/__ivy_ngcc__/fesm2015/awade-uid-sdk.js");
            let RepeatComponent = class RepeatComponent extends _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_4__["RepeatViewBase"] {
                constructor(http, zone, eventBus, dataBus, translateService, cdr) {
                    super();
                    this.http = http;
                    this.zone = zone;
                    this.eventBus = eventBus;
                    this.dataBus = dataBus;
                    this.translateService = translateService;
                    this.cdr = cdr;
                    // 存放所有订阅事件
                    this._subscribers = [];
                    this._internalVariable = {};
                }

                get i18n() {
                    return this.dataBus.i18n;
                }

                get moduleRoot() {
                    return this._moduleRoot;
                }

                set moduleRoot(value) {
                    if (!value || value === this._moduleRoot) {
                        return;
                    }
                    this._moduleRoot = value;
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

                get jigsawIcon25() {
                    return this._jigsawIcon25;
                }

                set jigsawIcon25(value) {
                    if (!value || value === this._jigsawIcon25) {
                        return;
                    }
                    this._jigsawIcon25 = value;
                }

                _onInitActions() {
                    return __awaiter(this, void 0, void 0, function* () {
                        // onInitActions加个空的await用于消除和旧版本promise的差异
                        yield (() => __awaiter(this, void 0, void 0, function* () {
                        }))();
                    });
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
                        this.jigsawIcon25_text = 'New${this.index}' + this.it;
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
            };
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('moduleRoot', {static: false}),
                __metadata("design:type", Object),
                __metadata("design:paramtypes", [Object])
            ], RepeatComponent.prototype, "moduleRoot", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('root', {static: false}),
                __metadata("design:type", Object),
                __metadata("design:paramtypes", [Object])
            ], RepeatComponent.prototype, "root", null);
            __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"]('jigsawIcon25', {static: false}),
                __metadata("design:type", typeof (_a = typeof JigsawIcon !== "undefined" && JigsawIcon) === "function" ? _a : Object),
                __metadata("design:paramtypes", [typeof (_b = typeof _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_3__["JigsawIcon"] !== "undefined" && _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_3__["JigsawIcon"]) === "function" ? _b : Object])
            ], RepeatComponent.prototype, "jigsawIcon25", null);
            RepeatComponent = __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"]({
                    template: \`
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
                    \`,
                    styles: [\`

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

                    \`]
                }),
                __metadata("design:paramtypes", [typeof (_c = typeof _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"] !== "undefined" && _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]) === "function" ? _c : Object, typeof (_d = typeof _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"] !== "undefined" && _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"]) === "function" ? _d : Object, typeof (_e = typeof _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_4__["EventBus"] !== "undefined" && _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_4__["EventBus"]) === "function" ? _e : Object, typeof (_f = typeof _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_4__["DataBus"] !== "undefined" && _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_4__["DataBus"]) === "function" ? _f : Object, typeof (_g = typeof _ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__["TranslateService"] !== "undefined" && _ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__["TranslateService"]) === "function" ? _g : Object, typeof (_h = typeof _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"] !== "undefined" && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"]) === "function" ? _h : Object])
            ], RepeatComponent);
            ;
            var __uid_ts_1585189853921;


        }),

    "./src/app/dynamic/dynamic.module.ts":
        (function (module, __webpack_exports__, __webpack_require__) {
            // 1.生成固定代码，模块名称动态改变
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__.d(__webpack_exports__, "DynamicRuntimeModule", function () {
                return DynamicRuntimeModule;
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
            var _AppComponent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./AppComponent */ "./src/app/dynamic/AppComponent.ts");
            var _ngx_perfect_scrollbar__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ngx-perfect-scrollbar */ "./node_modules/ngx-perfect-scrollbar/__ivy_ngcc__/dist/ngx-perfect-scrollbar.es5.js");
            var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ngx-translate/core */ "./node_modules/@ngx-translate/core/__ivy_ngcc__/fesm2015/ngx-translate-core.js");
            var _angular_common_http__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/http.js");
            var _angular_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");
            var _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @awade/uid-sdk */ "./node_modules/@awade/uid-sdk/__ivy_ngcc__/fesm2015/awade-uid-sdk.js");
            var _DialogComponent__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./DialogComponent */ "./src/app/dynamic/DialogComponent.ts");
            var _RepeatComponent__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./RepeatComponent */ "./src/app/dynamic/RepeatComponent.ts");
            var _FloatComponent__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./FloatComponent */ "./src/app/dynamic/FloatComponent.ts");
            let DynamicRuntimeModule = class DynamicRuntimeModule {
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
                            const prop = row[0].replace(/(['"])/g, '\\\\$1');
                            i18nZhSetter[prop] = row[1];
                            i18nEnSetter[prop] = row[2];
                        });
                        translateService.setTranslation('zh', i18nZhSetter, true);
                        translateService.setTranslation('en', i18nEnSetter, true);
                        const language = 'en';
                        _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_2__["TranslateHelper"]["changeLanguage"](this.translateService, language);
                        this.dataBus.i18n = {};
                        i18n.data.forEach(row => {
                            const prop = row[0].replace(/(['"])/g, '\\\\$1');
                            this.dataBus.i18n[prop] = this.translateService.instant(prop);
                        });
                        _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_2__["TranslateHelper"]["languageChangEvent"].subscribe((langInfo) => {
                            i18n.data.forEach(row => {
                                const prop = row[0].replace(/(['"])/g, '\\\\$1');
                                this.dataBus.i18n[prop] = this.translateService.instant(prop);
                            });
                        });
                        console.log('DynamicRuntimeModule.constructor =====> update ${this.index}');
                    }
                }
            };
            DynamicRuntimeModule = __decorate([
                _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"]({
                    imports: [
                        _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
                        _rdkmaster_jigsaw__WEBPACK_IMPORTED_MODULE_2__["JigsawModule"],
                        _ngx_perfect_scrollbar__WEBPACK_IMPORTED_MODULE_4__["PerfectScrollbarModule"],
                        _angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClientModule"],
                        _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_8__["AwadeRepeatModule"],
                        _ngx_translate_core__WEBPACK_IMPORTED_MODULE_5__["TranslateModule"]["forRoot"](),
                        _angular_router__WEBPACK_IMPORTED_MODULE_7__["RouterModule"]["forChild"]([])
                    ],
                    declarations: [_AppComponent__WEBPACK_IMPORTED_MODULE_3__["AppComponent"], _DialogComponent__WEBPACK_IMPORTED_MODULE_9__["DialogComponent"], _RepeatComponent__WEBPACK_IMPORTED_MODULE_10__["RepeatComponent"], _FloatComponent__WEBPACK_IMPORTED_MODULE_11__["FloatComponent"]],
                    exports: [],
                    entryComponents: [_AppComponent__WEBPACK_IMPORTED_MODULE_3__["AppComponent"], _DialogComponent__WEBPACK_IMPORTED_MODULE_9__["DialogComponent"], _RepeatComponent__WEBPACK_IMPORTED_MODULE_10__["RepeatComponent"], _FloatComponent__WEBPACK_IMPORTED_MODULE_11__["FloatComponent"]],
                    bootstrap: [_AppComponent__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]],
                    providers: [_awade_uid_sdk__WEBPACK_IMPORTED_MODULE_8__["EventBus"], _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_8__["DataBus"], _ngx_translate_core__WEBPACK_IMPORTED_MODULE_5__["TranslateService"]]
                }),
                __metadata("design:paramtypes", [typeof (_a = typeof _ngx_translate_core__WEBPACK_IMPORTED_MODULE_5__["TranslateService"] !== "undefined" && _ngx_translate_core__WEBPACK_IMPORTED_MODULE_5__["TranslateService"]) === "function" ? _a : Object, typeof (_b = typeof _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_8__["DataBus"] !== "undefined" && _awade_uid_sdk__WEBPACK_IMPORTED_MODULE_8__["DataBus"]) === "function" ? _b : Object, typeof (_c = typeof _angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"] !== "undefined" && _angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"]) === "function" ? _c : Object])
            ], DynamicRuntimeModule);


        })

}]);
        `;
    }

    private ts;
    private _identifierCount = 0;
    private _ctorParameters: string = '';

    generateTestModule() {
        const bundle = this.generateTestBundle("test-test-module");
        console.log(`generateTestBundle =====> bundle: 
${bundle}`);
    }

    /**
     * @param chunkId: "test-test-module"
     */
    generateTestBundle(chunkId: string) {
        const code = require('!!raw-loader!./test/test.component.ts').default;
        const moduleCode = require('!!raw-loader!./test/test.module.ts').default;
        const componentChunk = this.generateChunk(code, './src/app/test/test.component.ts', "TestComponent");
        const moduleChunk = this.generateChunk(moduleCode, './src/app/test/test.module.ts', "TestModule");
        return `
            (window["webpackJsonp"] = window["webpackJsonp"] || []).push([['${chunkId}'], {

                ${componentChunk},
                ${moduleChunk}

            }]);
        `
    }

    generateMinModule() {
        const bundle = this.generateMinBundle("min-module-min-module");
        console.log(`generateMinModule =====> bundle: 
${bundle}`);
    }

    /**
     * @param chunkId: "dynamic-dynamic-module"
     */
    generateMinBundle(chunkId: string) {
        const appComponentCode = require('!!raw-loader!./min-module/AppComponent.ts').default;
        const minModuleCode = require('!!raw-loader!./min-module/min.module.ts').default;
        const appComponentChunk = this.generateChunk(appComponentCode, './src/app/min-module/AppComponent.ts', "AppComponent");
        const minModuleChunk = this.generateChunk(minModuleCode, './src/app/min-module/min.module.ts', "DynamicMinModule");
        return `
            (window["webpackJsonp"] = window["webpackJsonp"] || []).push([['${chunkId}'], {

                ${appComponentChunk},
                ${minModuleChunk}

            }]);
        `
    }

    generateDynamicModule() {
        const bundle = this.generateDynamicBundle("dynamic-dynamic-module");
        console.log(`generateDynamicModule =====> bundle: 
${bundle}`);
    }

    /**
     * @param chunkId: "dynamic-dynamic-module"
     */
    generateDynamicBundle(chunkId: string) {
        const components = ['AppComponent', 'DialogComponent', 'FloatComponent', 'RepeatComponent'];
        let chunks = components.map(component => {
            const code = require(`!!raw-loader!./dynamic/${component}.ts`).default;
            return this.generateChunk(code, `./src/app/dynamic/${component}.ts`, component);
        }).join(', ');
        const dynamicModuleCode = require('!!raw-loader!./dynamic/dynamic.module.ts').default;
        const dynamicModuleChunk = this.generateChunk(dynamicModuleCode, './src/app/dynamic/dynamic.module.ts', "DynamicRuntimeModule");
        return `
            (window["webpackJsonp"] = window["webpackJsonp"] || []).push([['${chunkId}'], {

                ${chunks},
                ${dynamicModuleChunk}

            }]);
        `
    }

    /**
     * @param source ts代码
     * @param moduleId 模块名称：'./src/app/dynamic/AppComponent.ts'
     * @param component 模块类名： AppComponent
     */
    generateChunk(source: string, moduleId: string, component: string) {
        this._identifierCount = 0;
        this._ctorParameters = '';

        let result = this.ts.transpileModule(source, {
            compilerOptions: {
                experimentalDecorators: true,
                emitDecoratorMetadata: true,
                module: this.ts.ModuleKind.ESNext,
                target: this.ts.ScriptTarget.ES2015
            },
            transformers: {
                before: [this.transformer(component)]
            }
        });

        return `
"${moduleId}":
(function (module, __webpack_exports__, __webpack_require__) {
    // 1.生成固定代码，模块名称动态改变
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    __webpack_require__.d(__webpack_exports__, "${component}", function () {
        return ${component};
    });
    var __metadata = (undefined && undefined.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    // 2.这个__importDefault暂不清楚作用是啥，不知道是否需要添加
    var __importDefault = (undefined && undefined.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : {"default": mod};
    };
    
    ${result.outputText}
    
})
        `;
    }

    transformer(component: string) {
        return (context) => {
            const visit: any = (node) => {
                // import
                if (this.ts.isImportDeclaration(node)) {
                    return this.ts.createIdentifier(this.transformImportClause(node));
                }

                // constructor： 生成 ctorParameters，这个应该可以不加
                // 后面如果有必要，再追加到生成的chunk中
                if (this.ts.isConstructorDeclaration(node)) {
                    this._ctorParameters = `
                    ${component}.ctorParameters = () => [
                        ${node.parameters.map(parameter => {
                        const identifier = parameter.type ? parameter.type.typeName.getFullText().trim() : '';
                        const pkg = identifierPackages[identifier];
                        return pkg && pkg.name ? `{type: ${pkg.name}["${identifier}"]}` : '';
                    }).filter(item => item != '').join(`,
                        `)}
                    ];`;
                }

                // Decorator：使用Object()包围组件名称，这个貌似可以不加
                if (this.ts.isIdentifier(node) && (node.parent && this.ts.isCallExpression(node.parent)) &&
                    (node.parent.parent && this.ts.isDecorator(node.parent.parent))) {
                    const identifier = node.getFullText().trim();
                    const pkg = identifierPackages[identifier];
                    if (pkg) {
                        // return this.ts.createIdentifier(`Object(${pkg.name}["${identifier}"])`);
                    }
                }

                // 属性访问
                if (this.ts.isPropertyAccessExpression(node) && this.ts.isIdentifier(node.getChildAt(0))) {
                    const identifier = node.getChildAt(0).getFullText().trim();
                    const pkg = identifierPackages[identifier];
                    if (pkg) {
                        const property = node.getChildAt(2).getFullText().trim();
                        return this.ts.createIdentifier(`${pkg.name}["${identifier}"]["${property}"]`);
                    }
                }

                // 属性引用：注意这里要排除类定义
                if (this.ts.isIdentifier(node) && !this.ts.isPropertyAccessExpression(node.parent) &&
                    !this.ts.isClassDeclaration(node.parent)) {
                    const identifier = node.getText().trim();
                    const pkg = identifierPackages[identifier];
                    if (pkg) {
                        return this.ts.createIdentifier(`${pkg.name}["${identifier}"]`);
                    }
                }

                // todo 去掉生成的代码，最后面的 export {AppComponent}; 这里可能有问题，后面需要修改
                if (node.kind == this.ts.SyntaxKind.ExportKeyword) {
                    return '';
                }

                return this.ts.visitEachChild(node, (child) => visit(child), context);
            };

            return (node) => this.ts.visitNode(node, visit);
        };
    }

    transformImportClause(node) {
        const children: any = node.getChildren();
        const clauseNode = children.find(n => this.ts.isImportClause(n));
        if (!clauseNode) {
            return '';
        }

        const identifiersNode = clauseNode.getChildren().find(n => this.ts.isNamedImports(n) || this.ts.isNamespaceImport(n));
        if (!identifiersNode) {
            return '';
        }

        // ['ChangeDetectorRef', 'Component', 'NgZone', 'ViewChild']
        let ids = identifiersNode.getFullText().replace(/[{}]/g, '').split(/,/);
        // '@angular/core'
        let packageName = children.find(n => this.ts.isStringLiteral(n)).getFullText().trim().replace(/['"\\]/g, '');

        /*const pkgPath = path.join(__dirname, '../../node_modules', packageName, 'package.json');
        let pkgInfo;
        if (existsSync(pkgPath)) {
            pkgInfo = require(pkgPath);
        }
        const modulePath = pkgInfo && pkgInfo.module ? path.join(packageName, pkgInfo.module) : packageName + '.js';
        const refPath = `../${path.join('node_modules', modulePath)}`.replace(/\\/g, '/');*/
        //todo 这个路径如何生成？
        let refPath = `./node_modules/${packageName}/__ivy_ngcc__/fesm2015/xxxxxxxx.js`;
        if (/^\./g.test(packageName)) {
            refPath = `./src/app/min-module/AppComponent.ts`;
        }

        const wrapped = `_${packageName.replace(/^[^\w]+/g, '').replace(/[^\w]/g, '_')}__WEBPACK_IMPORTED_MODULE_${this._identifierCount++}__`;
        ids.forEach(i => {
            const identifier = i.trim();
            identifierPackages[identifier] = {name: wrapped, path: refPath}
        });
        return `var ${wrapped} = __webpack_require__(/*! ${packageName} */ "${refPath}");`;
    }

    private _initTypescriptCompiler(source: string): boolean {
        try {
            this.ts = eval(`(function() { ${source}; return ts; })();`);
        } catch (e) {
            console.error('unable to init typescript compiler! detail:', e);
            return false;
        }
        return true;
    }

    generateChunkTest() {
        const appComponentCode = require('!!raw-loader!./min-module/AppComponent.ts').default;
        const appComponentChunk = this.generateChunk(appComponentCode, './src/app/min-module/AppComponent.ts', "AppComponent");
        console.log('generateChunkTest =====> ', appComponentChunk);
    }



    /******************************** Dynamic Load End*****************************************/

    ngOnDestroy(): void {
        this._handler && this._handler.unsubscribe();
    }

    test() {
        const code1 = require('!!raw-loader!./test/test.component.ts');
        const code2 = require('./test/test.component.ts');
        console.log(code1);
        console.log(code2);

        const code3 = require('!!raw-loader!../../temp/dy-rest.js');
        console.log(code3);

    }

}
