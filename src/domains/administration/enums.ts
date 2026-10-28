/**
 * Cadastros auxiliares com a mesma forma (nome, código, status), um por tela do submenu
 * "Administrativo" do sistema antigo. Valores espelham o contrato da API (ainda a definir — ver GERE-1447).
 */
export enum CatalogKindEnum {
  Branches = 'branches',
  OccurrenceReasons = 'occurrence_reasons',
  Benefits = 'benefits',
  BlockReasons = 'block_reasons',
  SpecialPrograms = 'special_programs',
  QualificationPrograms = 'qualification_programs',
  SpecializedProviders = 'specialized_providers',
  EconomicGroups = 'economic_groups',
  DiscountGroups = 'discount_groups',
}

export enum OccurrenceSeverityEnum {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export enum PrvRuleTypeEnum {
  BudgetFees = 'budget_fees',
  DeadlineBonus = 'deadline_bonus',
  PartsDiscount = 'parts_discount',
}

export enum PrvCalculationEnum {
  Percentage = 'percentage',
  FixedAmount = 'fixed_amount',
}
