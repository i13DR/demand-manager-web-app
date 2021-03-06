import {Component, DoCheck, EventEmitter, Input, Output} from "@angular/core";
import {AngularFire} from "angularfire2";
import * as _ from "lodash";
import {DeviceDetail} from "../../../../both/interfaces/device.interface";
//noinspection TypeScriptCheckImport
import template from "./device-detail.component.html";

@Component({
    moduleId: module.id,
    selector: 'device-detail',
    template: template

})
export class DeviceDetailComponent implements DoCheck {
    @Input() inputDevices: string[];
    @Output() isLoading: EventEmitter<boolean> = new EventEmitter<boolean>();

    oldDevices: string[];
    oldLength = 0;

    devicesPowerObserver = {};
    devicesPowerSubscription = {};

    devicesLocationObserver = {};
    devicesLocationSubscription = {};

    devicesInfoObserver = {};
    devicesInfoSubscription = {};

    devicesActivityObserver = {};
    devicesActivitySubscription = {};

    devicesSchedulePeriodObserver = {};
    devicesSchedulePeriodSubscription = {};

    devicesHardwareObserver = {};
    devicesHardwareSubscription = {};

    devicesSettingsObserver = {};
    devicesSettingSubscription = {};

    devicesPowerModelObserver = {};
    devicesPowerModelSubscription = {};

    devices = {};
    devicesToSumPower = [];
    devicesToSumLocation = [];
    devicesToSumSchedule = [];
    devicesIdToSumSchedule = [];
    devicesIdToSumSettings = [];
    devicesIdToSumPowerModel = [];

    constructor(private af: AngularFire) {

    }

    ngDoCheck() {
        let newLength = this.inputDevices.length;
        if (this.oldLength !== newLength) {
            this.oldLength = newLength;
            this.observeDevices();
        }
    }

    observeDevices() {
        let devicesToAdd = _.difference(this.inputDevices, this.oldDevices);
        let devicesToRemove = _.difference(this.oldDevices, this.inputDevices);
        for (let newDevice of devicesToAdd) {
            this.initiateLoading(newDevice);
        }
        for (let oldDevice of devicesToRemove) {
            this.removeDeviceFromList(oldDevice);
        }
        //noinspection TypeScriptUnresolvedFunction
        this.oldDevices = _.cloneDeep(this.inputDevices);

    }

    initiateLoading(newDevice) {
        this.devices[newDevice] = {};

        this.devicesInfoObserver[newDevice] = this.af.database.object('/device/' + newDevice);
        this.devicesInfoSubscription[newDevice] = this.devicesInfoObserver[newDevice].subscribe((deviceData) => {
            this.devices[newDevice]['info'] = deviceData;
        });

        this.devicesActivityObserver[newDevice] = this.af.database.object('/activity-status/' + newDevice);
        this.devicesActivitySubscription[newDevice] = this.devicesActivityObserver[newDevice].subscribe((deviceData) => {
            this.devices[newDevice]['activity'] = deviceData;
            this.devices[newDevice]['key'] = deviceData.$key;
        });

        this.devicesSchedulePeriodObserver[newDevice] = this.af.database.object('/schedule-period/' + newDevice);
        this.devicesSchedulePeriodSubscription[newDevice] = this.devicesSchedulePeriodObserver[newDevice].subscribe((deviceData) => {
            this.devices[newDevice]['schedule-period'] = deviceData;
        });

        this.devicesHardwareObserver[newDevice] = this.af.database.object('/hardware/' + newDevice);
        this.devicesHardwareSubscription[newDevice] = this.devicesHardwareObserver[newDevice].subscribe((deviceData) => {
            this.devices[newDevice]['hardware'] = deviceData;
        });

        this.devicesSettingsObserver[newDevice] = this.af.database.object('/settings/' + newDevice);
        this.devicesSettingSubscription[newDevice] = this.devicesSettingsObserver[newDevice].subscribe((deviceData) => {
            this.devices[newDevice]['settings'] = deviceData;
        });

        this.devicesPowerModelObserver[newDevice] = this.af.database.object('/power-model/' + newDevice);
        this.devicesPowerModelSubscription[newDevice] = this.devicesPowerModelObserver[newDevice].subscribe((deviceData) => {
            this.devices[newDevice]['power-model'] = deviceData;
        });
    }

    loadPowers(newDevice) {
        if (!this.devicesPowerObserver[newDevice]) {
            this.isLoading.emit(true);
            this.devicesPowerObserver[newDevice] = this.af.database.object('/power/' + newDevice);
            this.devicesPowerSubscription[newDevice] = this.devicesPowerObserver[newDevice].subscribe((deviceData) => {
                this.devices[newDevice]['power'] = deviceData;
                this.isLoading.emit(false);
            });
        }
    }

