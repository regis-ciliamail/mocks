import { z } from 'zod/v4';
import { csvEnumSchema, booleanQuerySchema } from '#shared/paging';
import {
  AutoCenterTypeEnum,
  MapCategoryEnum,
  MapProviderKindEnum,
  MapServiceTypeEnum,
  MapWorkshopTypeEnum,
  VehicleBrandEnum,
} from './enums';

export const mapProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(MapProviderKindEnum),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string().length(2),
  isReferenced: z.boolean(),
  serviceTypes: z.array(z.enum(MapServiceTypeEnum)),
  categories: z.array(z.enum(MapCategoryEnum)),
  vehicleBrands: z.array(z.enum(VehicleBrandEnum)),
  workshopTypes: z.array(z.enum(MapWorkshopTypeEnum)),
  autoCenterTypes: z.array(z.enum(AutoCenterTypeEnum)),
}).meta({ id: 'MapProvider' });

export const nearbyMapProviderSchema = mapProviderSchema.extend({
  distanceKm: z.number().min(0).describe('Distância em linha reta até o ponto de busca, em km.'),
});

export const referenceAddressSchema = z.object({
  id: z.string(),
  label: z.string(),
  latitude: z.number(),
  longitude: z.number(),
}).meta({ id: 'ReferenceAddress' });

export const referenceAddressesQuerySchema = z.object({
  term: z.string().optional().describe('Trecho do endereço; cada palavra precisa aparecer no resultado.'),
});

export const nearbyMapProvidersQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).describe('Latitude do ponto de busca.'),
  longitude: z.coerce.number().min(-180).max(180).describe('Longitude do ponto de busca.'),
  radiusKm: z.coerce.number().min(0.1).max(500).default(50).describe('Raio da busca, em km.'),
  serviceTypes: csvEnumSchema(MapServiceTypeEnum),
  categories: csvEnumSchema(MapCategoryEnum),
  vehicleBrands: csvEnumSchema(VehicleBrandEnum),
  workshopTypes: csvEnumSchema(MapWorkshopTypeEnum),
  autoCenterTypes: csvEnumSchema(AutoCenterTypeEnum),
  isReferenced: booleanQuerySchema,
});

export type ReferenceAddressEntity = z.infer<typeof referenceAddressSchema>;
export type MapProviderEntity = z.infer<typeof mapProviderSchema>;
export type NearbyMapProvider = z.infer<typeof nearbyMapProviderSchema>;
export type NearbyMapProvidersQuery = z.output<typeof nearbyMapProvidersQuerySchema>;
