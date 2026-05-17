import React from 'react';
import { screen } from '@testing-library/react';
import { renderConContesti } from '../../utils/testUtils';
import Bilancio from './Bilancio';

describe('Bilancio', () => {
  test('renderizza senza crashare', () => {
    renderConContesti(<Bilancio />);
    expect(screen.getByText(/Bilancio/i)).toBeInTheDocument();
  });

  test('mostra la sezione pagato da Riccardo', () => {
    renderConContesti(<Bilancio />);
    expect(screen.getByText(/Pagato da Riccardo/i)).toBeInTheDocument();
  });

  test('mostra la sezione pagato da Federico', () => {
    renderConContesti(<Bilancio />);
    expect(screen.getByText(/Pagato da Federico/i)).toBeInTheDocument();
  });

  test('mostra la sezione a carico di ciascuno', () => {
    renderConContesti(<Bilancio />);
    expect(screen.getByText(/A carico di Riccardo/i)).toBeInTheDocument();
    expect(screen.getByText(/A carico di Federico/i)).toBeInTheDocument();
  });
});