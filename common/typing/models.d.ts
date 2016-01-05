interface IMonitor {
    id: string
    name: string
    type: string
    url: string
    keyword: string
    hostname: string
    interval: number
    startSecond: number
    isAdvanced: boolean
    startMinute: number
    up: boolean
    enabled: boolean
    modifiedDate: Date
    contactIds: number[]
    save()
}
interface IMonitorPing {
    monitorId:number;
    date:Date;
    up:boolean;
    reason:string;
    latency:number;
}
