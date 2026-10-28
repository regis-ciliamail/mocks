/** Valores espelham o contrato da API (ainda a definir — ver GERE-1441). */
export enum RatingTargetKindEnum {
  Workshop = 'workshop',
  AutoCenter = 'auto_center',
}

export enum RatingStatusEnum {
  Pending = 'pending',
  Sent = 'sent',
  Responded = 'responded',
  Error = 'error',
}

export enum RatingChannelEnum {
  Email = 'email',
  Sms = 'sms',
}

export enum RatingSortFieldEnum {
  Provider = 'provider',
  Customer = 'customer',
  SentAt = 'sent_at',
  RespondedAt = 'responded_at',
}
