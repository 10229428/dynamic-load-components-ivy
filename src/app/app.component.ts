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
    ViewChild,
    ViewContainerRef,
    ɵcreateInjector,
    ɵLifecycleHooksFeature,
    ɵrenderComponent
} from '@angular/core';
import {DynamicComponentService, ICreatedModule} from "./service/dynamic-component.service";

export type CreatedModule = {
    moduleRef: NgModuleRef<any>;
    componentRef?: ComponentRef<any>;
}

@Component({
    selector: 'awade-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
    title = 'Ivy Load';
    @ViewChild('dynamicContainer', {read: ViewContainerRef, static: false}) _dynamicContainer: ViewContainerRef;
    barRef: ComponentRef<any>;

    private _handler;

    constructor(private _injector: Injector,
                private _factoryResolver: ComponentFactoryResolver,
                private _dynamicComponentService: DynamicComponentService,
                private _compiler: Compiler,
                private _changeDetectorRef: ChangeDetectorRef) {
    }

    loadBarComponentWithRender() {
        import('./bar/bar.component').then(({BarComponent}) => {
            const barRef = ɵrenderComponent(BarComponent, {
                // host: 'awade-app',
                injector: this._injector,
                hostFeatures: [ɵLifecycleHooksFeature]
            });
            barRef.title = 'With ɵrenderComponent';
            this._handler = barRef.titleChanges.subscribe($event => {
                console.log('titleChanges =====> ', $event);
            });
        });
    }

    async loadBarComponentWithFactory() {
        if (!this.barRef) {
            const {BarComponent} = await import('./bar/bar.component');
            this.barRef = this._dynamicContainer.createComponent(this._factoryResolver.resolveComponentFactory(BarComponent));
            this.barRef.instance.title = 'With resolveComponentFactory';
            this._handler = this.barRef.instance.titleChanges.subscribe($event => {
                console.log('titleChanges =====> ', $event);
            });
        }
    }

    loadFoo() {
        import('./foo/foo.module').then(({FooModule}) => {
            const injector = ɵcreateInjector(FooModule, this._injector);
            const {FooComponent} = injector.get(FooModule);
            const barRef = ɵrenderComponent(FooComponent, {host: 'app-foo', injector: this._injector});
            barRef.title = 'Load Foo Module'; // 输入属性修改无效？
            this._handler = barRef.titleChanges.subscribe($event => {
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

    dynamicLoadModule() {
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

    dynamicLoadModule111() {
        import('./dynamic/dynamic.module').then(m => m.DynamicRuntimeModule)
            .then(elementModuleOrFactory => {
                return this._compiler.compileModuleAsync(elementModuleOrFactory);
            })
            .then((compiledModule: NgModuleFactory<any>) => {
                const {moduleRef, componentRef} = this.createModule(compiledModule, this._injector, this._dynamicContainer);
                console.log(moduleRef, componentRef);
            });
    }

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

    ngOnDestroy(): void {
        this._handler && this._handler.unsubscribe();
    }
}
