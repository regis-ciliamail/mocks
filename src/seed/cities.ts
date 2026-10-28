export type CityRef = {
  city: string;
  state: string;
  /** DDD da cidade, usado para gerar telefones coerentes. */
  ddd: string;
  latitude: number;
  longitude: number;
};

/** Cidades usadas pelos seeds. Coordenadas do centro urbano, para o mapa e a busca por distância. */
export const CITIES: readonly CityRef[] = [
  { city: 'Goiânia', state: 'GO', ddd: '62', latitude: -16.6869, longitude: -49.2648 },
  { city: 'Anápolis', state: 'GO', ddd: '62', latitude: -16.3281, longitude: -48.9534 },
  { city: 'Aparecida de Goiânia', state: 'GO', ddd: '62', latitude: -16.8173, longitude: -49.2469 },
  { city: 'Trindade', state: 'GO', ddd: '62', latitude: -16.6514, longitude: -49.4925 },
  { city: 'Rio Verde', state: 'GO', ddd: '64', latitude: -17.7923, longitude: -50.9191 },
  { city: 'São Paulo', state: 'SP', ddd: '11', latitude: -23.5505, longitude: -46.6333 },
  { city: 'Campinas', state: 'SP', ddd: '19', latitude: -22.9099, longitude: -47.0626 },
  { city: 'São José dos Campos', state: 'SP', ddd: '12', latitude: -23.1896, longitude: -45.8841 },
  { city: 'São João da Boa Vista', state: 'SP', ddd: '19', latitude: -21.9707, longitude: -46.7969 },
  { city: 'Várzea Paulista', state: 'SP', ddd: '11', latitude: -23.2131, longitude: -46.8244 },
  { city: 'Rio de Janeiro', state: 'RJ', ddd: '21', latitude: -22.9068, longitude: -43.1729 },
  { city: 'Belo Horizonte', state: 'MG', ddd: '31', latitude: -19.9167, longitude: -43.9345 },
  { city: 'Uberlândia', state: 'MG', ddd: '34', latitude: -18.9186, longitude: -48.2772 },
  { city: 'Curitiba', state: 'PR', ddd: '41', latitude: -25.4284, longitude: -49.2733 },
  { city: 'Londrina', state: 'PR', ddd: '43', latitude: -23.3045, longitude: -51.1696 },
  { city: 'Florianópolis', state: 'SC', ddd: '48', latitude: -27.5954, longitude: -48.548 },
  { city: 'Joinville', state: 'SC', ddd: '47', latitude: -26.3045, longitude: -48.8487 },
  { city: 'Porto Alegre', state: 'RS', ddd: '51', latitude: -30.0346, longitude: -51.2177 },
  { city: 'Brasília', state: 'DF', ddd: '61', latitude: -15.7939, longitude: -47.8828 },
  { city: 'Salvador', state: 'BA', ddd: '71', latitude: -12.9777, longitude: -38.5016 },
  { city: 'Recife', state: 'PE', ddd: '81', latitude: -8.0476, longitude: -34.877 },
  { city: 'Fortaleza', state: 'CE', ddd: '85', latitude: -3.7319, longitude: -38.5267 },
  { city: 'Natal', state: 'RN', ddd: '84', latitude: -5.7945, longitude: -35.211 },
  { city: 'Belém', state: 'PA', ddd: '91', latitude: -1.4558, longitude: -48.4902 },
  { city: 'Manaus', state: 'AM', ddd: '92', latitude: -3.119, longitude: -60.0217 },
  { city: 'Vitória', state: 'ES', ddd: '27', latitude: -20.3155, longitude: -40.3128 },
  { city: 'Campo Grande', state: 'MS', ddd: '67', latitude: -20.4697, longitude: -54.6201 },
  { city: 'Cuiabá', state: 'MT', ddd: '65', latitude: -15.601, longitude: -56.0974 },
  { city: 'Arapiraca', state: 'AL', ddd: '82', latitude: -9.7516, longitude: -36.6614 },
];

export const findCity = (city: string, state: string): CityRef | undefined => CITIES.find(
  (item) => item.city === city && item.state === state,
);
