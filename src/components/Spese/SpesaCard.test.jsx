import React from 'react';
import { screen } from '@testing-library/react';
import { renderConContesti } from '../../utils/testUtils';
import SpesaCard from './SpesaCard';

const spesaTest = {
  id: 1,
  descrizione: 'Spesa test supermercato',
  importo: 100,
  categoria: 'spesa',
  pagatore: 'Riccardo',
  altroUtente: 'Federico',
  divisione: 'metà',
  percentuale: 50,
  data: '2024-01-15',
};

describe('SpesaCard', () => {
  test('renderizza la descrizione della spesa', () => {
    renderConContesti(<SpesaCard spesa={spesaTest} onModifica={() => {}} />);
    expect(screen.getByText('Spesa test supermercato')).toBeInTheDocument();
  });

  test('renderizza il testo pagato da', () => {
    renderConContesti(<SpesaCard spesa={spesaTest} onModifica={() => {}} />);
    expect(screen.getByText(/Pagato da/i)).toBeInTheDocument();
  });

  test('mostra il bottone modifica', () => {
    renderConContesti(<SpesaCard spesa={spesaTest} onModifica={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('mostra l importo correttamente', () => {
    renderConContesti(<SpesaCard spesa={spesaTest} onModifica={() => {}} />);
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });
});
