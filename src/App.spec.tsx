import React from 'react';
import { getByTestId } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { BrowserRouter as HashRouter } from 'react-router-dom';
import App from './App';
import * as ReactGAConfig from './reactGA.config';

describe('Testa a tela principal', () => {
  ReactGAConfig.setup(true);
  xtest('se o componente é renderizado', () => {
    const parent = document.createElement('div');
    const { container } = render(
      <HashRouter basename='/gerador-ficha-tormenta20/#'>
        <App />
      </HashRouter>,
      {
        container: document.body.appendChild(parent),
      }
    );

    expect(getByTestId(container, 'app-component')).toBeInTheDocument();
  });
});
