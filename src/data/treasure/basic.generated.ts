/* eslint-disable */
/**
 * ARQUIVO GERADO — NÃO EDITAR À MÃO.
 *
 * Fonte: Tormenta20 Jogo do Ano, Capítulo 8 (Tabelas 8-1 a 8-5 e 8-8 a 8-15),
 * texto oficial em livros/jda/8-recompensas/ (tesouros.txt, itens-magicos.txt).
 *
 * Gerado por scripts/treasure/extract-jda.mjs. Verificado por
 * jdaFidelity.spec.ts quando livros/ está presente.
 */
import type { TreasureTables } from './types';

const BASIC_BOOK_TABLES: TreasureTables = {
  source: {
    title: 'Tormenta20 Jogo do Ano — Capítulo 8: Recompensas',
    credits:
      'Tormenta20 Jogo do Ano (Jambô Editora), Tabelas 8-1 a 8-5 e 8-8 a 8-15.',
  },
  tesouroPorNd: {
    byNd: {
      '1': {
        money: [
          {
            min: 1,
            max: 20,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 21,
            max: 70,
            label: '3d8x10 T$',
            result: {
              kind: 'coins',
              count: {
                n: 3,
                sides: 8,
              },
              mult: 10,
              currency: 'T$',
            },
          },
          {
            min: 71,
            max: 95,
            label: '4d12x10 T$',
            result: {
              kind: 'coins',
              count: {
                n: 4,
                sides: 12,
              },
              mult: 10,
              currency: 'T$',
            },
          },
          {
            min: 96,
            max: 100,
            label: '1 riqueza menor',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
              },
              tier: 'menor',
              bonus: false,
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 40,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 41,
            max: 65,
            label: 'Diverso',
            result: {
              kind: 'diverso',
            },
          },
          {
            min: 66,
            max: 90,
            label: 'Equipamento',
            result: {
              kind: 'equipamento',
              twoDice: false,
            },
          },
          {
            min: 91,
            max: 100,
            label: '1 poção',
            result: {
              kind: 'pocao',
              count: {
                n: 1,
              },
              bonus: false,
            },
          },
        ],
      },
      '2': {
        money: [
          {
            min: 1,
            max: 15,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 16,
            max: 55,
            label: '3d10x10 T$',
            result: {
              kind: 'coins',
              count: {
                n: 3,
                sides: 10,
              },
              mult: 10,
              currency: 'T$',
            },
          },
          {
            min: 56,
            max: 85,
            label: '2d4x100 T$',
            result: {
              kind: 'coins',
              count: {
                n: 2,
                sides: 4,
              },
              mult: 100,
              currency: 'T$',
            },
          },
          {
            min: 86,
            max: 95,
            label: '2d6+1x100 T$',
            result: {
              kind: 'coins',
              count: {
                n: 2,
                sides: 6,
                add: 1,
              },
              mult: 100,
              currency: 'T$',
            },
          },
          {
            min: 96,
            max: 100,
            label: '1 riqueza menor',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
              },
              tier: 'menor',
              bonus: false,
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 30,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 31,
            max: 40,
            label: 'Diverso',
            result: {
              kind: 'diverso',
            },
          },
          {
            min: 41,
            max: 70,
            label: 'Equipamento',
            result: {
              kind: 'equipamento',
              twoDice: false,
            },
          },
          {
            min: 71,
            max: 90,
            label: '1 poção',
            result: {
              kind: 'pocao',
              count: {
                n: 1,
              },
              bonus: false,
            },
          },
          {
            min: 91,
            max: 100,
            label: 'Superior (1 melhoria)',
            result: {
              kind: 'superior',
              improvements: 1,
              twoDice: false,
            },
          },
        ],
      },
      '3': {
        money: [
          {
            min: 1,
            max: 10,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 11,
            max: 20,
            label: '4d12x10 T$',
            result: {
              kind: 'coins',
              count: {
                n: 4,
                sides: 12,
              },
              mult: 10,
              currency: 'T$',
            },
          },
          {
            min: 21,
            max: 60,
            label: '1d4x100 T$',
            result: {
              kind: 'coins',
              count: {
                n: 1,
                sides: 4,
              },
              mult: 100,
              currency: 'T$',
            },
          },
          {
            min: 61,
            max: 90,
            label: '1d8x10 TO',
            result: {
              kind: 'coins',
              count: {
                n: 1,
                sides: 8,
              },
              mult: 10,
              currency: 'TO',
            },
          },
          {
            min: 91,
            max: 100,
            label: '1d3 riquezas menores',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
                sides: 3,
              },
              tier: 'menor',
              bonus: false,
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 25,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 26,
            max: 35,
            label: 'Diverso',
            result: {
              kind: 'diverso',
            },
          },
          {
            min: 36,
            max: 60,
            label: 'Equipamento',
            result: {
              kind: 'equipamento',
              twoDice: false,
            },
          },
          {
            min: 61,
            max: 85,
            label: '1 poção',
            result: {
              kind: 'pocao',
              count: {
                n: 1,
              },
              bonus: false,
            },
          },
          {
            min: 86,
            max: 100,
            label: 'Superior (1 melhoria)',
            result: {
              kind: 'superior',
              improvements: 1,
              twoDice: false,
            },
          },
        ],
      },
      '4': {
        money: [
          {
            min: 1,
            max: 10,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 11,
            max: 50,
            label: '1d6x100 T$',
            result: {
              kind: 'coins',
              count: {
                n: 1,
                sides: 6,
              },
              mult: 100,
              currency: 'T$',
            },
          },
          {
            min: 51,
            max: 80,
            label: '1d12x100 T$',
            result: {
              kind: 'coins',
              count: {
                n: 1,
                sides: 12,
              },
              mult: 100,
              currency: 'T$',
            },
          },
          {
            min: 81,
            max: 90,
            label: '1 riqueza menor +%',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
              },
              tier: 'menor',
              bonus: true,
            },
          },
          {
            min: 91,
            max: 100,
            label: '1d3 riquezas menores +%',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
                sides: 3,
              },
              tier: 'menor',
              bonus: true,
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 20,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 21,
            max: 30,
            label: 'Diverso',
            result: {
              kind: 'diverso',
            },
          },
          {
            min: 31,
            max: 55,
            label: 'Equipamento 2D',
            result: {
              kind: 'equipamento',
              twoDice: true,
            },
          },
          {
            min: 56,
            max: 80,
            label: '1 poção +%',
            result: {
              kind: 'pocao',
              count: {
                n: 1,
              },
              bonus: true,
            },
          },
          {
            min: 81,
            max: 100,
            label: 'Superior (1 melhoria) 2D',
            result: {
              kind: 'superior',
              improvements: 1,
              twoDice: true,
            },
          },
        ],
      },
      '5': {
        money: [
          {
            min: 1,
            max: 15,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 16,
            max: 65,
            label: '1d8x100 T$',
            result: {
              kind: 'coins',
              count: {
                n: 1,
                sides: 8,
              },
              mult: 100,
              currency: 'T$',
            },
          },
          {
            min: 66,
            max: 95,
            label: '3d4x10 TO',
            result: {
              kind: 'coins',
              count: {
                n: 3,
                sides: 4,
              },
              mult: 10,
              currency: 'TO',
            },
          },
          {
            min: 96,
            max: 100,
            label: '1 riqueza média',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
              },
              tier: 'media',
              bonus: false,
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 20,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 21,
            max: 70,
            label: '1 poção',
            result: {
              kind: 'pocao',
              count: {
                n: 1,
              },
              bonus: false,
            },
          },
          {
            min: 71,
            max: 90,
            label: 'Superior (1 melhoria)',
            result: {
              kind: 'superior',
              improvements: 1,
              twoDice: false,
            },
          },
          {
            min: 91,
            max: 100,
            label: 'Superior (2 melhorias)',
            result: {
              kind: 'superior',
              improvements: 2,
              twoDice: false,
            },
          },
        ],
      },
      '6': {
        money: [
          {
            min: 1,
            max: 15,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 16,
            max: 60,
            label: '2d6x100 T$',
            result: {
              kind: 'coins',
              count: {
                n: 2,
                sides: 6,
              },
              mult: 100,
              currency: 'T$',
            },
          },
          {
            min: 61,
            max: 90,
            label: '2d10x100 T$',
            result: {
              kind: 'coins',
              count: {
                n: 2,
                sides: 10,
              },
              mult: 100,
              currency: 'T$',
            },
          },
          {
            min: 91,
            max: 100,
            label: '1d3+1 riquezas menores',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
                sides: 3,
                add: 1,
              },
              tier: 'menor',
              bonus: false,
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 20,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 21,
            max: 65,
            label: '1 poção +%',
            result: {
              kind: 'pocao',
              count: {
                n: 1,
              },
              bonus: true,
            },
          },
          {
            min: 66,
            max: 95,
            label: 'Superior (1 melhoria)',
            result: {
              kind: 'superior',
              improvements: 1,
              twoDice: false,
            },
          },
          {
            min: 96,
            max: 100,
            label: 'Superior (2 melhorias) 2D',
            result: {
              kind: 'superior',
              improvements: 2,
              twoDice: true,
            },
          },
        ],
      },
      '7': {
        money: [
          {
            min: 1,
            max: 10,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 11,
            max: 60,
            label: '2d8x100 T$',
            result: {
              kind: 'coins',
              count: {
                n: 2,
                sides: 8,
              },
              mult: 100,
              currency: 'T$',
            },
          },
          {
            min: 61,
            max: 90,
            label: '2d12x10 TO',
            result: {
              kind: 'coins',
              count: {
                n: 2,
                sides: 12,
              },
              mult: 10,
              currency: 'TO',
            },
          },
          {
            min: 91,
            max: 100,
            label: '1d4+1 riquezas menores',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
                sides: 4,
                add: 1,
              },
              tier: 'menor',
              bonus: false,
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 20,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 21,
            max: 60,
            label: '1d3 poções',
            result: {
              kind: 'pocao',
              count: {
                n: 1,
                sides: 3,
              },
              bonus: false,
            },
          },
          {
            min: 61,
            max: 90,
            label: 'Superior (2 melhorias)',
            result: {
              kind: 'superior',
              improvements: 2,
              twoDice: false,
            },
          },
          {
            min: 91,
            max: 100,
            label: 'Superior (3 melhorias)',
            result: {
              kind: 'superior',
              improvements: 3,
              twoDice: false,
            },
          },
        ],
      },
      '8': {
        money: [
          {
            min: 1,
            max: 10,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 11,
            max: 55,
            label: '2d10x100 T$',
            result: {
              kind: 'coins',
              count: {
                n: 2,
                sides: 10,
              },
              mult: 100,
              currency: 'T$',
            },
          },
          {
            min: 56,
            max: 95,
            label: '1d4+1 riquezas menores',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
                sides: 4,
                add: 1,
              },
              tier: 'menor',
              bonus: false,
            },
          },
          {
            min: 96,
            max: 100,
            label: '1 riqueza média +%',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
              },
              tier: 'media',
              bonus: true,
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 20,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 21,
            max: 75,
            label: '1d3 poções',
            result: {
              kind: 'pocao',
              count: {
                n: 1,
                sides: 3,
              },
              bonus: false,
            },
          },
          {
            min: 76,
            max: 95,
            label: 'Superior (2 melhorias)',
            result: {
              kind: 'superior',
              improvements: 2,
              twoDice: false,
            },
          },
          {
            min: 96,
            max: 100,
            label: 'Superior (3 melhorias) 2D',
            result: {
              kind: 'superior',
              improvements: 3,
              twoDice: true,
            },
          },
        ],
      },
      '9': {
        money: [
          {
            min: 1,
            max: 10,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 11,
            max: 35,
            label: '1 riqueza média',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
              },
              tier: 'media',
              bonus: false,
            },
          },
          {
            min: 36,
            max: 85,
            label: '4d6x100 T$',
            result: {
              kind: 'coins',
              count: {
                n: 4,
                sides: 6,
              },
              mult: 100,
              currency: 'T$',
            },
          },
          {
            min: 86,
            max: 100,
            label: '1d3 riquezas médias',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
                sides: 3,
              },
              tier: 'media',
              bonus: false,
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 20,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 21,
            max: 70,
            label: '1 poção +%',
            result: {
              kind: 'pocao',
              count: {
                n: 1,
              },
              bonus: true,
            },
          },
          {
            min: 71,
            max: 95,
            label: 'Superior (3 melhorias)',
            result: {
              kind: 'superior',
              improvements: 3,
              twoDice: false,
            },
          },
          {
            min: 96,
            max: 100,
            label: 'Mágico (menor)',
            result: {
              kind: 'magico',
              tier: 'menor',
              twoDice: false,
            },
          },
        ],
      },
      '10': {
        money: [
          {
            min: 1,
            max: 10,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 11,
            max: 30,
            label: '4d6x100 T$',
            result: {
              kind: 'coins',
              count: {
                n: 4,
                sides: 6,
              },
              mult: 100,
              currency: 'T$',
            },
          },
          {
            min: 31,
            max: 85,
            label: '4d10x10 TO',
            result: {
              kind: 'coins',
              count: {
                n: 4,
                sides: 10,
              },
              mult: 10,
              currency: 'TO',
            },
          },
          {
            min: 86,
            max: 100,
            label: '1d3+1 riquezas médias',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
                sides: 3,
                add: 1,
              },
              tier: 'media',
              bonus: false,
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 50,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 51,
            max: 75,
            label: '1d3+1 poções',
            result: {
              kind: 'pocao',
              count: {
                n: 1,
                sides: 3,
                add: 1,
              },
              bonus: false,
            },
          },
          {
            min: 76,
            max: 90,
            label: 'Superior (3 melhorias)',
            result: {
              kind: 'superior',
              improvements: 3,
              twoDice: false,
            },
          },
          {
            min: 91,
            max: 100,
            label: 'Mágico (menor)',
            result: {
              kind: 'magico',
              tier: 'menor',
              twoDice: false,
            },
          },
        ],
      },
      '11': {
        money: [
          {
            min: 1,
            max: 10,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 11,
            max: 45,
            label: '2d4x1.000 T$',
            result: {
              kind: 'coins',
              count: {
                n: 2,
                sides: 4,
              },
              mult: 1000,
              currency: 'T$',
            },
          },
          {
            min: 46,
            max: 85,
            label: '1d3 riquezas médias',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
                sides: 3,
              },
              tier: 'media',
              bonus: false,
            },
          },
          {
            min: 86,
            max: 100,
            label: '2d6x100 TO',
            result: {
              kind: 'coins',
              count: {
                n: 2,
                sides: 6,
              },
              mult: 100,
              currency: 'TO',
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 45,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 46,
            max: 70,
            label: '1d4+1 poções',
            result: {
              kind: 'pocao',
              count: {
                n: 1,
                sides: 4,
                add: 1,
              },
              bonus: false,
            },
          },
          {
            min: 71,
            max: 90,
            label: 'Superior (3 melhorias)',
            result: {
              kind: 'superior',
              improvements: 3,
              twoDice: false,
            },
          },
          {
            min: 91,
            max: 100,
            label: 'Mágico (menor) 2D',
            result: {
              kind: 'magico',
              tier: 'menor',
              twoDice: true,
            },
          },
        ],
      },
      '12': {
        money: [
          {
            min: 1,
            max: 10,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 11,
            max: 45,
            label: '1 riqueza média +%',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
              },
              tier: 'media',
              bonus: true,
            },
          },
          {
            min: 46,
            max: 80,
            label: '2d6x1.000 T$',
            result: {
              kind: 'coins',
              count: {
                n: 2,
                sides: 6,
              },
              mult: 1000,
              currency: 'T$',
            },
          },
          {
            min: 81,
            max: 100,
            label: '1d4+1 riquezas médias',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
                sides: 4,
                add: 1,
              },
              tier: 'media',
              bonus: false,
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 45,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 46,
            max: 70,
            label: '1d3+1 poções +%',
            result: {
              kind: 'pocao',
              count: {
                n: 1,
                sides: 3,
                add: 1,
              },
              bonus: true,
            },
          },
          {
            min: 71,
            max: 85,
            label: 'Superior (4 melhorias)',
            result: {
              kind: 'superior',
              improvements: 4,
              twoDice: false,
            },
          },
          {
            min: 86,
            max: 100,
            label: 'Mágico (menor)',
            result: {
              kind: 'magico',
              tier: 'menor',
              twoDice: false,
            },
          },
        ],
      },
      '13': {
        money: [
          {
            min: 1,
            max: 10,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 11,
            max: 45,
            label: '4d4x1.000 T$',
            result: {
              kind: 'coins',
              count: {
                n: 4,
                sides: 4,
              },
              mult: 1000,
              currency: 'T$',
            },
          },
          {
            min: 46,
            max: 80,
            label: '1d3+1 riquezas médias',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
                sides: 3,
                add: 1,
              },
              tier: 'media',
              bonus: false,
            },
          },
          {
            min: 81,
            max: 100,
            label: '4d6x100 TO',
            result: {
              kind: 'coins',
              count: {
                n: 4,
                sides: 6,
              },
              mult: 100,
              currency: 'TO',
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 40,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 41,
            max: 65,
            label: '1d4+1 poções +%',
            result: {
              kind: 'pocao',
              count: {
                n: 1,
                sides: 4,
                add: 1,
              },
              bonus: true,
            },
          },
          {
            min: 66,
            max: 95,
            label: 'Superior (4 melhorias)',
            result: {
              kind: 'superior',
              improvements: 4,
              twoDice: false,
            },
          },
          {
            min: 96,
            max: 100,
            label: 'Mágico (médio)',
            result: {
              kind: 'magico',
              tier: 'medio',
              twoDice: false,
            },
          },
        ],
      },
      '14': {
        money: [
          {
            min: 1,
            max: 10,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 11,
            max: 45,
            label: '1d3+1 riquezas médias',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
                sides: 3,
                add: 1,
              },
              tier: 'media',
              bonus: false,
            },
          },
          {
            min: 46,
            max: 80,
            label: '3d6x1.000 T$',
            result: {
              kind: 'coins',
              count: {
                n: 3,
                sides: 6,
              },
              mult: 1000,
              currency: 'T$',
            },
          },
          {
            min: 81,
            max: 100,
            label: '1 riqueza maior',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
              },
              tier: 'maior',
              bonus: false,
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 40,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 41,
            max: 65,
            label: '1d4+1 poções +%',
            result: {
              kind: 'pocao',
              count: {
                n: 1,
                sides: 4,
                add: 1,
              },
              bonus: true,
            },
          },
          {
            min: 66,
            max: 90,
            label: 'Superior (4 melhorias)',
            result: {
              kind: 'superior',
              improvements: 4,
              twoDice: false,
            },
          },
          {
            min: 91,
            max: 100,
            label: 'Mágico (médio)',
            result: {
              kind: 'magico',
              tier: 'medio',
              twoDice: false,
            },
          },
        ],
      },
      '15': {
        money: [
          {
            min: 1,
            max: 10,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 11,
            max: 45,
            label: '1 riqueza média +%',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
              },
              tier: 'media',
              bonus: true,
            },
          },
          {
            min: 46,
            max: 80,
            label: '2d10x1.000 T$',
            result: {
              kind: 'coins',
              count: {
                n: 2,
                sides: 10,
              },
              mult: 1000,
              currency: 'T$',
            },
          },
          {
            min: 81,
            max: 100,
            label: '1d4x1.000 TO',
            result: {
              kind: 'coins',
              count: {
                n: 1,
                sides: 4,
              },
              mult: 1000,
              currency: 'TO',
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 35,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 36,
            max: 45,
            label: '1d6+1 poções',
            result: {
              kind: 'pocao',
              count: {
                n: 1,
                sides: 6,
                add: 1,
              },
              bonus: false,
            },
          },
          {
            min: 46,
            max: 85,
            label: 'Superior (4 melhorias) 2D',
            result: {
              kind: 'superior',
              improvements: 4,
              twoDice: true,
            },
          },
          {
            min: 86,
            max: 100,
            label: 'Mágico (médio)',
            result: {
              kind: 'magico',
              tier: 'medio',
              twoDice: false,
            },
          },
        ],
      },
      '16': {
        money: [
          {
            min: 1,
            max: 10,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 11,
            max: 40,
            label: '3d6x1.000 T$',
            result: {
              kind: 'coins',
              count: {
                n: 3,
                sides: 6,
              },
              mult: 1000,
              currency: 'T$',
            },
          },
          {
            min: 41,
            max: 75,
            label: '3d10x100 TO',
            result: {
              kind: 'coins',
              count: {
                n: 3,
                sides: 10,
              },
              mult: 100,
              currency: 'TO',
            },
          },
          {
            min: 76,
            max: 100,
            label: '1d3 riquezas maiores',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
                sides: 3,
              },
              tier: 'maior',
              bonus: false,
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 35,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 36,
            max: 45,
            label: '1d6+1 poções +%',
            result: {
              kind: 'pocao',
              count: {
                n: 1,
                sides: 6,
                add: 1,
              },
              bonus: true,
            },
          },
          {
            min: 46,
            max: 80,
            label: 'Superior (4 melhorias) 2D',
            result: {
              kind: 'superior',
              improvements: 4,
              twoDice: true,
            },
          },
          {
            min: 81,
            max: 100,
            label: 'Mágico (médio)',
            result: {
              kind: 'magico',
              tier: 'medio',
              twoDice: false,
            },
          },
        ],
      },
      '17': {
        money: [
          {
            min: 1,
            max: 5,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 6,
            max: 40,
            label: '4d6x1.000 T$',
            result: {
              kind: 'coins',
              count: {
                n: 4,
                sides: 6,
              },
              mult: 1000,
              currency: 'T$',
            },
          },
          {
            min: 41,
            max: 75,
            label: '1d3 riquezas médias +%',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
                sides: 3,
              },
              tier: 'media',
              bonus: true,
            },
          },
          {
            min: 76,
            max: 100,
            label: '2d4x1.000 TO',
            result: {
              kind: 'coins',
              count: {
                n: 2,
                sides: 4,
              },
              mult: 1000,
              currency: 'TO',
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 20,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 21,
            max: 40,
            label: 'Mágico (menor)',
            result: {
              kind: 'magico',
              tier: 'menor',
              twoDice: false,
            },
          },
          {
            min: 41,
            max: 80,
            label: 'Mágico (médio)',
            result: {
              kind: 'magico',
              tier: 'medio',
              twoDice: false,
            },
          },
          {
            min: 81,
            max: 100,
            label: 'Mágico (maior)',
            result: {
              kind: 'magico',
              tier: 'maior',
              twoDice: false,
            },
          },
        ],
      },
      '18': {
        money: [
          {
            min: 1,
            max: 5,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 6,
            max: 40,
            label: '4d10x1.000 T$',
            result: {
              kind: 'coins',
              count: {
                n: 4,
                sides: 10,
              },
              mult: 1000,
              currency: 'T$',
            },
          },
          {
            min: 41,
            max: 75,
            label: '1 riqueza maior',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
              },
              tier: 'maior',
              bonus: false,
            },
          },
          {
            min: 76,
            max: 100,
            label: '1d3+1 riquezas maiores',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
                sides: 3,
                add: 1,
              },
              tier: 'maior',
              bonus: false,
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 15,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 16,
            max: 40,
            label: 'Mágico (menor) 2D',
            result: {
              kind: 'magico',
              tier: 'menor',
              twoDice: true,
            },
          },
          {
            min: 41,
            max: 70,
            label: 'Mágico (médio)',
            result: {
              kind: 'magico',
              tier: 'medio',
              twoDice: false,
            },
          },
          {
            min: 71,
            max: 100,
            label: 'Mágico (maior)',
            result: {
              kind: 'magico',
              tier: 'maior',
              twoDice: false,
            },
          },
        ],
      },
      '19': {
        money: [
          {
            min: 1,
            max: 5,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 6,
            max: 40,
            label: '4d12x1.000 T$',
            result: {
              kind: 'coins',
              count: {
                n: 4,
                sides: 12,
              },
              mult: 1000,
              currency: 'T$',
            },
          },
          {
            min: 41,
            max: 75,
            label: '1 riqueza maior +%',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
              },
              tier: 'maior',
              bonus: true,
            },
          },
          {
            min: 76,
            max: 100,
            label: '1d12x1.000 TO',
            result: {
              kind: 'coins',
              count: {
                n: 1,
                sides: 12,
              },
              mult: 1000,
              currency: 'TO',
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 10,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 11,
            max: 40,
            label: 'Mágico (menor) 2D',
            result: {
              kind: 'magico',
              tier: 'menor',
              twoDice: true,
            },
          },
          {
            min: 41,
            max: 60,
            label: 'Mágico (médio) 2D',
            result: {
              kind: 'magico',
              tier: 'medio',
              twoDice: true,
            },
          },
          {
            min: 61,
            max: 100,
            label: 'Mágico (maior)',
            result: {
              kind: 'magico',
              tier: 'maior',
              twoDice: false,
            },
          },
        ],
      },
      '20': {
        money: [
          {
            min: 1,
            max: 5,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 6,
            max: 40,
            label: '2d4x1.000 TO',
            result: {
              kind: 'coins',
              count: {
                n: 2,
                sides: 4,
              },
              mult: 1000,
              currency: 'TO',
            },
          },
          {
            min: 41,
            max: 75,
            label: '1d3 riquezas maiores',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
                sides: 3,
              },
              tier: 'maior',
              bonus: false,
            },
          },
          {
            min: 76,
            max: 100,
            label: '1d3+1 riquezas maiores +%',
            result: {
              kind: 'riqueza',
              count: {
                n: 1,
                sides: 3,
                add: 1,
              },
              tier: 'maior',
              bonus: true,
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 5,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 6,
            max: 40,
            label: 'Mágico (menor) 2D',
            result: {
              kind: 'magico',
              tier: 'menor',
              twoDice: true,
            },
          },
          {
            min: 41,
            max: 50,
            label: 'Mágico (médio) 2D',
            result: {
              kind: 'magico',
              tier: 'medio',
              twoDice: true,
            },
          },
          {
            min: 51,
            max: 100,
            label: 'Mágico (maior) 2D',
            result: {
              kind: 'magico',
              tier: 'maior',
              twoDice: true,
            },
          },
        ],
      },
      '1/4': {
        money: [
          {
            min: 1,
            max: 30,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 31,
            max: 70,
            label: '1d6x10 TC',
            result: {
              kind: 'coins',
              count: {
                n: 1,
                sides: 6,
              },
              mult: 10,
              currency: 'TC',
            },
          },
          {
            min: 71,
            max: 95,
            label: '1d4x100 TC',
            result: {
              kind: 'coins',
              count: {
                n: 1,
                sides: 4,
              },
              mult: 100,
              currency: 'TC',
            },
          },
          {
            min: 96,
            max: 100,
            label: '1d6x10 T$',
            result: {
              kind: 'coins',
              count: {
                n: 1,
                sides: 6,
              },
              mult: 10,
              currency: 'T$',
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 50,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 51,
            max: 75,
            label: 'Diverso',
            result: {
              kind: 'diverso',
            },
          },
          {
            min: 76,
            max: 100,
            label: 'Equipamento',
            result: {
              kind: 'equipamento',
              twoDice: false,
            },
          },
        ],
      },
      '1/2': {
        money: [
          {
            min: 1,
            max: 25,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 26,
            max: 70,
            label: '2d6x10 TC',
            result: {
              kind: 'coins',
              count: {
                n: 2,
                sides: 6,
              },
              mult: 10,
              currency: 'TC',
            },
          },
          {
            min: 71,
            max: 95,
            label: '2d8x10 T$',
            result: {
              kind: 'coins',
              count: {
                n: 2,
                sides: 8,
              },
              mult: 10,
              currency: 'T$',
            },
          },
          {
            min: 96,
            max: 100,
            label: '1d4x100 T$',
            result: {
              kind: 'coins',
              count: {
                n: 1,
                sides: 4,
              },
              mult: 100,
              currency: 'T$',
            },
          },
        ],
        items: [
          {
            min: 1,
            max: 45,
            label: '—',
            result: {
              kind: 'none',
            },
          },
          {
            min: 46,
            max: 70,
            label: 'Diverso',
            result: {
              kind: 'diverso',
            },
          },
          {
            min: 71,
            max: 100,
            label: 'Equipamento',
            result: {
              kind: 'equipamento',
              twoDice: false,
            },
          },
        ],
      },
    },
    notes: [
      '+% Na rolagem de d% para determinar o tipo de riqueza ou poção, você recebe +20%. Resultados acima de 100% contam como 100%.',
      '2D Na rolagem para definir o tipo de equipamento ou item mágico, você pode rolar 2d6 e escolher um deles. Por exemplo, se rolar um 2 e um 6 para definir o tipo de equipamento, você pode escolher entre uma arma e um esotérico.',
    ],
    instructions: [
      'Dinheiro. O grupo encontra moedas ou riquezas. • Moedas. Você pode apenas descrever o valor (“Vocês encontram 25 TO”) ou detalhar mais (“Vocês encontram 25 Tibares de ouro da época do Rei-Imperador Phylidio, o Tranquilo. Tais moedas são muito valiosas hoje”). • Riquezas. O grupo encontra um ou mais itens sem uso prático, mas valiosos. Role 1d% na Tabela 8-2 para determinar o valor de venda de cada riqueza. A tabela traz exemplos de itens e, entre parênteses, quantos espaços eles ocupam. Moedas e riquezas podem ser usadas como elementos de aventura. Por exemplo, se o grupo derrota mercenários contratados por um barão corrupto, pode encontrar moedas com a efígie do nobre, ligando-o os bandidos a ele. Itens. O grupo encontra um item diverso , um equipamento , um equipamento superior , uma ou mais poções ou um item mágico . • Diverso. Role na Tabela 8-3 , na página se- guinte, para determinar qual item o grupo encontra. • Equipamento. Role 1d6 para determinar o tipo de equipamento: 1–3), arma; 4–5) armadura ou escudo; 6) esotérico. Então role na Tabela 8-4 , na página seguinte, para determinar o item específico. • Superior. Role para determinar se é uma arma, armadura/escudo ou esotérico, como acima. Então, para cada melhoria do item, role uma vez na Tabela 8-5: Itens Superiores , na página 332. • Poções. Veja a página 341. • Mágico. Role 1d6 para determinar o tipo de item: 1–2) arma (página 336); 3) armadura/escudo (página 339); 4–6) acessório (página 342).',
    ],
  },
  riquezas: {
    values: [
      {
        menor: {
          min: 1,
          max: 25,
        },
        media: null,
        maior: null,
        valueLabel: '4d4 (10)',
        value: {
          n: 4,
          sides: 4,
          mult: 1,
          average: 10,
        },
        examples: [
          {
            spaces: '',
            text: 'Ágata ou hematita (1/2)',
          },
          {
            spaces: '',
            text: 'barril de farinha ou gaiola com galinhas (5)',
          },
        ],
      },
      {
        menor: {
          min: 26,
          max: 40,
        },
        media: null,
        maior: null,
        valueLabel: '1d4x10 (25)',
        value: {
          n: 1,
          sides: 4,
          mult: 10,
          average: 25,
        },
        examples: [
          {
            spaces: '',
            text: 'Quartzo rosa ou topázio (1/2)',
          },
          {
            spaces: '',
            text: 'caixa de tabaco ou rolo de linho (1)',
          },
          {
            spaces: '',
            text: 'jarro de especiarias, como canela, gorad, pimenta ou sal (2)',
          },
        ],
      },
      {
        menor: {
          min: 41,
          max: 55,
        },
        media: {
          min: 1,
          max: 10,
        },
        maior: null,
        valueLabel: '2d4x10 (50)',
        value: {
          n: 2,
          sides: 4,
          mult: 10,
          average: 50,
        },
        examples: [
          {
            spaces: '',
            text: 'Bracelete de ouro finamente trabalhado (1/2)',
          },
          {
            spaces: '',
            text: 'estatueta de osso ou marfim entalhado ou rolo de seda (1)',
          },
          {
            spaces: '',
            text: 'vaso de prata (2)',
          },
        ],
      },
      {
        menor: {
          min: 56,
          max: 70,
        },
        media: {
          min: 11,
          max: 30,
        },
        maior: null,
        valueLabel: '4d6x10 (140)',
        value: {
          n: 4,
          sides: 6,
          mult: 10,
          average: 140,
        },
        examples: [
          {
            spaces: '',
            text: 'Ametista ou pérola branca (1/2)',
          },
          {
            spaces: '',
            text: 'lingote de prata ou cálice de prata com gemas de lápis-lazúli (1)',
          },
          {
            spaces: '',
            text: 'tapeçaria grande e bem-feita de lã (5)',
          },
        ],
      },
      {
        menor: {
          min: 71,
          max: 85,
        },
        media: {
          min: 31,
          max: 50,
        },
        maior: {
          min: 1,
          max: 5,
        },
        valueLabel: '1d6x100 (350)',
        value: {
          n: 1,
          sides: 6,
          mult: 100,
          average: 350,
        },
        examples: [
          {
            spaces: '',
            text: 'Alexandrita ou pérola negra (1/2)',
          },
          {
            spaces: '',
            text: 'espada cerimonial ornada com prata e gema negra no cabo ou pente de prata com pedras preciosas (1)',
          },
        ],
      },
      {
        menor: {
          min: 86,
          max: 95,
        },
        media: {
          min: 51,
          max: 65,
        },
        maior: {
          min: 6,
          max: 15,
        },
        valueLabel: '2d6x100 (700)',
        value: {
          n: 2,
          sides: 6,
          mult: 100,
          average: 700,
        },
        examples: [
          {
            spaces: '',
            text: 'Pente em forma de dragão com olhos de gema vermelha (1)',
          },
          {
            spaces: '',
            text: 'harpa de madeira exótica com ornamentos de zircão e marfim (5)',
          },
        ],
      },
      {
        menor: {
          min: 96,
          max: 99,
        },
        media: {
          min: 66,
          max: 80,
        },
        maior: {
          min: 16,
          max: 25,
        },
        valueLabel: '2d8x100 (900)',
        value: {
          n: 2,
          sides: 8,
          mult: 100,
          average: 900,
        },
        examples: [
          {
            spaces: '',
            text: 'Opala negra ou tapa-olho com um olho falso de safira (1/2)',
          },
          {
            spaces: '',
            text: 'luva bordada e adornada com gemas ou pingente de opala vermelha com corrente de ouro (1)',
          },
          {
            spaces: '',
            text: 'lingote de ouro ou pintura antiga (2)',
          },
        ],
      },
      {
        menor: {
          min: 100,
          max: 100,
        },
        media: {
          min: 81,
          max: 90,
        },
        maior: {
          min: 26,
          max: 40,
        },
        valueLabel: '4d10x100 (2.200)',
        value: {
          n: 4,
          sides: 10,
          mult: 100,
          average: 2200,
        },
        examples: [
          {
            spaces: '',
            text: 'Esmeralda verde ou pingente de safira (1/2)',
          },
          {
            spaces: '',
            text: 'caixinha de música de ouro ou tornozeleira com gemas (1)',
          },
          {
            spaces: '',
            text: 'manto bordado em veludo e seda com inúmeras pedras preciosas (2)',
          },
        ],
      },
      {
        menor: null,
        media: {
          min: 91,
          max: 95,
        },
        maior: {
          min: 41,
          max: 60,
        },
        valueLabel: '6d12x100 (3.900)',
        value: {
          n: 6,
          sides: 12,
          mult: 100,
          average: 3900,
        },
        examples: [
          {
            spaces: '',
            text: 'Anel de prata e safira ou correntinha com pequenas pérolas rosas, diamante branco (1/2)',
          },
          {
            spaces: '',
            text: 'ídolo de ouro puro maciço (5)',
          },
        ],
      },
      {
        menor: null,
        media: {
          min: 96,
          max: 99,
        },
        maior: {
          min: 61,
          max: 75,
        },
        valueLabel: '2d10x1.000 (11.000)',
        value: {
          n: 2,
          sides: 10,
          mult: 1000,
          average: 11000,
        },
        examples: [
          {
            spaces: '',
            text: 'Anel de ouro e rubi ou diamante vermelho (1/2)',
          },
          {
            spaces: '',
            text: 'conjunto de taças de ouro decoradas com esmeraldas (2)',
          },
        ],
      },
      {
        menor: null,
        media: {
          min: 100,
          max: 100,
        },
        maior: {
          min: 76,
          max: 85,
        },
        valueLabel: '6d8x1.000 (27.000)',
        value: {
          n: 6,
          sides: 8,
          mult: 1000,
          average: 27000,
        },
        examples: [
          {
            spaces: '',
            text: 'Coroa de ouro adornada com centenas de gemas, pertencente a um antigo monarca (1)',
          },
          {
            spaces: '',
            text: 'baú de mitral com coleção de diamantes (2)',
          },
        ],
      },
      {
        menor: null,
        media: null,
        maior: {
          min: 86,
          max: 95,
        },
        valueLabel: '1d10x10.000 (55.000)',
        value: {
          n: 1,
          sides: 10,
          mult: 10000,
          average: 55000,
        },
        examples: [
          {
            spaces: '',
            text: 'Arca de madeira reforçada repleta de lingotes de prata e ouro, além de pedras preciosas de vários tipos (20)',
          },
        ],
      },
      {
        menor: null,
        media: null,
        maior: {
          min: 96,
          max: 100,
        },
        valueLabel: '4d12x10.000 (260.000)',
        value: {
          n: 4,
          sides: 12,
          mult: 10000,
          average: 260000,
        },
        examples: [
          {
            spaces: '',
            text: 'Uma sala forrada de moedas! Mover todo esse dinheiro exige trabalhadores e carroças (ou outra ideia por parte dos jogadores), além de atrair a atenção de bandidos, coletores de impostos e aproveitadores de vários tipos..',
          },
        ],
      },
    ],
    spaces: [],
    notes: [],
  },
  itensDiversos: {
    rows: [
      {
        min: 1,
        max: 2,
        name: 'Ácido',
        rawName: 'Ácido',
      },
      {
        min: 3,
        max: 4,
        name: 'Água benta',
        rawName: 'Água benta',
      },
      {
        min: 5,
        max: 5,
        name: 'Alaúde élfico',
        rawName: 'Alaúde élfico',
      },
      {
        min: 6,
        max: 6,
        name: 'Algemas',
        rawName: 'Algemas',
      },
      {
        min: 7,
        max: 8,
        name: 'Baga-de-fogo',
        rawName: 'Baga-de-fogo',
      },
      {
        min: 9,
        max: 23,
        name: 'Bálsamo restaurador',
        rawName: 'Bálsamo restaurador',
      },
      {
        min: 24,
        max: 24,
        name: 'Bandana',
        rawName: 'Bandana',
      },
      {
        min: 25,
        max: 25,
        name: 'Bandoleira de poções',
        rawName: 'Bandoleira de poções',
      },
      {
        min: 26,
        max: 30,
        name: 'Bomba',
        rawName: 'Bomba',
      },
      {
        min: 31,
        max: 31,
        name: 'Botas reforçadas',
        rawName: 'Botas reforçadas',
      },
      {
        min: 32,
        max: 32,
        name: 'Camisa bufante',
        rawName: 'Camisa bufante',
      },
      {
        min: 33,
        max: 33,
        name: 'Capa esvoaçante',
        rawName: 'Capa esvoaçante',
      },
      {
        min: 34,
        max: 34,
        name: 'Capa pesada',
        rawName: 'Capa pesada',
      },
      {
        min: 35,
        max: 35,
        name: 'Casaco longo',
        rawName: 'Casaco longo',
      },
      {
        min: 36,
        max: 36,
        name: 'Chapéu arcano',
        rawName: 'Chapéu arcano',
      },
      {
        min: 37,
        max: 38,
        name: 'Coleção de livros',
        rawName: 'Coleção de livros',
      },
      {
        min: 39,
        max: 40,
        name: 'Cosmético',
        rawName: 'Cosmético',
      },
      {
        min: 41,
        max: 42,
        name: 'Dente-de-dragão',
        rawName: 'Dente-de-dragão',
      },
      {
        min: 43,
        max: 43,
        name: 'Enfeite de elmo',
        rawName: 'Enfeite de elmo',
      },
      {
        min: 44,
        max: 44,
        name: 'Elixir do amor',
        rawName: 'Elixir do amor',
      },
      {
        min: 45,
        max: 46,
        name: 'Equipamento de viagem',
        rawName: 'Equipamento de viagem',
      },
      {
        min: 47,
        max: 56,
        name: 'Essência de mana',
        rawName: 'Essência de mana',
      },
      {
        min: 57,
        max: 57,
        name: 'Estojo de disfarces',
        rawName: 'Estojo de disfarces',
      },
      {
        min: 58,
        max: 58,
        name: 'Farrapos de ermitão',
        rawName: 'Farrapos de ermitão',
      },
      {
        min: 59,
        max: 59,
        name: 'Flauta mística',
        rawName: 'Flauta mística',
      },
      {
        min: 60,
        max: 66,
        name: 'Fogo alquímico',
        rawName: 'Fogo alquímico',
      },
      {
        min: 67,
        max: 67,
        name: 'Gorro de ervas',
        rawName: 'Gorro de ervas',
      },
      {
        min: 68,
        max: 69,
        name: 'Líquen lilás',
        rawName: 'Líquen lilás',
      },
      {
        min: 70,
        max: 70,
        name: 'Luneta',
        rawName: 'Luneta',
      },
      {
        min: 71,
        max: 71,
        name: 'Luva de pelica',
        rawName: 'Luva de pelica',
      },
      {
        min: 72,
        max: 73,
        name: 'Maleta de medicamentos',
        rawName: 'Maleta de medicamentos',
      },
      {
        min: 74,
        max: 74,
        name: 'Manopla',
        rawName: 'Manopla',
      },
      {
        min: 75,
        max: 75,
        name: 'Manto eclesiástico',
        rawName: 'Manto eclesiástico',
      },
      {
        min: 76,
        max: 78,
        name: 'Mochila de aventureiro',
        rawName: 'Mochila de aventureiro',
      },
      {
        min: 79,
        max: 80,
        name: 'Musgo púrpura',
        rawName: 'Musgo púrpura',
      },
      {
        min: 81,
        max: 81,
        name: 'Organizador de pergaminhos',
        rawName: 'Organizador de pergaminhos',
      },
      {
        min: 82,
        max: 83,
        name: 'Ossos de monstro',
        rawName: 'Ossos de monstro',
      },
      {
        min: 84,
        max: 85,
        name: 'Pó de cristal',
        rawName: 'Pó de cristal',
      },
      {
        min: 86,
        max: 87,
        name: 'Pó de giz',
        rawName: 'Pó de giz',
      },
      {
        min: 88,
        max: 88,
        name: 'Pó do desaparecimento',
        rawName: 'Pó do desaparecimento',
      },
      {
        min: 89,
        max: 89,
        name: 'Robe místico',
        rawName: 'Robe místico',
      },
      {
        min: 90,
        max: 91,
        name: 'Saco de sal',
        rawName: 'Saco de sal',
      },
      {
        min: 92,
        max: 92,
        name: 'Sapatos de camurça',
        rawName: 'Sapatos de camurça',
      },
      {
        min: 93,
        max: 94,
        name: 'Seixo de âmbar',
        rawName: 'Seixo de âmbar',
      },
      {
        min: 95,
        max: 95,
        name: 'Sela',
        rawName: 'Sela',
      },
      {
        min: 96,
        max: 96,
        name: 'Tabardo',
        rawName: 'Tabardo',
      },
      {
        min: 97,
        max: 97,
        name: 'Traje da corte',
        rawName: 'Traje da corte',
      },
      {
        min: 98,
        max: 99,
        name: 'Terra de cemitério',
        rawName: 'Terra de cemitério',
      },
      {
        min: 100,
        max: 100,
        name: 'Veste de seda',
        rawName: 'Veste de seda',
      },
    ],
    footnotes: [],
  },
  equipamentos: {
    armas: {
      rows: [
        {
          min: 1,
          max: 3,
          name: 'Adaga',
          rawName: 'Adaga',
        },
        {
          min: 4,
          max: 5,
          name: 'Alabarda',
          rawName: 'Alabarda',
        },
        {
          min: 6,
          max: 7,
          name: 'Alfange',
          rawName: 'Alfange',
        },
        {
          min: 8,
          max: 10,
          name: 'Arco curto',
          rawName: 'Arco curto',
        },
        {
          min: 11,
          max: 13,
          name: 'Arco longo',
          rawName: 'Arco longo',
        },
        {
          min: 14,
          max: 15,
          name: 'Azagaia',
          rawName: 'Azagaia',
        },
        {
          min: 16,
          max: 16,
          name: 'Balas (20)',
          rawName: 'Balas (20)',
        },
        {
          min: 17,
          max: 18,
          name: 'Besta leve',
          rawName: 'Besta leve',
        },
        {
          min: 19,
          max: 20,
          name: 'Besta pesada',
          rawName: 'Besta pesada',
        },
        {
          min: 21,
          max: 23,
          name: 'Bordão',
          rawName: 'Bordão',
        },
        {
          min: 24,
          max: 24,
          name: 'Chicote',
          rawName: 'Chicote',
        },
        {
          min: 25,
          max: 27,
          name: 'Cimitarra',
          rawName: 'Cimitarra',
        },
        {
          min: 28,
          max: 30,
          name: 'Clava',
          rawName: 'Clava',
        },
        {
          min: 31,
          max: 31,
          name: 'Corrente de espinhos',
          rawName: 'Corrente de espinhos',
        },
        {
          min: 32,
          max: 33,
          name: 'Espada bastarda',
          rawName: 'Espada bastarda',
        },
        {
          min: 34,
          max: 38,
          name: 'Espada curta',
          rawName: 'Espada curta',
        },
        {
          min: 39,
          max: 43,
          name: 'Espada longa',
          rawName: 'Espada longa',
        },
        {
          min: 44,
          max: 46,
          name: 'Flechas (20)',
          rawName: 'Flechas (20)',
        },
        {
          min: 47,
          max: 49,
          name: 'Florete',
          rawName: 'Florete',
        },
        {
          min: 50,
          max: 51,
          name: 'Foice',
          rawName: 'Foice',
        },
        {
          min: 52,
          max: 53,
          name: 'Funda',
          rawName: 'Funda',
        },
        {
          min: 54,
          max: 55,
          name: 'Gadanho',
          rawName: 'Gadanho',
        },
        {
          min: 56,
          max: 56,
          name: 'Katana',
          rawName: 'Katana',
        },
        {
          min: 57,
          max: 59,
          name: 'Lança',
          rawName: 'Lança',
        },
        {
          min: 60,
          max: 60,
          name: 'Lança montada',
          rawName: 'Lança montada',
        },
        {
          min: 61,
          max: 63,
          name: 'Maça',
          rawName: 'Maça',
        },
        {
          min: 64,
          max: 66,
          name: 'Machadinha',
          rawName: 'Machadinha',
        },
        {
          min: 67,
          max: 67,
          name: 'Machado anão',
          rawName: 'Machado anão',
        },
        {
          min: 68,
          max: 70,
          name: 'Machado de batalha',
          rawName: 'Machado de batalha',
        },
        {
          min: 71,
          max: 73,
          name: 'Machado de guerra',
          rawName: 'Machado de guerra',
        },
        {
          min: 74,
          max: 74,
          name: 'Machado táurico',
          rawName: 'Machado táurico',
        },
        {
          min: 75,
          max: 76,
          name: 'Mangual',
          rawName: 'Mangual',
        },
        {
          min: 77,
          max: 77,
          name: 'Marreta',
          rawName: 'Marreta',
        },
        {
          min: 78,
          max: 80,
          name: 'Martelo de guerra',
          rawName: 'Martelo de guerra',
        },
        {
          min: 81,
          max: 83,
          name: 'Montante',
          rawName: 'Montante',
        },
        {
          min: 84,
          max: 84,
          name: 'Mosquete',
          rawName: 'Mosquete',
        },
        {
          min: 85,
          max: 85,
          name: 'Pedras (20)',
          rawName: 'Pedras (20)',
        },
        {
          min: 86,
          max: 88,
          name: 'Picareta',
          rawName: 'Picareta',
        },
        {
          min: 89,
          max: 90,
          name: 'Pique',
          rawName: 'Pique',
        },
        {
          min: 91,
          max: 92,
          name: 'Pistola',
          rawName: 'Pistola',
        },
        {
          min: 93,
          max: 93,
          name: 'Rede',
          rawName: 'Rede',
        },
        {
          min: 94,
          max: 96,
          name: 'Tacape',
          rawName: 'Tacape',
        },
        {
          min: 97,
          max: 98,
          name: 'Tridente',
          rawName: 'Tridente',
        },
        {
          min: 99,
          max: 100,
          name: 'Virotes (20)',
          rawName: 'Virotes (20)',
        },
      ],
      footnotes: [],
    },
    armaduras: {
      rows: [
        {
          min: 1,
          max: 5,
          name: 'Couro',
          rawName: 'Couro',
        },
        {
          min: 6,
          max: 10,
          name: 'Brunea',
          rawName: 'Brunea',
        },
        {
          min: 11,
          max: 25,
          name: 'Completa',
          rawName: 'Completa',
        },
        {
          min: 26,
          max: 30,
          name: 'Cota de malha',
          rawName: 'Cota de malha',
        },
        {
          min: 31,
          max: 45,
          name: 'Couraça',
          rawName: 'Couraça',
        },
        {
          min: 46,
          max: 55,
          name: 'Couro batido',
          rawName: 'Couro batido',
        },
        {
          min: 56,
          max: 65,
          name: 'Escudo leve',
          rawName: 'Escudo leve',
        },
        {
          min: 66,
          max: 80,
          name: 'Escudo pesado',
          rawName: 'Escudo pesado',
        },
        {
          min: 81,
          max: 85,
          name: 'Gibão de peles',
          rawName: 'Gibão de peles',
        },
        {
          min: 86,
          max: 90,
          name: 'Loriga segmentada',
          rawName: 'Loriga segmentada',
        },
        {
          min: 91,
          max: 100,
          name: 'Meia armadura',
          rawName: 'Meia armadura',
        },
      ],
      footnotes: [],
    },
    esotericos: {
      rows: [
        {
          min: 1,
          max: 10,
          name: 'Bolsa de pó',
          rawName: 'Bolsa de pó',
        },
        {
          min: 11,
          max: 25,
          name: 'Cajado arcano',
          rawName: 'Cajado arcano',
        },
        {
          min: 26,
          max: 35,
          name: 'Cetro elemental',
          rawName: 'Cetro elemental',
        },
        {
          min: 36,
          max: 42,
          name: 'Costela de lich',
          rawName: 'Costela de lich',
        },
        {
          min: 43,
          max: 50,
          name: 'Dedo de ente',
          rawName: 'Dedo de ente',
        },
        {
          min: 51,
          max: 55,
          name: 'Luva de ferro',
          rawName: 'Luva de ferro',
        },
        {
          min: 56,
          max: 65,
          name: 'Medalhão de prata',
          rawName: 'Medalhão de prata',
        },
        {
          min: 66,
          max: 75,
          name: 'Orbe cristalina',
          rawName: 'Orbe cristalina',
        },
        {
          min: 76,
          max: 85,
          name: 'Tomo hermético',
          rawName: 'Tomo hermético',
        },
        {
          min: 86,
          max: 100,
          name: 'Varinha arcana',
          rawName: 'Varinha arcana',
        },
      ],
      footnotes: [],
    },
  },
  pocoes: {
    rows: [
      {
        min: 1,
        max: 1,
        name: 'Abençoar Alimentos (óleo)',
        rawName: 'Abençoar Alimentos (óleo)',
        price: 30,
      },
      {
        min: 2,
        max: 3,
        name: 'Área Escorregadia (granada)',
        rawName: 'Área Escorregadia (granada)',
        price: 30,
      },
      {
        min: 4,
        max: 6,
        name: 'Arma Mágica (óleo)',
        rawName: 'Arma Mágica (óleo)',
        price: 30,
      },
      {
        min: 7,
        max: 7,
        name: 'Compreensão',
        rawName: 'Compreensão',
        price: 30,
      },
      {
        min: 8,
        max: 15,
        name: 'Curar Ferimentos (2d8+2 PV)',
        rawName: 'Curar Ferimentos (2d8+2 PV)',
        price: 30,
      },
      {
        min: 16,
        max: 18,
        name: 'Disfarce Ilusório',
        rawName: 'Disfarce Ilusório',
        price: 30,
      },
      {
        min: 19,
        max: 20,
        name: 'Escuridão (óleo)',
        rawName: 'Escuridão (óleo)',
        price: 30,
      },
      {
        min: 21,
        max: 22,
        name: 'Luz (óleo)',
        rawName: 'Luz (óleo)',
        price: 30,
      },
      {
        min: 23,
        max: 24,
        name: 'Névoa (granada)',
        rawName: 'Névoa (granada)',
        price: 30,
      },
      {
        min: 25,
        max: 26,
        name: 'Primor Atlético',
        rawName: 'Primor Atlético',
        price: 30,
      },
      {
        min: 27,
        max: 28,
        name: 'Proteção Divina',
        rawName: 'Proteção Divina',
        price: 30,
      },
      {
        min: 29,
        max: 30,
        name: 'Resistência a Energia',
        rawName: 'Resistência a Energia',
        price: 30,
      },
      {
        min: 31,
        max: 32,
        name: 'Sono',
        rawName: 'Sono',
        price: 30,
      },
      {
        min: 33,
        max: 33,
        name: 'Suporte Ambiental',
        rawName: 'Suporte Ambiental',
        price: 30,
      },
      {
        min: 34,
        max: 34,
        name: 'Tranca Arcana (óleo)',
        rawName: 'Tranca Arcana (óleo)',
        price: 30,
      },
      {
        min: 35,
        max: 35,
        name: 'Visão Mística',
        rawName: 'Visão Mística',
        price: 30,
      },
      {
        min: 36,
        max: 36,
        name: 'Vitalidade Fantasma',
        rawName: 'Vitalidade Fantasma',
        price: 30,
      },
      {
        min: 37,
        max: 38,
        name: 'Escudo da Fé (aprimoramento para duração cena)',
        rawName: 'Escudo da Fé (aprimoramento para duração cena)',
        price: 120,
      },
      {
        min: 39,
        max: 40,
        name: 'Alterar Tamanho',
        rawName: 'Alterar Tamanho',
        price: 270,
      },
      {
        min: 41,
        max: 42,
        name: 'Aparência Perfeita',
        rawName: 'Aparência Perfeita',
        price: 270,
      },
      {
        min: 43,
        max: 43,
        name: 'Armamento da Natureza (óleo)',
        rawName: 'Armamento da Natureza (óleo)',
        price: 270,
      },
      {
        min: 44,
        max: 49,
        name: 'Bola de Fogo (granada)',
        rawName: 'Bola de Fogo (granada)',
        price: 270,
      },
      {
        min: 50,
        max: 51,
        name: 'Camuflagem Ilusória',
        rawName: 'Camuflagem Ilusória',
        price: 270,
      },
      {
        min: 52,
        max: 53,
        name: 'Concentração de Combate (aprimoramento para duração cena)',
        rawName: 'Concentração de Combate (aprimoramento para duração cena)',
        price: 270,
      },
      {
        min: 54,
        max: 62,
        name: 'Curar Ferimentos (4d8+4 PV)',
        rawName: 'Curar Ferimentos (4d8+4 PV)',
        price: 270,
      },
      {
        min: 63,
        max: 66,
        name: 'Físico Divino',
        rawName: 'Físico Divino',
        price: 270,
      },
      {
        min: 67,
        max: 68,
        name: 'Mente Divina',
        rawName: 'Mente Divina',
        price: 270,
      },
      {
        min: 69,
        max: 70,
        name: 'Metamorfose',
        rawName: 'Metamorfose',
        price: 270,
      },
      {
        min: 71,
        max: 75,
        name: 'Purificação',
        rawName: 'Purificação',
        price: 270,
      },
      {
        min: 76,
        max: 77,
        name: 'Velocidade',
        rawName: 'Velocidade',
        price: 270,
      },
      {
        min: 78,
        max: 79,
        name: 'Vestimenta da Fé (óleo)',
        rawName: 'Vestimenta da Fé (óleo)',
        price: 270,
      },
      {
        min: 80,
        max: 80,
        name: 'Voz Divina',
        rawName: 'Voz Divina',
        price: 270,
      },
      {
        min: 81,
        max: 82,
        name: 'Arma Mágica (óleo; aprimoramento para bônus +3)',
        rawName: 'Arma Mágica (óleo; aprimoramento para bônus +3)',
        price: 750,
      },
      {
        min: 83,
        max: 88,
        name: 'Curar Ferimentos (7d8+7 PV)',
        rawName: 'Curar Ferimentos (7d8+7 PV)',
        price: 1080,
      },
      {
        min: 89,
        max: 89,
        name: 'Físico Divino (aprimoramento para três atributos)',
        rawName: 'Físico Divino (aprimoramento para três atributos)',
        price: 1080,
      },
      {
        min: 90,
        max: 92,
        name: 'Invisibilidade (aprimoramento para duração cena)',
        rawName: 'Invisibilidade (aprimoramento para duração cena)',
        price: 1080,
      },
      {
        min: 93,
        max: 96,
        name: 'Bola de Fogo (granada; aprimoramento para 10d6 de dano)',
        rawName: 'Bola de Fogo (granada; aprimoramento para 10d6 de dano)',
        price: 1470,
      },
      {
        min: 97,
        max: 100,
        name: 'Curar Ferimentos (11d8+11 PV)',
        rawName: 'Curar Ferimentos (11d8+11 PV)',
        price: 3000,
      },
    ],
    footnotes: [],
  },
  superiores: {
    armas: {
      rows: [
        {
          min: 1,
          max: 10,
          name: 'Atroz',
          rawName: 'Atroz 1',
          marker: '1',
        },
        {
          min: 11,
          max: 13,
          name: 'Banhada a ouro',
          rawName: 'Banhada a ouro',
        },
        {
          min: 14,
          max: 23,
          name: 'Certeira',
          rawName: 'Certeira',
        },
        {
          min: 24,
          max: 26,
          name: 'Cravejada de gemas',
          rawName: 'Cravejada de gemas',
        },
        {
          min: 27,
          max: 36,
          name: 'Cruel',
          rawName: 'Cruel',
        },
        {
          min: 37,
          max: 39,
          name: 'Discreta',
          rawName: 'Discreta',
        },
        {
          min: 40,
          max: 44,
          name: 'Equilibrada',
          rawName: 'Equilibrada',
        },
        {
          min: 45,
          max: 48,
          name: 'Harmonizada',
          rawName: 'Harmonizada',
        },
        {
          min: 49,
          max: 53,
          name: 'Injeção alquímica',
          rawName: 'Injeção alquímica',
        },
        {
          min: 54,
          max: 55,
          name: 'Macabra',
          rawName: 'Macabra',
        },
        {
          min: 56,
          max: 65,
          name: 'Maciça',
          rawName: 'Maciça',
        },
        {
          min: 66,
          max: 75,
          name: 'Material especial',
          rawName: 'Material especial 2',
          marker: '2',
        },
        {
          min: 76,
          max: 80,
          name: 'Mira telescópica',
          rawName: 'Mira telescópica',
        },
        {
          min: 81,
          max: 90,
          name: 'Precisa',
          rawName: 'Precisa',
        },
        {
          min: 91,
          max: 100,
          name: 'Pungente',
          rawName: 'Pungente 1',
          marker: '1',
        },
      ],
      footnotes: [
        '1 Conta como duas melhorias. Se o item só possuir uma, role novamente.',
        '2 Role 1d6 para definir o material: 1) aço-rubi, 2) adamante, 3) gelo eterno, 4) madeira Tollon, 5) matéria vermelha, 6) mitral.',
      ],
    },
    armaduras: {
      rows: [
        {
          min: 1,
          max: 15,
          name: 'Ajustada',
          rawName: 'Ajustada',
        },
        {
          min: 16,
          max: 19,
          name: 'Banhada a ouro',
          rawName: 'Banhada a ouro',
        },
        {
          min: 20,
          max: 23,
          name: 'Cravejada de gemas',
          rawName: 'Cravejada de gemas',
        },
        {
          min: 24,
          max: 28,
          name: 'Delicada',
          rawName: 'Delicada',
        },
        {
          min: 29,
          max: 32,
          name: 'Discreta',
          rawName: 'Discreta',
        },
        {
          min: 33,
          max: 37,
          name: 'Espinhos',
          rawName: 'Espinhos',
        },
        {
          min: 38,
          max: 40,
          name: 'Macabra',
          rawName: 'Macabra',
        },
        {
          min: 41,
          max: 50,
          name: 'Material especial',
          rawName: 'Material especial 2',
          marker: '2',
        },
        {
          min: 51,
          max: 55,
          name: 'Polida',
          rawName: 'Polida',
        },
        {
          min: 56,
          max: 80,
          name: 'Reforçada',
          rawName: 'Reforçada',
        },
        {
          min: 81,
          max: 90,
          name: 'Selada',
          rawName: 'Selada',
        },
        {
          min: 91,
          max: 100,
          name: 'Sob medida',
          rawName: 'Sob medida 1',
          marker: '1',
        },
      ],
      footnotes: [],
    },
    esotericos: {
      rows: [
        {
          min: 1,
          max: 4,
          name: 'Banhada a ouro',
          rawName: 'Banhada a ouro',
        },
        {
          min: 5,
          max: 8,
          name: 'Cravejada de gemas',
          rawName: 'Cravejada de gemas',
        },
        {
          min: 9,
          max: 12,
          name: 'Discreto',
          rawName: 'Discreto',
        },
        {
          min: 13,
          max: 27,
          name: 'Energético',
          rawName: 'Energético',
        },
        {
          min: 28,
          max: 42,
          name: 'Harmonizado',
          rawName: 'Harmonizado',
        },
        {
          min: 43,
          max: 45,
          name: 'Macabra',
          rawName: 'Macabra',
        },
        {
          min: 46,
          max: 54,
          name: 'Material especial',
          rawName: 'Material especial 2',
          marker: '2',
        },
        {
          min: 55,
          max: 70,
          name: 'Poderoso',
          rawName: 'Poderoso',
        },
        {
          min: 71,
          max: 85,
          name: 'Potencializador',
          rawName: 'Potencializador',
        },
        {
          min: 86,
          max: 100,
          name: 'Vigilante',
          rawName: 'Vigilante',
        },
      ],
      footnotes: [],
    },
  },
  magicos: {
    armas: {
      rows: [
        {
          min: 1,
          max: 5,
          name: 'Ameaçadora',
          rawName: 'Ameaçadora',
        },
        {
          min: 6,
          max: 10,
          name: 'Anticriatura',
          rawName: 'Anticriatura',
        },
        {
          min: 11,
          max: 12,
          name: 'Arremesso',
          rawName: 'Arremesso',
        },
        {
          min: 13,
          max: 14,
          name: 'Assassina',
          rawName: 'Assassina',
        },
        {
          min: 15,
          max: 16,
          name: 'Caçadora',
          rawName: 'Caçadora',
        },
        {
          min: 17,
          max: 21,
          name: 'Congelante',
          rawName: 'Congelante',
        },
        {
          min: 22,
          max: 23,
          name: 'Conjuradora',
          rawName: 'Conjuradora',
        },
        {
          min: 24,
          max: 28,
          name: 'Corrosiva',
          rawName: 'Corrosiva',
        },
        {
          min: 29,
          max: 30,
          name: 'Dançarina',
          rawName: 'Dançarina',
        },
        {
          min: 31,
          max: 34,
          name: 'Defensora',
          rawName: 'Defensora',
        },
        {
          min: 35,
          max: 36,
          name: 'Destruidora',
          rawName: 'Destruidora',
        },
        {
          min: 37,
          max: 38,
          name: 'Dilacerante',
          rawName: 'Dilacerante',
        },
        {
          min: 39,
          max: 40,
          name: 'Drenante',
          rawName: 'Drenante',
        },
        {
          min: 41,
          max: 45,
          name: 'Elétrica',
          rawName: 'Elétrica',
        },
        {
          min: 46,
          max: 46,
          name: 'Energética',
          rawName: 'Energética*',
          marker: '*',
        },
        {
          min: 47,
          max: 48,
          name: 'Excruciante',
          rawName: 'Excruciante',
        },
        {
          min: 49,
          max: 53,
          name: 'Flamejante',
          rawName: 'Flamejante',
        },
        {
          min: 54,
          max: 63,
          name: 'Formidável',
          rawName: 'Formidável',
        },
        {
          min: 64,
          max: 64,
          name: 'Lancinante',
          rawName: 'Lancinante*',
          marker: '*',
        },
        {
          min: 65,
          max: 72,
          name: 'Magnífica',
          rawName: 'Magnífica*',
          marker: '*',
        },
        {
          min: 73,
          max: 74,
          name: 'Piedosa',
          rawName: 'Piedosa',
        },
        {
          min: 75,
          max: 76,
          name: 'Profana',
          rawName: 'Profana',
        },
        {
          min: 77,
          max: 78,
          name: 'Sagrada',
          rawName: 'Sagrada',
        },
        {
          min: 79,
          max: 80,
          name: 'Sanguinária',
          rawName: 'Sanguinária',
        },
        {
          min: 81,
          max: 82,
          name: 'Trovejante',
          rawName: 'Trovejante',
        },
        {
          min: 83,
          max: 84,
          name: 'Tumular',
          rawName: 'Tumular',
        },
        {
          min: 85,
          max: 88,
          name: 'Veloz',
          rawName: 'Veloz',
        },
        {
          min: 89,
          max: 90,
          name: 'Venenosa',
          rawName: 'Venenosa',
        },
        {
          min: 91,
          max: 100,
          name: 'Arma específica',
          rawName: 'Arma específica',
          rollOnSpecificTable: true,
        },
      ],
      footnotes: [
        '*Conta como dois encantos. Para itens menores, role novamente.',
      ],
    },
    armasEspecificas: {
      rows: [
        {
          min: 1,
          max: 5,
          name: 'Azagaia dos relâmpagos',
          rawName: 'Azagaia dos relâmpagos',
          price: 30000,
        },
        {
          min: 6,
          max: 15,
          name: 'Espada baronial',
          rawName: 'Espada baronial',
          price: 30000,
        },
        {
          min: 16,
          max: 25,
          name: 'Lâmina da luz',
          rawName: 'Lâmina da luz',
          price: 45000,
        },
        {
          min: 26,
          max: 30,
          name: 'Lança animalesca',
          rawName: 'Lança animalesca',
          price: 45000,
        },
        {
          min: 31,
          max: 35,
          name: 'Maça do terror',
          rawName: 'Maça do terror',
          price: 45000,
        },
        {
          min: 36,
          max: 40,
          name: 'Florete fugaz',
          rawName: 'Florete fugaz',
          price: 50000,
        },
        {
          min: 41,
          max: 45,
          name: 'Cajado da destruição',
          rawName: 'Cajado da destruição',
          price: 60000,
        },
        {
          min: 46,
          max: 50,
          name: 'Cajado da vida',
          rawName: 'Cajado da vida',
          price: 60000,
        },
        {
          min: 51,
          max: 55,
          name: 'Machado silvestre',
          rawName: 'Machado silvestre',
          price: 70000,
        },
        {
          min: 56,
          max: 60,
          name: 'Martelo de Doherimm',
          rawName: 'Martelo de Doherimm',
          price: 70000,
        },
        {
          min: 61,
          max: 67,
          name: 'Arco do poder',
          rawName: 'Arco do poder',
          price: 90000,
        },
        {
          min: 68,
          max: 72,
          name: 'Língua do deserto',
          rawName: 'Língua do deserto',
          price: 90000,
        },
        {
          min: 73,
          max: 77,
          name: 'Besta explosiva',
          rawName: 'Besta explosiva',
          price: 100000,
        },
        {
          min: 78,
          max: 82,
          name: 'Punhal sszzaazita',
          rawName: 'Punhal sszzaazita',
          price: 100000,
        },
        {
          min: 83,
          max: 87,
          name: 'Espada sortuda',
          rawName: 'Espada sortuda',
          price: 110000,
        },
        {
          min: 88,
          max: 92,
          name: 'Avalanche',
          rawName: 'Avalanche',
          price: 140000,
        },
        {
          min: 93,
          max: 95,
          name: 'Cajado do poder',
          rawName: 'Cajado do poder',
          price: 180000,
        },
        {
          min: 96,
          max: 100,
          name: 'Vingadora sagrada',
          rawName: 'Vingadora sagrada',
          price: 200000,
        },
      ],
      footnotes: [],
    },
    armaduras: {
      rows: [
        {
          min: 1,
          max: 6,
          name: 'Abascanto',
          rawName: 'Abascanto',
        },
        {
          min: 7,
          max: 10,
          name: 'Abençoado',
          rawName: 'Abençoado',
        },
        {
          min: 11,
          max: 12,
          name: 'Acrobático',
          rawName: 'Acrobático',
        },
        {
          min: 13,
          max: 14,
          name: 'Alado',
          rawName: 'Alado',
        },
        {
          min: 15,
          max: 16,
          name: 'Animado',
          rawName: 'Animado 1',
          marker: '1',
        },
        {
          min: 17,
          max: 18,
          name: 'Assustador',
          rawName: 'Assustador',
        },
        {
          min: 19,
          max: 22,
          name: 'Cáustica',
          rawName: 'Cáustica',
        },
        {
          min: 23,
          max: 32,
          name: 'Defensor',
          rawName: 'Defensor',
        },
        {
          min: 33,
          max: 34,
          name: 'Escorregadio',
          rawName: 'Escorregadio',
        },
        {
          min: 35,
          max: 36,
          name: 'Esmagador',
          rawName: 'Esmagador 1',
          marker: '1',
        },
        {
          min: 37,
          max: 38,
          name: 'Fantasmagórico',
          rawName: 'Fantasmagórico',
        },
        {
          min: 39,
          max: 40,
          name: 'Fortificado',
          rawName: 'Fortificado',
        },
        {
          min: 41,
          max: 44,
          name: 'Gélido',
          rawName: 'Gélido',
        },
        {
          min: 45,
          max: 54,
          name: 'Guardião',
          rawName: 'Guardião 2',
          marker: '2',
        },
        {
          min: 55,
          max: 56,
          name: 'Hipnótico',
          rawName: 'Hipnótico',
        },
        {
          min: 57,
          max: 58,
          name: 'Ilusório',
          rawName: 'Ilusório',
        },
        {
          min: 59,
          max: 62,
          name: 'Incandescente',
          rawName: 'Incandescente',
        },
        {
          min: 63,
          max: 68,
          name: 'Invulnerável',
          rawName: 'Invulnerável',
        },
        {
          min: 69,
          max: 72,
          name: 'Opaco',
          rawName: 'Opaco',
        },
        {
          min: 73,
          max: 78,
          name: 'Protetor',
          rawName: 'Protetor',
        },
        {
          min: 79,
          max: 80,
          name: 'Refletor',
          rawName: 'Refletor',
        },
        {
          min: 81,
          max: 84,
          name: 'Relampejante',
          rawName: 'Relampejante',
        },
        {
          min: 85,
          max: 86,
          name: 'Reluzente',
          rawName: 'Reluzente',
        },
        {
          min: 87,
          max: 88,
          name: 'Sombrio',
          rawName: 'Sombrio',
        },
        {
          min: 89,
          max: 90,
          name: 'Zeloso',
          rawName: 'Zeloso',
        },
        {
          min: 91,
          max: 100,
          name: 'Item específico',
          rawName: 'Item específico',
          rollOnSpecificTable: true,
        },
      ],
      footnotes: [
        '1 Apenas escudos. Para armaduras, role novamente.',
        '2 Conta como dois encantos. Para itens menores, role novamente.',
      ],
    },
    armadurasEspecificas: {
      rows: [
        {
          min: 1,
          max: 10,
          name: 'Cota élfica',
          rawName: 'Cota élfica',
          price: 30000,
        },
        {
          min: 11,
          max: 20,
          name: 'Couro de monstro',
          rawName: 'Couro de monstro',
          price: 36000,
        },
        {
          min: 21,
          max: 25,
          name: 'Escudo do conjurador',
          rawName: 'Escudo do conjurador',
          price: 45000,
        },
        {
          min: 26,
          max: 32,
          name: 'Loriga do centurião',
          rawName: 'Loriga do centurião',
          price: 45000,
        },
        {
          min: 33,
          max: 42,
          name: 'Manto da noite',
          rawName: 'Manto da noite',
          price: 45000,
        },
        {
          min: 43,
          max: 49,
          name: 'Couraça do comando',
          rawName: 'Couraça do comando',
          price: 45000,
        },
        {
          min: 50,
          max: 59,
          name: 'Baluarte anão',
          rawName: 'Baluarte anão',
          price: 50000,
        },
        {
          min: 60,
          max: 66,
          name: 'Escudo espinhoso',
          rawName: 'Escudo espinhoso',
          price: 50000,
        },
        {
          min: 67,
          max: 76,
          name: 'Escudo do leão',
          rawName: 'Escudo do leão',
          price: 50000,
        },
        {
          min: 77,
          max: 83,
          name: 'Carapaça demoníaca',
          rawName: 'Carapaça demoníaca',
          price: 63000,
        },
        {
          min: 84,
          max: 88,
          name: 'Escudo do eclipse',
          rawName: 'Escudo do eclipse',
          price: 70000,
        },
        {
          min: 89,
          max: 93,
          name: 'Escudo de Azgher',
          rawName: 'Escudo de Azgher',
          price: 140000,
        },
        {
          min: 94,
          max: 100,
          name: 'Armadura da luz',
          rawName: 'Armadura da luz',
          price: 150000,
        },
      ],
      footnotes: [],
    },
  },
  acessorios: {
    menor: {
      rows: [
        {
          min: 1,
          max: 2,
          name: 'Anel do sustento',
          rawName: 'Anel do sustento',
          price: 3000,
        },
        {
          min: 3,
          max: 7,
          name: 'Bainha mágica',
          rawName: 'Bainha mágica',
          price: 3000,
        },
        {
          min: 8,
          max: 12,
          name: 'Corda da escalada',
          rawName: 'Corda da escalada',
          price: 3000,
        },
        {
          min: 13,
          max: 14,
          name: 'Ferraduras da velocidade',
          rawName: 'Ferraduras da velocidade',
          price: 3000,
        },
        {
          min: 15,
          max: 19,
          name: 'Garrafa da fumaça eterna',
          rawName: 'Garrafa da fumaça eterna',
          price: 3000,
        },
        {
          min: 20,
          max: 24,
          name: 'Gema da luminosidade',
          rawName: 'Gema da luminosidade',
          price: 3000,
        },
        {
          min: 25,
          max: 29,
          name: 'Manto élfico',
          rawName: 'Manto élfico',
          price: 3000,
        },
        {
          min: 30,
          max: 34,
          name: 'Mochila de carga',
          rawName: 'Mochila de carga',
          price: 3000,
        },
        {
          min: 35,
          max: 40,
          name: 'Brincos da sagacidade',
          rawName: 'Brincos da sagacidade',
          price: 4500,
        },
        {
          min: 41,
          max: 46,
          name: 'Luvas da delicadeza',
          rawName: 'Luvas da delicadeza',
          price: 4500,
        },
        {
          min: 47,
          max: 52,
          name: 'Manoplas da força do ogro',
          rawName: 'Manoplas da força do ogro',
          price: 4500,
        },
        {
          min: 53,
          max: 59,
          name: 'Manto da resistência',
          rawName: 'Manto da resistência',
          price: 4500,
        },
        {
          min: 60,
          max: 65,
          name: 'Manto do fascínio',
          rawName: 'Manto do fascínio',
          price: 4500,
        },
        {
          min: 66,
          max: 71,
          name: 'Pingente da sensatez',
          rawName: 'Pingente da sensatez',
          price: 4500,
        },
        {
          min: 72,
          max: 77,
          name: 'Torque do vigor',
          rawName: 'Torque do vigor',
          price: 4500,
        },
        {
          min: 78,
          max: 82,
          name: 'Chapéu do disfarce',
          rawName: 'Chapéu do disfarce',
          price: 6000,
        },
        {
          min: 83,
          max: 84,
          name: 'Flauta fantasma',
          rawName: 'Flauta fantasma',
          price: 6000,
        },
        {
          min: 85,
          max: 89,
          name: 'Lanterna da revelação',
          rawName: 'Lanterna da revelação',
          price: 6000,
        },
        {
          min: 90,
          max: 96,
          name: 'Anel da proteção',
          rawName: 'Anel da proteção',
          price: 9000,
        },
        {
          min: 97,
          max: 98,
          name: 'Anel do escudo mental',
          rawName: 'Anel do escudo mental',
          price: 9000,
        },
        {
          min: 99,
          max: 100,
          name: 'Pingente da saúde',
          rawName: 'Pingente da saúde',
          price: 9000,
        },
      ],
      footnotes: [],
    },
    medio: {
      rows: [
        {
          min: 1,
          max: 4,
          name: 'Anel de telecinesia',
          rawName: 'Anel de telecinesia',
          price: 10500,
        },
        {
          min: 5,
          max: 8,
          name: 'Bola de cristal',
          rawName: 'Bola de cristal',
          price: 10500,
        },
        {
          min: 9,
          max: 10,
          name: 'Caveira maldita',
          rawName: 'Caveira maldita',
          price: 10500,
        },
        {
          min: 11,
          max: 14,
          name: 'Botas aladas',
          rawName: 'Botas aladas',
          price: 15000,
        },
        {
          min: 15,
          max: 18,
          name: 'Braceletes de bronze',
          rawName: 'Braceletes de bronze',
          price: 16500,
        },
        {
          min: 19,
          max: 24,
          name: 'Anel da energia',
          rawName: 'Anel da energia',
          price: 21000,
        },
        {
          min: 25,
          max: 30,
          name: 'Anel da vitalidade',
          rawName: 'Anel da vitalidade',
          price: 21000,
        },
        {
          min: 31,
          max: 34,
          name: 'Anel de invisibilidade',
          rawName: 'Anel de invisibilidade',
          price: 21000,
        },
        {
          min: 35,
          max: 38,
          name: 'Braçadeiras do arqueiro',
          rawName: 'Braçadeiras do arqueiro',
          price: 21000,
        },
        {
          min: 39,
          max: 42,
          name: 'Brincos de Marah',
          rawName: 'Brincos de Marah',
          price: 21000,
        },
        {
          min: 43,
          max: 46,
          name: 'Faixas do pugilista',
          rawName: 'Faixas do pugilista',
          price: 21000,
        },
        {
          min: 47,
          max: 50,
          name: 'Manto da aranha',
          rawName: 'Manto da aranha',
          price: 21000,
        },
        {
          min: 51,
          max: 54,
          name: 'Vassoura voadora',
          rawName: 'Vassoura voadora',
          price: 21000,
        },
        {
          min: 55,
          max: 58,
          name: 'Símbolo abençoado',
          rawName: 'Símbolo abençoado',
          price: 21000,
        },
        {
          min: 59,
          max: 64,
          name: 'Amuleto da robustez',
          rawName: 'Amuleto da robustez',
          price: 25500,
        },
        {
          min: 65,
          max: 68,
          name: 'Botas velozes',
          rawName: 'Botas velozes',
          price: 25500,
        },
        {
          min: 69,
          max: 74,
          name: 'Cinto da força do gigante',
          rawName: 'Cinto da força do gigante',
          price: 25500,
        },
        {
          min: 75,
          max: 80,
          name: 'Coroa majestosa',
          rawName: 'Coroa majestosa',
          price: 25500,
        },
        {
          min: 81,
          max: 86,
          name: 'Estola da serenidade',
          rawName: 'Estola da serenidade',
          price: 25500,
        },
        {
          min: 87,
          max: 88,
          name: 'Manto do morcego',
          rawName: 'Manto do morcego',
          price: 25500,
        },
        {
          min: 89,
          max: 94,
          name: 'Pulseiras da celeridade',
          rawName: 'Pulseiras da celeridade',
          price: 25500,
        },
        {
          min: 95,
          max: 100,
          name: 'Tiara da sapiência',
          rawName: 'Tiara da sapiência',
          price: 25500,
        },
      ],
      footnotes: [],
    },
    maior: {
      rows: [
        {
          min: 1,
          max: 2,
          name: 'Elmo do teletransporte',
          rawName: 'Elmo do teletransporte',
          price: 30000,
        },
        {
          min: 3,
          max: 4,
          name: 'Gema da telepatia',
          rawName: 'Gema da telepatia',
          price: 30000,
        },
        {
          min: 5,
          max: 9,
          name: 'Gema elemental',
          rawName: 'Gema elemental',
          price: 30000,
        },
        {
          min: 10,
          max: 15,
          name: 'Manual da saúde corporal',
          rawName: 'Manual da saúde corporal',
          price: 30000,
        },
        {
          min: 16,
          max: 21,
          name: 'Manual do bom exercício',
          rawName: 'Manual do bom exercício',
          price: 30000,
        },
        {
          min: 22,
          max: 27,
          name: 'Manual dos movimentos precisos',
          rawName: 'Manual dos movimentos precisos',
          price: 30000,
        },
        {
          min: 28,
          max: 34,
          name: 'Medalhão de Lena',
          rawName: 'Medalhão de Lena',
          price: 30000,
        },
        {
          min: 35,
          max: 40,
          name: 'Tomo da compreensão',
          rawName: 'Tomo da compreensão',
          price: 30000,
        },
        {
          min: 41,
          max: 46,
          name: 'Tomo da liderança e influência',
          rawName: 'Tomo da liderança e influência',
          price: 30000,
        },
        {
          min: 47,
          max: 52,
          name: 'Tomo dos grandes pensamentos',
          rawName: 'Tomo dos grandes pensamentos',
          price: 30000,
        },
        {
          min: 53,
          max: 57,
          name: 'Anel refletor',
          rawName: 'Anel refletor',
          price: 51000,
        },
        {
          min: 58,
          max: 60,
          name: 'Cinto do campeão',
          rawName: 'Cinto do campeão',
          price: 51000,
        },
        {
          min: 61,
          max: 67,
          name: 'Colar guardião',
          rawName: 'Colar guardião',
          price: 51000,
        },
        {
          min: 68,
          max: 72,
          name: 'Estatueta animista',
          rawName: 'Estatueta animista',
          price: 51000,
        },
        {
          min: 73,
          max: 77,
          name: 'Anel da liberdade',
          rawName: 'Anel da liberdade',
          price: 60000,
        },
        {
          min: 78,
          max: 82,
          name: 'Tapete voador',
          rawName: 'Tapete voador',
          price: 60000,
        },
        {
          min: 83,
          max: 87,
          name: 'Braceletes de ouro',
          rawName: 'Braceletes de ouro',
          price: 64500,
        },
        {
          min: 88,
          max: 89,
          name: 'Espelho da oposição',
          rawName: 'Espelho da oposição',
          price: 75000,
        },
        {
          min: 90,
          max: 94,
          name: 'Robe do arquimago',
          rawName: 'Robe do arquimago',
          price: 90000,
        },
        {
          min: 95,
          max: 96,
          name: 'Orbe das tempestades',
          rawName: 'Orbe das tempestades',
          price: 97500,
        },
        {
          min: 97,
          max: 98,
          name: 'Anel da regeneração',
          rawName: 'Anel da regeneração',
          price: 150000,
        },
        {
          min: 99,
          max: 100,
          name: 'Espelho do aprisionamento',
          rawName: 'Espelho do aprisionamento',
          price: 150000,
        },
      ],
      footnotes: [],
    },
  },
};

export default BASIC_BOOK_TABLES;
