import { CITIES } from '#seed/cities';
import { COMPANY_SURNAMES, NEIGHBORHOODS, PROVIDER_TRADE_WORDS, STREETS } from '#seed/names';
import { addDays, between, cnpj, createRandom, digits, pick } from '#seed/random';
import type { ProviderEntity } from './contracts';
import { ProviderKindEnum, ProviderStatusEnum } from './enums';

/** [nome fantasia, razão social, CNPJ, telefone, local, cidade, UF, aberto 24h, ativo] */
type ProviderRow = [string, string, string, string, string, string, string, boolean, boolean];

const TOTAL_PER_KIND = 40;
const GENERATION_SEED = 20261029;

// Registros do protótipo, por tipo de prestador (telas antigas do GERE).
const prototypeRows: Record<ProviderKindEnum, ProviderRow[]> = {
  [ProviderKindEnum.Parking]: [
    ['Andressa Carolina', 'GASPAR E GASPAR AUTO PECAS LTDA', '15742386000128', '6299999999', '', 'São João da Boa Vista', 'SP', true, true],
    ['Estacionamento Teste', 'Estacionamento Teste', '37125646000105', '6299999999', '', 'Goiânia', 'GO', false, true],
    ['teste 1', 'teste 1', '58585459000184', '1111111111', 'teste', 'Várzea Paulista', 'SP', false, true],
    ['teste estacionamento', 'teste estacionamento', '82546604000100', '65985858585', '', 'Goiânia', 'GO', true, true],
    ['Park Center Bueno', 'Park Center Estacionamentos LTDA', '29481736000152', '6232415566', 'Av. T-10, 1200', 'Goiânia', 'GO', true, false],
    ['Pátio Seguro Anápolis', 'Pátio Seguro Guarda de Veículos LTDA', '41862579000130', '6233219090', 'Rod. BR-153, km 48', 'Anápolis', 'GO', true, true],
  ],
  [ProviderKindEnum.AutoCenter]: [
    ['Auto Center Pinheiros', 'Pinheiros Serviços Automotivos LTDA', '61938472000133', '1138124400', 'Rua dos Pinheiros, 870', 'São Paulo', 'SP', false, true],
    ['Centro Automotivo Sul', 'Sul Centro Automotivo EIRELI', '58273914000155', '5133442211', 'Av. Ipiranga, 5400', 'Porto Alegre', 'RS', false, true],
    ['Hiper Car Revisões', 'Hiper Car Comércio e Serviços LTDA', '87152649000123', '6232026677', 'Av. 85, 2100', 'Goiânia', 'GO', false, true],
    ['Ipê Amarelo Auto Center', 'Ipê Amarelo Pneus LTDA', '98263751000106', '6134567788', 'SIA Trecho 3', 'Brasília', 'DF', false, false],
    ['Pneus & Cia Goiânia', 'Pneus e Cia Comércio LTDA', '47185236000190', '62991234567', 'Av. Anhanguera, 300', 'Goiânia', 'GO', true, true],
    ['Rota Auto Center', 'Rota Serviços Automotivos LTDA', '36518294000177', '3132219988', 'Av. Amazonas, 4500', 'Belo Horizonte', 'MG', false, true],
    ['Speed Pneus Campinas', 'Speed Pneus e Rodas LTDA', '52963184000141', '19998887766', 'Av. John Boyd Dunlop, 900', 'Campinas', 'SP', true, true],
    ['Vale Auto Center', 'Vale do Paraíba Automotivos LTDA', '24817369000108', '1239414455', '', 'São José dos Campos', 'SP', false, true],
  ],
  [ProviderKindEnum.Rental]: [
    ['Aluga Fácil Goiânia', 'Aluga Fácil Locação de Veículos LTDA', '19374628000145', '6230901122', 'Aeroporto Santa Genoveva', 'Goiânia', 'GO', true, true],
    ['Rodar Locadora', 'Rodar Locação e Serviços LTDA', '63829174000120', '1130457788', 'Av. Washington Luís, 7000', 'São Paulo', 'SP', true, true],
    ['Carro Já Locações', 'Carro Já Locadora de Veículos EIRELI', '48271936000169', '2125558899', 'Av. Brasil, 1500', 'Rio de Janeiro', 'RJ', false, true],
    ['Move Car Uberlândia', 'Move Car Locadora LTDA', '71938264000188', '3432104455', '', 'Uberlândia', 'MG', false, false],
    ['Locadora Cerrado', 'Cerrado Rent a Car LTDA', '35172948000111', '6132228899', 'Aeroporto JK', 'Brasília', 'DF', true, true],
    ['Viaje Bem Locações', 'Viaje Bem Locações LTDA', '28619473000196', '4130217766', 'Av. Sete de Setembro, 3000', 'Curitiba', 'PR', false, true],
  ],
  [ProviderKindEnum.Tracker]: [
    ['Rastrei Já', 'Rastrei Já Tecnologia LTDA', '42618397000154', '1140028922', '', 'São Paulo', 'SP', true, true],
    ['Sat Guard Rastreamento', 'Sat Guard Monitoramento LTDA', '57193824000136', '6235451200', 'Rua 9, 450', 'Goiânia', 'GO', true, true],
    ['Localiza Frota Tracker', 'Frota Tracker Sistemas EIRELI', '13849275000102', '3135009900', '', 'Belo Horizonte', 'MG', true, false],
    ['Olho Vivo Rastreadores', 'Olho Vivo Segurança Veicular LTDA', '69284713000183', '8133214466', 'Av. Boa Viagem, 2200', 'Recife', 'PE', true, true],
    ['Geo Track Brasil', 'Geo Track Brasil LTDA', '84126937000140', '4832107788', '', 'Florianópolis', 'SC', false, true],
  ],
  [ProviderKindEnum.Glass]: [
    ['Vidraçaria Cristal', 'Cristal Vidros Automotivos LTDA', '26394817000175', '6232874411', 'Av. Castelo Branco, 1800', 'Goiânia', 'GO', false, true],
    ['Auto Glass Center', 'Auto Glass Comércio de Vidros LTDA', '73619284000159', '1135681122', 'Rua Vergueiro, 5200', 'São Paulo', 'SP', false, true],
    ['Para-brisa Express', 'Express Para-brisas EIRELI', '39182746000127', '2134567700', '', 'Rio de Janeiro', 'RJ', true, true],
    ['Vitrine Vidros', 'Vitrine Vidros e Acessórios LTDA', '58291473000104', '6233125544', '', 'Anápolis', 'GO', false, false],
    ['Glass Fix Curitiba', 'Glass Fix Reparos LTDA', '91736482000168', '4133349900', 'Av. Marechal Floriano, 4100', 'Curitiba', 'PR', false, true],
    ['Visão Total Vidros', 'Visão Total Comércio LTDA', '47362918000191', '7132451188', 'Av. Paralela, 8000', 'Salvador', 'BA', false, true],
  ],
  [ProviderKindEnum.AutoParts]: [
    ['Auto Peças Anhanguera', 'Anhanguera Comércio de Peças LTDA', '17293846000113', '6232331100', 'Av. Anhanguera, 5100', 'Goiânia', 'GO', false, true],
    ['Casa do Motor', 'Casa do Motor Peças e Serviços LTDA', '62918374000146', '1132146655', 'Rua Santa Ifigênia, 300', 'São Paulo', 'SP', false, true],
    ['Central das Peças', 'Central das Peças EIRELI', '38471629000180', '3132458877', '', 'Belo Horizonte', 'MG', false, true],
    ['Distribuidora Freio Bom', 'Freio Bom Distribuidora LTDA', '74619283000125', '6232897744', 'Rua 44, 120', 'Goiânia', 'GO', false, false],
    ['Gaspar Auto Peças', 'GASPAR E GASPAR AUTO PECAS LTDA', '15742386000209', '1936231122', '', 'São João da Boa Vista', 'SP', false, true],
    ['Mega Peças Brasília', 'Mega Peças Automotivas LTDA', '29374816000157', '6133561100', 'SIA Trecho 2', 'Brasília', 'DF', false, true],
    ['Motor Vivo Peças', 'Motor Vivo Comércio LTDA', '83917264000162', '4133227788', '', 'Curitiba', 'PR', false, true],
    ['Peça Certa Campinas', 'Peça Certa Distribuidora LTDA', '46281937000118', '1932549900', 'Av. das Amoreiras, 2000', 'Campinas', 'SP', false, true],
    ['Peças Rio Verde', 'Rio Verde Autopeças LTDA', '57382916000134', '6436219988', '', 'Rio Verde', 'GO', false, true],
    ['Rei das Peças', 'Rei das Peças Comércio EIRELI', '18392746000170', '8134268811', 'Av. Recife, 3100', 'Recife', 'PE', false, true],
    ['Roda Viva Autopeças', 'Roda Viva Peças e Acessórios LTDA', '92736418000197', '5132214477', 'Av. Farrapos, 1500', 'Porto Alegre', 'RS', false, false],
    ['Sul Peças Joinville', 'Sul Peças Automotivas LTDA', '35918274000149', '4734331122', '', 'Joinville', 'SC', false, true],
    ['Turbo Peças 24h', 'Turbo Peças Comércio LTDA', '61827394000106', '62998765432', 'Av. Perimetral Norte, 800', 'Goiânia', 'GO', true, true],
    ['Universo Autopeças', 'Universo Autopeças LTDA', '27461938000183', '7133289900', '', 'Salvador', 'BA', false, true],
  ],
  [ProviderKindEnum.Assistance]: [
    ['Assistência 24h Cerrado', 'Cerrado Assistência Veicular LTDA', '43729186000165', '08007071234', '', 'Goiânia', 'GO', true, true],
    ['Socorro Já Guinchos', 'Socorro Já Remoções LTDA', '68192734000121', '6299871122', 'Rod. GO-060, km 5', 'Trindade', 'GO', true, true],
    ['Chaveiro Auto Express', 'Auto Express Chaveiros EIRELI', '19283746000158', '1133456677', '', 'São Paulo', 'SP', true, true],
    ['Pane Zero Assistência', 'Pane Zero Serviços LTDA', '74918263000137', '3133218800', 'Anel Rodoviário, km 12', 'Belo Horizonte', 'MG', true, false],
    ['Resgate Sul', 'Resgate Sul Assistência LTDA', '56391827000110', '5130129988', '', 'Porto Alegre', 'RS', true, true],
    ['Guincho Nordeste', 'Nordeste Guinchos e Remoções LTDA', '82736194000182', '8130309911', 'BR-101, km 70', 'Recife', 'PE', true, true],
  ],
};

