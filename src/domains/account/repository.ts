import { NotFoundError } from '#shared/errors';
import { paginate, type PagedResult } from '#shared/paging';
import { matchesSearch } from '#shared/text';
import type { CompaniesQuery, CompanyEntity } from './contracts';

export class AccountRepository {
  constructor(private readonly companies: readonly CompanyEntity[]) {}

  listCompanies(query: CompaniesQuery): PagedResult<CompanyEntity> {
    const filtered = this.companies.filter((company) => matchesSearch(query.search, [company.name], [company.document]));
    return paginate(filtered, query.offset, query.limit);
  }

  findCompany(id: string): CompanyEntity {
    const company = this.companies.find((item) => item.id === id);
    if (!company) throw new NotFoundError('Empresa', id);
    return company;
  }
}
