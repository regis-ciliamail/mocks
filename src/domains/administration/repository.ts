import { NotFoundError, UnprocessableError } from '#shared/errors';
import { paginate, type PagedResult } from '#shared/paging';
import { comparePtBr, matchesSearch, normalizeSearchText } from '#shared/text';
import {
  type AdministrationQuery,
  type CatalogItemEntity,
  type CatalogItemFormInput,
  type GsreCityEntity,
  type GsreCityFormInput,
  type PrvRange,
  type PrvRuleEntity,
  type PrvRuleFormInput,
} from './contracts';
import { CatalogKindEnum } from './enums';
import { catalogHasDocument, catalogHasSeverity, PRV_RANGES_ERROR_MESSAGES, validatePrvRanges } from './rules';

export type AdministrationSeed = {
  catalogItems: CatalogItemEntity[];
  gsreCities: GsreCityEntity[];
  prvRules: PrvRuleEntity[];
};

const copyRule = (rule: PrvRuleEntity): PrvRuleEntity => ({
  ...rule,
  ranges: rule.ranges.map((range) => ({ ...range })),
});

export class AdministrationRepository {
  private readonly catalogItems: CatalogItemEntity[];

  private readonly gsreCities: GsreCityEntity[];

  private readonly prvRules: PrvRuleEntity[];

  private nextId = 1;

  constructor(seed: AdministrationSeed) {
    this.catalogItems = seed.catalogItems.map((item) => ({ ...item }));
    this.gsreCities = seed.gsreCities.map((city) => ({ ...city }));
    this.prvRules = seed.prvRules.map(copyRule);
  }

  listCatalogItems(kind: CatalogKindEnum, query: AdministrationQuery): PagedResult<CatalogItemEntity> {
    const items = this.catalogItems
      .filter((item) => item.kind === kind)
      .filter((item) => matchesSearch(query.search, [item.name, item.code], [item.document]))
      .sort((a, b) => comparePtBr(a.name, b.name) || comparePtBr(a.document, b.document));
    return paginate(
      items.map((item) => ({ ...item })),
      query.offset,
      query.limit,
    );
  }

  findCatalogItem(kind: CatalogKindEnum, id: string): CatalogItemEntity {
    return { ...this.findCatalogOrThrow(kind, id) };
  }

  createCatalogItem(kind: CatalogKindEnum, input: CatalogItemFormInput): CatalogItemEntity {
    const item: CatalogItemEntity = { id: this.createId(kind), kind, ...this.toCatalogValues(kind, input) };
    this.catalogItems.push(item);
    return { ...item };
  }

  updateCatalogItem(kind: CatalogKindEnum, id: string, input: CatalogItemFormInput): CatalogItemEntity {
    const item = this.findCatalogOrThrow(kind, id);
    Object.assign(item, this.toCatalogValues(kind, input));
    return { ...item };
  }

  setCatalogItemActive(kind: CatalogKindEnum, id: string, isActive: boolean): CatalogItemEntity {
    const item = this.findCatalogOrThrow(kind, id);
    item.isActive = isActive;
    return { ...item };
  }

  listGsreCities(query: AdministrationQuery): PagedResult<GsreCityEntity> {
    const items = this.gsreCities
      .filter((city) => matchesSearch(query.search, [city.name, city.code, city.state]))
      .sort((a, b) => comparePtBr(a.name, b.name) || comparePtBr(a.state, b.state));
    return paginate(
      items.map((city) => ({ ...city })),
      query.offset,
      query.limit,
    );
  }

  createGsreCity(input: GsreCityFormInput): GsreCityEntity {
    const city: GsreCityEntity = {
      id: this.createId('gsre-city'),
      name: normalizeSearchText(input.name).toUpperCase(),
      code: input.code,
      state: normalizeSearchText(input.state).toUpperCase(),
    };
    this.gsreCities.push(city);
    return { ...city };
  }

  listPrvRules(query: AdministrationQuery): PagedResult<PrvRuleEntity> {
    const items = this.prvRules
      .filter((rule) => matchesSearch(query.search, [rule.name]))
      .sort((a, b) => comparePtBr(a.name, b.name));
    return paginate(items.map(copyRule), query.offset, query.limit);
  }

  findPrvRule(id: string): PrvRuleEntity {
    return copyRule(this.findPrvRuleOrThrow(id));
  }

  createPrvRule(input: PrvRuleFormInput): PrvRuleEntity {
    // Regra nova nasce com uma faixa aberta; o usuário ajusta em "Faixas".
    const rule: PrvRuleEntity = {
      id: this.createId('prv-rule'),
      ...input,
      ranges: [{ min: 0, max: null, value: 0 }],
    };
    this.prvRules.push(rule);
    return copyRule(rule);
  }

  updatePrvRule(id: string, input: PrvRuleFormInput): PrvRuleEntity {
    const rule = this.findPrvRuleOrThrow(id);
    Object.assign(rule, input);
    return copyRule(rule);
  }

  savePrvRuleRanges(id: string, ranges: readonly PrvRange[]): PrvRuleEntity {
    const rule = this.findPrvRuleOrThrow(id);
    const error = validatePrvRanges(ranges, rule.calculation);
    if (error) throw new UnprocessableError('PRV_RANGES_INVALID', PRV_RANGES_ERROR_MESSAGES[error]);
    rule.ranges = ranges.map((range) => ({ ...range }));
    return copyRule(rule);
  }

  private toCatalogValues(kind: CatalogKindEnum, input: CatalogItemFormInput) {
    // Campos que o cadastro não tem não são guardados, mesmo que cheguem preenchidos.
    return {
      name: input.name,
      code: input.code,
      isActive: input.isActive,
      document: catalogHasDocument(kind) ? input.document : '',
      severity: catalogHasSeverity(kind) ? input.severity : null,
    };
  }

  private findCatalogOrThrow(kind: CatalogKindEnum, id: string): CatalogItemEntity {
    const item = this.catalogItems.find((entry) => entry.kind === kind && entry.id === id);
    if (!item) throw new NotFoundError('Cadastro', id);
    return item;
  }

  private findPrvRuleOrThrow(id: string): PrvRuleEntity {
    const rule = this.prvRules.find((entry) => entry.id === id);
    if (!rule) throw new NotFoundError('Regra PRV', id);
    return rule;
  }

  private createId(prefix: string): string {
    const id = `${prefix}-new-${this.nextId}`;
    this.nextId += 1;
    return id;
  }
}
