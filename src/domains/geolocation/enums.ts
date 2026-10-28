/** Valores espelham o contrato da API (ainda a definir — ver GERE-1435). */
export enum MapProviderKindEnum {
  Independent = 'independent',
  Dealership = 'dealership',
  AutoCenter = 'auto_center',
  Other = 'other',
  Parking = 'parking',
  Assistance = 'assistance',
  Towing = 'towing',
}

export enum MapServiceTypeEnum {
  Repair = 'repair',
  Maintenance = 'maintenance',
  BodyAndPaint = 'body_and_paint',
  Glass = 'glass',
  Towing = 'towing',
  Storage = 'storage',
}

export enum MapCategoryEnum {
  Light = 'light',
  Heavy = 'heavy',
  Motorcycle = 'motorcycle',
}

export enum VehicleBrandEnum {
  Fiat = 'fiat',
  Volkswagen = 'volkswagen',
  Chevrolet = 'chevrolet',
  Hyundai = 'hyundai',
  Toyota = 'toyota',
  Honda = 'honda',
  Renault = 'renault',
  Jeep = 'jeep',
}

export enum MapWorkshopTypeEnum {
  Mechanics = 'mechanics',
  BodyAndPaint = 'body_and_paint',
  Electrical = 'electrical',
}

export enum AutoCenterTypeEnum {
  Tires = 'tires',
  Alignment = 'alignment',
  QuickService = 'quick_service',
}
