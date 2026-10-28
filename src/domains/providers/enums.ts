/** Valores espelham o contrato da API (ainda a definir — ver GERE-1443). */
export enum ProviderKindEnum {
  Parking = 'parking',
  AutoCenter = 'auto_center',
  Rental = 'rental',
  Tracker = 'tracker',
  Glass = 'glass',
  AutoParts = 'auto_parts',
  Assistance = 'assistance',
}

export enum ProviderStatusEnum {
  Active = 'active',
  Inactive = 'inactive',
}

export enum ProviderSortFieldEnum {
  Name = 'name',
  Phone = 'phone',
  Location = 'location',
  City = 'city',
}
