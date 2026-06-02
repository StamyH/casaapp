import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderConContesti } from '../../utils/testUtils';
import AggiuntaTask from './AggiuntaTask';

describe('AggiuntaTask', () => {
  test('mostra errore se titolo vuoto al submit', () => {
    renderConContesti(<AggiuntaTask aperto={true} onChiudi={() => {}} />);
    fireEvent.click(screen.getByText('Aggiungi attività'));
    expect(screen.getByText(/Inserisci un titolo/i)).toBeInTheDocument();
  });

  test('chiama onChiudi dopo submit valido', () => {
    const onChiudi = jest.fn();
    renderConContesti(<AggiuntaTask aperto={true} onChiudi={onChiudi} />);
    fireEvent.change(screen.getByLabelText('Titolo attività'), { target: { value: 'Pulire il bagno' } });
    fireEvent.click(screen.getByText('Aggiungi attività'));
    expect(onChiudi).toHaveBeenCalled();
  });

  test('mostra errore se frequenza specifica senza data', () => {
    renderConContesti(<AggiuntaTask aperto={true} onChiudi={() => {}} />);
    fireEvent.change(screen.getByLabelText('Titolo attività'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('📌 Data specifica'));
    fireEvent.click(screen.getByText('Aggiungi attività'));
    expect(screen.getByText('Seleziona una data')).toBeInTheDocument();
  });
});