import {
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    EmbeddedViewRef,
    Input,
    Type,
    ViewContainerRef
} from "@angular/core";

export class RepeatViewBase {
    it: any;
    index: number;
    odd: boolean;
    even: boolean;
    first: boolean;
    last: boolean;
    collection: Array<any>;
}

@Component({
    selector: 'awade-repeat-item',
    template: `
        <ng-template></ng-template>`
})
export class AwadeRepeatItem extends RepeatViewBase {
    @Input()
    public iterateWith: Type<RepeatViewBase>;
    @Input()
    public odd: boolean;
    @Input()
    public even: boolean;
    @Input()
    public first: boolean;
    @Input()
    public last: boolean;
    @Input()
    public index: number;
    @Input()
    public collection: Array<any>;

    private _data: any;

    @Input()
    public get data(): any {
        return this._data;
    }

    public set data(value: any) {
        if (value === this._data) {
            return;
        }
        this._data = value;
    }

    private _rendererRef: ComponentRef<RepeatViewBase> | EmbeddedViewRef<any>;

    constructor(public viewContainerRef: ViewContainerRef, public componentFactoryResolver: ComponentFactoryResolver, protected changeDetector: ChangeDetectorRef) {
        super();
    }

    /*
     * 渲染器制造工厂
     */
    private _rendererFactory(data) {
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.iterateWith);
        let componentRef = this.viewContainerRef.createComponent(componentFactory);
        componentRef.instance.it = this.data;
        componentRef.instance.index = this.index;
        componentRef.instance.odd = this.odd;
        componentRef.instance.even = this.even;
        componentRef.instance.first = this.first;
        componentRef.instance.last = this.last;
        componentRef.instance.collection = this.collection;
        return componentRef;
    }

    private _insertRenderer() {
        this._rendererRef = this._rendererFactory(this.data);
        this.changeDetector.detectChanges();
    }

    ngOnInit(): void {
        this._insertRenderer();
    }
}
