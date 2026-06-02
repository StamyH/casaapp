import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderConContesti } from '../../utils/testUtils';
import AggiuntaSpesa from './AggiuntaSpesa';

describe('AggiuntaSpesa', () => {
  test('mostra errore se descrizione vuota al submit', () => {
    renderConContesti(<AggiuntaSpesa aperto={true} onChiudi={() => {}} />);
    fireEvent.click(screen.getByText('Aggiungi spesa'));
    expect(screen.getByText('Inserisci una descrizione')).toBeInTheDocument();
  });

  test('mostra errore se importo mancante al submit', () => {
    renderConContesti(<AggiuntaSpesa aperto={true} onChiudi={() => {}} />);
    fireEvent.change(screen.getByLabelText('Descrizione'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('Aggiungi spesa'));
    expect(screen.getByText(/importo valido/i)).toBeInTheDocument();
  });

  test('chiama onChiudi dopo submit valido', () => {
    const onChiudi = jest.fn();
    renderConContesti(<AggiuntaSpesa aperto={true} onChiudi={onChiudi} />);
    fireEvent.change(screen.getByLabelText('Descrizione'), { target: { value: 'Spesa test' } });
    fireEvent.change(screen.getByLabelText('Importo (€)'), { target: { value: '50' } });
    fireEvent.click(screen.getByText('Aggiungi spesa'));
    expect(onChiudi).toHaveBeenCalled();
  });
});