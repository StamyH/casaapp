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
    renderConContesti(<TaskCard task={taskTest} onModifica={() => {}} />);
    expect(screen.getByText('Lavare i piatti')).toBeInTheDocument();
  });

  test('checkbox non spuntato se completato è false', () => {
    renderConContesti(<TaskCard task={taskTest} onModifica={() => {}} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  test('checkbox spuntato se completato è true', () => {
    renderConContesti(<TaskCard task={{ ...taskTest, completato: true }} onModifica={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  test('mostra il bottone modifica', () => {
    renderConContesti(<TaskCard task={taskTest} onModifica={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('mostra il bottone modifica anche se task assegnato a entrambi', () => {
    renderConContesti(<TaskCard task={{ ...taskTest, assegnato: 'entrambi' }} onModifica={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
