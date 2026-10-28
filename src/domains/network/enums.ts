/** Valores espelham o contrato da API (ainda a definir — ver Epic GERE-1387). */
export enum ServiceProviderKindEnum {
  Workshop = 'workshop',
  TowTruck = 'tow_truck',
  Appraiser = 'appraiser',
}

export enum ServiceProviderStatusEnum {
  Active = 'active',
  Suspended = 'suspended',
  Inactive = 'inactive',
}

export enum ServiceProviderSortFieldEnum {
  Name = 'name',
  Phone = 'phone',
  Location = 'location',
  Rating = 'rating',
  CurrentScore = 'current_score',
  TotalScore = 'total_score',
}

export enum WorkshopTypeEnum {
  Mechanics = 'mechanics',
  BodyAndPaint = 'body_and_paint',
  Electrical = 'electrical',
  Glass = 'glass',
}

export enum OccupationLevelEnum {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export enum BudgetingSystemEnum {
  Cilia = 'cilia',
  Audatex = 'audatex',
  Orion = 'orion',
}

export enum SpecialProgramEnum {
  Partner = 'partner',
  Premium = 'premium',
}
