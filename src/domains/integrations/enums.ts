/** Valores espelham o contrato da API (ainda a definir — ver GERE-1444). */
export enum WorkshopSyncTypeEnum {
  Registration = 'registration',
  Accreditation = 'accreditation',
  PriceTable = 'price_table',
}

export enum WorkshopSyncStatusEnum {
  Pending = 'pending',
  Success = 'success',
  Error = 'error',
}

export enum RatingImportKindEnum {
  Workshop = 'workshop',
  AutoCenter = 'auto_center',
}

export enum RatingImportStatusEnum {
  Sent = 'sent',
  Processed = 'processed',
  Error = 'error',
}

export enum PrvImportStatusEnum {
  Sent = 'sent',
  ResultGenerated = 'result_generated',
  Error = 'error',
}

export enum LogDirectionEnum {
  Inbound = 'inbound',
  Outbound = 'outbound',
}

export enum HttpMethodEnum {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Delete = 'DELETE',
}

/** Faixa do status HTTP usada no filtro "Status" dos logs. */
export enum LogStatusGroupEnum {
  Success = 'success',
  ClientError = 'client_error',
  ServerError = 'server_error',
}
