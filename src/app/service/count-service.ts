import {Injectable} from "@angular/core";

@Injectable()
export class CountService {
    private _count = 0;

    constructor() {
        console.log("CountService =====> constructor");
    }

    public getCount(): number {
        return this._count;
    }

    public count(): void {
        this._count++;
        console.log("CountService =====> count: ", this._count);
    }
}
