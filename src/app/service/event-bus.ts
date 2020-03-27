import {EventEmitter, Injectable} from "@angular/core";

@Injectable()
export class EventBus {
    public eventBus = new EventEmitter();

    public subscribe(triggers: string[], callback) {
        return this.eventBus.subscribe(event => {
            if(!(triggers instanceof Array) || !triggers.find(t => t == event.type)) return;
            console.log('triggers: ', triggers, ', event: ', event);
            callback(event.data);
        });
    }

    public emit(trigger: string, data?: any) {
        console.log('emitting event with event bus, trigger: ', trigger, ', data:', data);
        this.eventBus.emit({type: trigger, data: data});
    }
}
