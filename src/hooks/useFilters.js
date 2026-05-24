import { useState, useMemo } from 'react';

export function useFilters(filtriVuoti, contaAttivi) {
  const [filtriStaged, setFiltriStaged] = useState(filtriVuoti);
  const [filtriAttivi, setFiltriAttivi] = useState(filtriVuoti);

  const filtriModificati = useMemo(
    () => JSON.stringify(filtriStaged) !== JSON.stringify(filtriAttivi),
    [filtriStaged, filtriAttivi]
  );

  const aggiornaStagedFiltro = (campo, valore) =>
    setFiltriStaged(prev => ({ ...prev, [campo]: valore }));

  const applicaFiltri = () => setFiltriAttivi({ ...filtriStaged });

  const azzeraFiltri = () => {
    setFiltriStaged(filtriVuoti);
    setFiltriAttivi(filtriVuoti);
  };

  return {
    filtriStaged,
    filtriAttivi,
    filtriModificati,
    filtriAttiviCount: contaAttivi(filtriAttivi),
    aggiornaStagedFiltro,
    applicaFiltri,
    azzeraFiltri,
  };
}
