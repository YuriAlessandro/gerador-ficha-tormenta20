import React from 'react';
import { getByTestId } from '@testing-library/dom';
import { render } from '@testing-library/react';
import App from './App';
import * as ReactGAConfig from './reactGA.config';

describe('Testa a tela principal', () => {
  ReactGAConfig.setup(true);
  test('se o componente é renderizado', () => {
    const parent = document.createElement('div');
    const { container } = render(<App />, {
      container: document.body.appendChild(parent),
    });

    expect(getByTestId(container, 'app-component')).toBeInTheDocument();
  });
});
