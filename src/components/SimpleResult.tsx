/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import ReactToPrint from 'react-to-print';
import { Box, Card, Container } from '@mui/material';
import CharacterSheet from '../interfaces/CharacterSheet';
import Equipment from '../interfaces/Equipment';
import { SkillsTotals } from '../interfaces/Skills';

// Styled components for character sheet (uses theme accent color)
const SheetDivisor: React.FC = () => (
  <Box
    sx={{
      display: 'block',
      height: '1px',
      border: 0,
      borderTop: '4px solid',
      borderColor: 'primary.main',
      p: 0,
    }}
  />
);

interface SheetTextProps {
  children: React.ReactNode;
}

const SheetText: React.FC<SheetTextProps> = ({ children }) => (
  <Box
    component='span'
    sx={{
      textTransform: 'uppercase',
      color: 'primary.main',
      fontWeight: 800,
    }}
  >
    {children}
  </Box>
);

const SheetName: React.FC<SheetTextProps> = ({ children }) => (
  <Box
    sx={{
      fontSize: '30px',
      mb: '10px',
      textTransform: 'uppercase',
      color: 'primary.main',
      fontWeight: 800,
    }}
  >
    {children}
  </Box>
);

interface ResultProps {
  sheet: CharacterSheet;
}

const SimpleResult: React.FC<ResultProps> = (props) => {
  const { sheet } = props;
  const [showExportButton, setExportButton] = React.useState<boolean>();

  function getKey(elementId: string) {
    return `${sheet.id}-${elementId}`;
  }

  const resultRef = React.createRef<HTMLDivElement>();
  React.useEffect(() => {
    if (resultRef.current) {
      setExportButton(true);
    }
  }, [resultRef]);

  const skillsTotals = {} as SkillsTotals;

  sheet.completeSkills?.forEach((sk) => {
    const attributeValue = sk.modAttr ? sheet.atributos[sk.modAttr].value : 0;

    const skTotal =
      (sk.halfLevel ?? 0) +
      attributeValue +
      (sk.others ?? 0) +
      (sk.training ?? 0);

    skillsTotals[sk.name as keyof SkillsTotals] = skTotal;
  });

  let bagEquipments;
  if (sheet.bag.getEquipments) {
    bagEquipments = sheet.bag.getEquipments();
  } else {
    bagEquipments = sheet.bag.equipments;
  }

  const equipsEntriesNoWeapons: Equipment[] = Object.entries(
    bagEquipments
  ).flatMap((value) => value[1]);

  const fightSkill = skillsTotals.Luta;
  const rangeSkill = skillsTotals.Pontaria;

  const handleExport = () => resultRef.current;

  return (
    <Container maxWidth='xl'>
      <div className='exportButtonsContainer'>
        <div
          style={{
            display: showExportButton ? 'flex' : 'none',
          }}
        >
          <ReactToPrint
            trigger={() => (
              <button className='exportBtn' type='button'>
                Exportar ou imprimir PDF
              </button>
            )}
            // onBeforeGetContent={preparePrint}
            content={handleExport}
            documentTitle={`${sheet.nome} - ${sheet.classe.name} ${sheet.raca.name}`}
          />
        </div>
      </div>
      <Card ref={resultRef} sx={{ p: 2, mt: 2 }}>
        <SheetName>{sheet.nome}</SheetName>
        {sheet.raca.name} {sheet.nivel}
        <SheetDivisor />
        <div>
          <SheetText>Iniciativa</SheetText>{' '}
          {skillsTotals.Iniciativa > 0
            ? `+${skillsTotals.Iniciativa}`
            : skillsTotals.Iniciativa}
          ,<SheetText> Percepção</SheetText>{' '}
          {skillsTotals['Percepção'] > 0
            ? `+${skillsTotals['Percepção']}`
            : skillsTotals['Percepção']}
        </div>
        <div>
          <SheetText>Defesa</SheetText> {sheet.defesa},
          <SheetText> Fort</SheetText>{' '}
          {skillsTotals.Fortitude > 0
            ? `+${skillsTotals.Fortitude}`
            : skillsTotals.Fortitude}
          ,<SheetText> Ref</SheetText>{' '}
          {skillsTotals.Reflexos > 0
            ? `+${skillsTotals.Reflexos}`
            : skillsTotals.Reflexos}
          ,<SheetText> Von</SheetText>{' '}
          {skillsTotals.Vontade > 0
            ? `+${skillsTotals.Vontade}`
            : skillsTotals.Vontade}
        </div>
        <div>
          <SheetText>Pontos de Vida</SheetText> {sheet.pv}
        </div>
        <div>
          <SheetText>Deslocamento</SheetText> {sheet.displacement}m (
          {sheet.displacement / 1.5}q)
        </div>
        <SheetDivisor />
        {sheet.pm > 0 && (
          <div>
            <SheetText>Pontos de Mana</SheetText> {sheet.pm}
          </div>
        )}
        <div>
          <SheetText>Ataques</SheetText>
        </div>
        {sheet.bag.equipments.Arma.map((eq) => {
          const isRange = eq.alcance && eq.alcance !== '-';
          const modAtk = isRange ? rangeSkill : fightSkill;
          return (
            <div key={getKey(eq.nome)}>
              {eq.nome} {modAtk > 0 ? `+${modAtk}` : modAtk} ({eq.dano}
              {isRange ? '' : `+${sheet.atributos.Força.value}`}, {eq.critico})
            </div>
          );
        })}
        <SheetDivisor />
        <div>
          <SheetText>
            FOR {sheet.atributos.Força.value}, DES{' '}
            {sheet.atributos.Destreza.value}, CON{' '}
            {sheet.atributos.Constituição.value}, INT{' '}
            {sheet.atributos.Inteligência.value}, SAB{' '}
            {sheet.atributos.Sabedoria.value}, CAR{' '}
            {sheet.atributos.Carisma.value}
          </SheetText>
        </div>
        <SheetDivisor />
        <div>
          <SheetText>Equipamento</SheetText>{' '}
          {equipsEntriesNoWeapons.map((eq, idx) => (
            <span key={getKey(eq.nome)}>
              {eq.nome}
              {idx + 1 < equipsEntriesNoWeapons.length ? ', ' : '.'}
            </span>
          ))}
        </div>
        <SheetDivisor />
        {/* Poderes de Raça */}
        {sheet.raca.abilities?.map((power) => (
          <div key={getKey(power.name)}>
            <SheetText>{power.name}: </SheetText>
            {power.description}
          </div>
        ))}
        <SheetDivisor />
        {/* Habilidades de Classe */}
        {sheet.classe.abilities?.map((power) => (
          <div key={getKey(power.name)}>
            <SheetText>{power.name}: </SheetText>
            {power.text}
          </div>
        ))}
        {/* Poderes de Classe */}
        <SheetDivisor />
        {sheet.classPowers?.map((power) => (
          <div key={getKey(power.name)}>
            <SheetText>{power.name}: </SheetText>
            {power.text}
          </div>
        ))}
        {sheet.origin?.powers && sheet.origin?.powers.length > 0 && (
          <SheetDivisor />
        )}
        {/* Poderes de Origem */}
        {sheet.origin?.powers.map((power) => (
          <div key={getKey(power.name)}>
            <SheetText>{power.name}: </SheetText>
            {power.description}
          </div>
        ))}
        <SheetDivisor />
        {/* Poderes gerais */}
        {sheet.generalPowers?.map((power) => (
          <div key={getKey(power.name)}>
            <SheetText>{power.name}: </SheetText>
            {power.description}
          </div>
        ))}
        {/* Poderes concedidos */}
        <SheetDivisor />
        {sheet.devoto?.poderes.map((power) => (
          <div key={getKey(power.name)}>
            <SheetText>{power.name}: </SheetText>
            {power.description}
          </div>
        ))}
        {/* Mágias */}
        {sheet.spells.length > 0 && (
          <div>
            <SheetDivisor />
            <SheetText>Magias </SheetText>
            {sheet.spells.map((spl, idx) => (
              <span key={getKey(spl.nome)}>
                {spl.nome}
                {idx + 1 < sheet.spells.length ? ', ' : '.'}
              </span>
            ))}
          </div>
        )}
      </Card>
    </Container>
  );
};

export default SimpleResult;
