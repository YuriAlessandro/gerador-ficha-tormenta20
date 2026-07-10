import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Chip,
  Divider,
  Card,
  CardActionArea,
  Stack,
} from '@mui/material';
import Equipment, { DefenseEquipment } from '@/interfaces/Equipment';
import { ClassDescription } from '@/interfaces/Class';
import { ClassEquipmentSelections } from '@/interfaces/WizardSelections';
import EQUIPAMENTOS, {
  Armaduras,
  Escudos,
  bardInstruments,
} from '@/data/systems/tormenta20/equipamentos';
import PROFICIENCIAS from '@/data/systems/tormenta20/proficiencias';
import { isClassOrVariantOf } from '@/functions/general';

interface ClassEquipmentStepProps {
  classe: ClassDescription;
  selections: ClassEquipmentSelections | undefined;
  onChange: (selections: ClassEquipmentSelections) => void;
}

// Helper to check if equipment is DefenseEquipment
const isDefenseEquipment = (
  equip: Equipment | DefenseEquipment
): equip is DefenseEquipment => 'defenseBonus' in equip;

const ItemStats: React.FC<{ item: Equipment | DefenseEquipment }> = ({
  item,
}) => (
  <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap', mt: 0.5 }}>
    {item.dano && (
      <Chip label={`Dano: ${item.dano}`} size='small' variant='outlined' />
    )}
    {item.critico && (
      <Chip label={`Crit: ${item.critico}`} size='small' variant='outlined' />
    )}
    {isDefenseEquipment(item) && (
      <Chip
        label={`Def: +${item.defenseBonus}`}
        size='small'
        variant='outlined'
        color='primary'
      />
    )}
    {item.spaces !== undefined && item.spaces > 0 && (
      <Chip label={`${item.spaces} esp.`} size='small' variant='outlined' />
    )}
  </Stack>
);

const ClassEquipmentStep: React.FC<ClassEquipmentStepProps> = ({
  classe,
  selections,
  onChange,
}) => {
  const needsMartialWeapon = classe.proficiencias.includes(
    PROFICIENCIAS.MARCIAIS
  );
  const hasHeavyArmor = classe.proficiencias.includes(PROFICIENCIAS.PESADAS);
  const hasShield = classe.proficiencias.includes(PROFICIENCIAS.ESCUDOS);
  const isArcanista = classe.name === 'Arcanista';
  const needsLightArmor = !hasHeavyArmor && !isArcanista;
  const isBard = isClassOrVariantOf(classe, 'Bardo');

  const current = selections || {};

  const renderSelectableItems = (
    items: (Equipment | DefenseEquipment)[],
    selectedName: string | undefined,
    onSelect: (item: Equipment | DefenseEquipment) => void
  ) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(auto-fill, minmax(220px, 1fr))',
        },
        gap: 1,
      }}
    >
      {items.map((item) => {
        const isSelected = selectedName === item.nome;
        return (
          <Card
            key={item.nome}
            variant='outlined'
            sx={{
              borderColor: isSelected ? 'primary.main' : 'divider',
              borderWidth: isSelected ? 2 : 1,
              backgroundColor: isSelected
                ? 'rgba(209, 50, 53, 0.08)'
                : 'transparent',
            }}
          >
            <CardActionArea onClick={() => onSelect(item)} sx={{ p: 1.5 }}>
              <Typography variant='body2' sx={{ fontWeight: 'medium' }}>
                {item.nome}
              </Typography>
              <ItemStats item={item} />
            </CardActionArea>
          </Card>
        );
      })}
    </Box>
  );

  const fixedItems: (Equipment | DefenseEquipment)[] = [];
  if (hasHeavyArmor) {
    fixedItems.push(Armaduras.BRUNEA);
  }
  if (hasShield) {
    fixedItems.push(Escudos.ESCUDOLEVE);
  }

  const isComplete =
    !!current.simpleWeapon &&
    (!needsMartialWeapon || !!current.martialWeapon) &&
    (!needsLightArmor || !!current.armor) &&
    (!isBard || !!current.instrument);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' sx={{ color: 'text.secondary' }}>
        Escolha o equipamento inicial da classe {classe.name}. Você poderá
        comprar itens adicionais no próximo passo (Mercado).
      </Typography>

      {/* Arma simples */}
      <Box>
        <Typography variant='subtitle2' sx={{ mb: 1 }}>
          Arma simples — escolha 1:
        </Typography>
        {renderSelectableItems(
          EQUIPAMENTOS.armasSimples,
          current.simpleWeapon?.nome,
          (item) => onChange({ ...current, simpleWeapon: item })
        )}
      </Box>

      {/* Arma marcial (se proficiente) */}
      {needsMartialWeapon && (
        <>
          <Divider />
          <Box>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Arma marcial — escolha 1:
            </Typography>
            {renderSelectableItems(
              EQUIPAMENTOS.armasMarciais,
              current.martialWeapon?.nome,
              (item) => onChange({ ...current, martialWeapon: item })
            )}
          </Box>
        </>
      )}

      {/* Armadura leve (se não usa pesada e não é Arcanista) */}
      {needsLightArmor && (
        <>
          <Divider />
          <Box>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Armadura leve — escolha 1:
            </Typography>
            {renderSelectableItems(
              EQUIPAMENTOS.armadurasLeves,
              current.armor?.nome,
              (item) =>
                onChange({ ...current, armor: item as DefenseEquipment })
            )}
          </Box>
        </>
      )}

      {isArcanista && (
        <Alert severity='info'>
          Arcanistas não recebem armadura inicial (armaduras atrapalham a
          conjuração de magias arcanas).
        </Alert>
      )}

      {/* Instrumento (Bardo) */}
      {isBard && (
        <>
          <Divider />
          <Box>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Instrumento musical — escolha 1:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {bardInstruments.map((instrument) => {
                const isSelected = current.instrument === instrument;
                return (
                  <Chip
                    key={instrument}
                    label={instrument}
                    size='small'
                    variant={isSelected ? 'filled' : 'outlined'}
                    color={isSelected ? 'primary' : 'default'}
                    onClick={() => onChange({ ...current, instrument })}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: isSelected
                          ? 'primary.dark'
                          : 'rgba(209, 50, 53, 0.08)',
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </>
      )}

      {/* Itens automáticos */}
      {fixedItems.length > 0 && (
        <>
          <Divider />
          <Box>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Incluído automaticamente:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {fixedItems.map((item) => (
                <Box
                  key={item.nome}
                  sx={{
                    py: 1,
                    px: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant='body2' sx={{ fontWeight: 'medium' }}>
                    {item.nome}
                  </Typography>
                  <ItemStats item={item} />
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}

      {!isComplete && (
        <Alert severity='warning'>
          Selecione todos os itens obrigatórios para continuar.
        </Alert>
      )}

      {isComplete && (
        <Alert severity='success'>
          Equipamento selecionado com sucesso! Você pode continuar para o
          próximo passo.
        </Alert>
      )}
    </Box>
  );
};

export default ClassEquipmentStep;
