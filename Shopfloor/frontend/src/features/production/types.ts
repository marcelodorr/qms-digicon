export interface ProductionOrderDto { id:string; machineId:string; code:string; productName:string; targetQuantity:number; revision:string; plannedDate:string; sector:string; }
export interface OperationDto { id:string; poId:string; name:string; code:string; sector:string; }
