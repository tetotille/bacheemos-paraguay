import type { PageServerLoad } from './$types';
import { getKpis, getTopCorredores, getPatologiasStats } from '#lib/queries/stats';

export const load: PageServerLoad = async () => {
  const kpis = await getKpis();
  const corredores = await getTopCorredores();
  const patologias = await getPatologiasStats();

  return {
    kpis,
    corredores,
    patologias
  };
};
