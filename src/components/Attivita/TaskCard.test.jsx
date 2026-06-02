import React from 'react';
import { screen } from '@testing-library/react';
import { renderConContesti } from '../../utils/testUtils';
import TaskCard from './TaskCard';

const taskTest = {
  id: 1,
  titolo: 'Lavare i piatti',
  frequenza: 'giornaliera',
  giornoSettimana: null,
  giornoMese: null,
  dataSpecifica: null,
  assegnato: 'Riccardo',
  completato: false,
};

describe('TaskCard', () => {
  test('renderizza il titolo del task', () => {
    renderConContesti(<TaskCard task={taskTest} />);
    expect(screen.getByText('Lavare i piatti')).toBeInTheDocument();
  });

  test('checkbox non spuntato se completato è false', () => {
    renderConContesti(<TaskCard task={taskTest} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  test('checkbox spuntato se completato è true', () => {
    renderConContesti(<TaskCard task={{ ...taskTest, completato: true }} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  test('mostra il bottone elimina se l utente è assegnato', () => {
    renderConContesti(<TaskCard task={taskTest} />, { utente: 'Riccardo' });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('nasconde il bottone elimina se l utente non è assegnato', () => {
    renderConContesti(<TaskCard task={taskTest} />, { utente: 'Federico' });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('mostra il bottone elimina se il task è assegnato a entrambi', () => {
    renderConContesti(<TaskCard task={{ ...taskTest, assegnato: 'entrambi' }} />, { utente: 'Federico' });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});