const toEntity = (kind: ProviderKindEnum, row: ProviderRow, index: number): ProviderEntity => {
  const [name, legalName, document, phone, location, city, state, isOpen24h, isActive] = row;
  return {
    id: `provider-${kind}-${index + 1}`,
    kind,
    name,
    legalName,
    document,
    phone,
    location,
    city,
    state,
    isOpen24h,
    status: isActive ? ProviderStatusEnum.Active : ProviderStatusEnum.Inactive,
    createdAt: addDays('2026-01-01T12:00:00.000Z', index),
  };
};

const generateRows = (kind: ProviderKindEnum, count: number): ProviderRow[] => {
  const random = createRandom(GENERATION_SEED + Object.values(ProviderKindEnum).indexOf(kind));
  return Array.from({ length: count }, (): ProviderRow => {
    const city = pick(random, CITIES);
    const name = `${pick(random, PROVIDER_TRADE_WORDS)} ${pick(random, NEIGHBORHOODS)}`;
    return [
      name,
      `${name} ${pick(random, COMPANY_SURNAMES)} LTDA`,
      cnpj(random),
      `${city.ddd}${digits(random, 8)}`,
      random() > 0.4 ? `${pick(random, STREETS)}, ${between(random, 10, 3000)}` : '',
      city.city,
      city.state,
      random() > 0.7,
      random() > 0.15,
    ];
  });
};

/** 40 registros por tipo: os do protótipo primeiro, depois gerados com semente fixa. */
export const buildProviderSeed = (): ProviderEntity[] => Object.values(ProviderKindEnum).flatMap((kind) => {
  const rows = [
    ...prototypeRows[kind],
    ...generateRows(kind, TOTAL_PER_KIND - prototypeRows[kind].length),
  ];
  return rows.map((row, index) => toEntity(kind, row, index));
});