    loadLocations(newDevice) {
        if (!this.devicesLocationObserver[newDevice]) {
            this.isLoading.emit(true);
            this.devicesLocationObserver[newDevice] = this.af.database.object('/location/' + newDevice);
            this.devicesLocationSubscription[newDevice] = this.devicesLocationObserver[newDevice].subscribe((deviceData) => {
                this.devices[newDevice]['location'] = deviceData;
                this.isLoading.emit(false);
            });
        }
    }

    removeDeviceFromList(oldDevice) {
        if (this.devicesPowerObserver[oldDevice])
            delete this.devicesPowerObserver[oldDevice];
        if (this.devicesLocationObserver[oldDevice])
            delete this.devicesLocationObserver[oldDevice];
        delete this.devicesInfoObserver[oldDevice];
        delete this.devicesActivityObserver[oldDevice];
        delete this.devicesSchedulePeriodObserver[oldDevice];
        delete this.devicesHardwareObserver[oldDevice];
        delete this.devicesSettingsObserver[oldDevice];
        delete this.devicesPowerModelObserver[oldDevice];

        delete this.devices[oldDevice];

        if (this.devicesPowerSubscription[oldDevice]) {
            this.devicesPowerSubscription[oldDevice].unsubscribe();
            delete this.devicesPowerSubscription[oldDevice];
        }

        this.devicesInfoSubscription[oldDevice].unsubscribe();
        delete this.devicesInfoSubscription[oldDevice];

        if (this.devicesLocationSubscription[oldDevice]) {
            this.devicesLocationSubscription[oldDevice].unsubscribe();
            delete this.devicesLocationSubscription[oldDevice];
        }

        this.devicesActivitySubscription[oldDevice].unsubscribe();
        delete this.devicesActivitySubscription[oldDevice];

        this.devicesSchedulePeriodSubscription[oldDevice].unsubscribe();
        delete this.devicesSchedulePeriodSubscription[oldDevice];

        this.devicesHardwareSubscription[oldDevice].unsubscribe();
        delete this.devicesHardwareSubscription[oldDevice];

        this.devicesSettingSubscription[oldDevice].unsubscribe();
        delete this.devicesSettingSubscription[oldDevice];

        this.devicesPowerModelSubscription[oldDevice].unsubscribe();
        delete this.devicesPowerModelSubscription[oldDevice];

    }

    getDevicesCount(): number {
        return _.size(this.devices);
    }

    getDeviceObjectsAsList(): DeviceDetail[] {
        return _.values(this.devices);
    }

    toggleView(device: DeviceDetail): void {
        if (device.visible || typeof device.visible === 'undefined') {
            this.devices[device['key']].visible = false;
        }
        else {
            this.devices[device['key']].visible = true;
        }
    }

    isVisiblePanel(device: DeviceDetail): boolean {
        if (typeof device.visible === 'undefined')
            return true;
        return device.visible;
    }

    toggleAll(visibility: boolean): void {
        for (let device of _.keys(this.devices)) {
            this.devices[device].visible = visibility;
        }
    }

    sumAll(): void {
        this.devicesToSumPower = [];
        _.forEach(this.devices, (profile, key) => {
            this.devicesToSumPower.push(profile['power']);
        });
        this.devicesToSumLocation = [];
        _.forEach(this.devices, (profile, key) => {
            this.devicesToSumLocation.push(profile['location']);
        });
        this.devicesToSumSchedule = [];
        this.devicesIdToSumSchedule = [];
        _.forEach(this.devices, (profile, key) => {
            this.devicesToSumSchedule.push(profile['schedule']);
            this.devicesIdToSumSchedule.push(profile['key']);
        });
        this.devicesIdToSumSettings = [];
        this.devicesIdToSumSettings = [];
        _.forEach(this.devices, (profile, key) => {
            this.devicesIdToSumSettings.push(profile['key']);
        });
        this.devicesIdToSumPowerModel = [];
        this.devicesIdToSumPowerModel = [];
        _.forEach(this.devices, (profile, key) => {
            this.devicesIdToSumPowerModel.push(profile['key']);
        });
    }

    clearSum(): void {
        this.devicesToSumPower = [];
        this.devicesToSumLocation = [];
        this.devicesToSumSchedule = [];
        this.devicesIdToSumSchedule = [];
        this.devicesIdToSumSettings = [];
        this.devicesIdToSumPowerModel = [];
    }

}