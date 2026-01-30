import {
  Container,
  Typography,
  Box,
  Paper,
  Link,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import React from 'react';
import { SEO, getPageSEO } from '../SEO';
import {
  TERMS_LAST_UPDATED,
  TERMS_DOCUMENT_VERSION,
} from '../../constants/terms';

const Section: React.FC<{
  number: number;
  title: string;
  children: React.ReactNode;
}> = ({ number, title, children }) => (
  <Paper sx={{ p: 3, mb: 3 }}>
    <Typography
      variant='h5'
      component='h2'
      sx={{ mb: 2, fontFamily: 'Tfont, serif' }}
    >
      {number}. {title}
    </Typography>
    {children}
  </Paper>
);

const TermsOfUse: React.FC = () => {
  const termsSEO = getPageSEO('termsOfUse');

  return (
    <>
      <SEO
        title={termsSEO.title}
        description={termsSEO.description}
        url='/termos-de-uso'
      />
      <Container maxWidth='md'>
        <Box sx={{ py: 4 }}>
          <Typography
            variant='h3'
            component='h1'
            sx={{ fontFamily: 'Tfont, serif', mb: 2, textAlign: 'center' }}
          >
            Termos de Uso
          </Typography>

          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ textAlign: 'center', mb: 4 }}
          >
            Última atualização: {TERMS_LAST_UPDATED} | Versão:{' '}
            {TERMS_DOCUMENT_VERSION}
          </Typography>

          <Section number={1} title='Introdução e Aceitação dos Termos'>
            <Typography variant='body1' paragraph>
              Bem-vindo ao Fichas de Nimb! Ao acessar ou utilizar nossa
              plataforma, você concorda com estes Termos de Uso. Se você não
              concordar com qualquer parte destes termos, por favor, não utilize
              nossos serviços.
            </Typography>
            <Typography variant='body1'>
              O uso continuado da plataforma após a publicação de alterações nos
              termos constitui aceitação dessas alterações.
            </Typography>
          </Section>

          <Section number={2} title='Sobre a Plataforma'>
            <Typography variant='body1' paragraph>
              Fichas de Nimb é uma plataforma para geração de fichas de
              personagem para o sistema de RPG Tormenta 20.
            </Typography>
            <Typography variant='body1' paragraph>
              <strong>Tormenta 20</strong> é um produto da{' '}
              <Link
                href='https://jamboeditora.com.br'
                target='_blank'
                rel='noopener noreferrer'
              >
                Jambô Editora
              </Link>{' '}
              e todos os direitos são reservados a ela. O material
              disponibilizado nesta plataforma <strong>não substitui</strong> a
              necessidade de adquirir os materiais oficiais por meios oficiais.
            </Typography>
            <Typography variant='body1' paragraph>
              Você pode adquirir os materiais oficiais de Tormenta 20 em:{' '}
              <Link
                href='https://jamboeditora.com.br/categoria/rpg/tormenta20-rpg/'
                target='_blank'
                rel='noopener noreferrer'
              >
                https://jamboeditora.com.br
              </Link>
            </Typography>
            <Typography variant='body1'>
              Tormenta 20 é um produto sob a licença{' '}
              <strong>Open Game License (OGL)</strong>.
            </Typography>
          </Section>

          <Section number={3} title='Cadastro e Autenticação'>
            <Typography variant='body1' paragraph>
              A autenticação na plataforma é realizada via Google OAuth através
              do Firebase. Ao fazer login, coletamos as seguintes informações:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary='Nome de usuário (derivado do email)' />
              </ListItem>
              <ListItem>
                <ListItemText primary='Endereço de email' />
              </ListItem>
              <ListItem>
                <ListItemText primary='Foto de perfil (se disponível)' />
              </ListItem>
            </List>
            <Typography variant='body1'>
              O usuário é responsável por manter suas credenciais de acesso
              seguras.
            </Typography>
          </Section>

          <Section number={4} title='Dados Coletados e Armazenamento'>
            <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
              4.1 Dados Armazenados Localmente
            </Typography>
            <Typography variant='body1' paragraph>
              Utilizamos o armazenamento local do navegador (localStorage) para
              salvar:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary='Fichas de personagem geradas' />
              </ListItem>
              <ListItem>
                <ListItemText primary='Preferências de tema (claro/escuro)' />
              </ListItem>
              <ListItem>
                <ListItemText primary='Configurações do usuário' />
              </ListItem>
            </List>

            <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
              4.2 Dados Armazenados em Servidores
            </Typography>
            <Typography variant='body1' paragraph>
              Para usuários autenticados, armazenamos em nossos servidores
              (MongoDB/Firebase):
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary='Informações de perfil' />
              </ListItem>
              <ListItem>
                <ListItemText primary='Fichas de personagem salvas na nuvem' />
              </ListItem>
              <ListItem>
                <ListItemText primary='Builds de personagens' />
              </ListItem>
              <ListItem>
                <ListItemText primary='Dados de sessões de jogo (mesas virtuais)' />
              </ListItem>
              <ListItem>
                <ListItemText primary='Comentários' />
              </ListItem>
            </List>

            <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
              4.3 Serviços de Terceiros
            </Typography>
            <Typography variant='body1'>
              Utilizamos os seguintes serviços de terceiros:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary='Firebase'
                  secondary='Autenticação e armazenamento'
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary='Google Analytics'
                  secondary='Análise de uso (dados anonimizados)'
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary='Stripe'
                  secondary='Processamento de pagamentos'
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary='Socket.io'
                  secondary='Comunicação em tempo real para mesas virtuais'
                />
              </ListItem>
            </List>
          </Section>

          <Section number={5} title='Assinaturas e Pagamentos (Apoio)'>
            <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
              5.1 Níveis de Apoio
            </Typography>
            <Typography variant='body1' paragraph>
              Oferecemos diferentes níveis de apoio (Nível 1, Nível 2 e Nível 3)
              com benefícios variados, incluindo maior limite de fichas, mesas
              virtuais e outras funcionalidades premium.
            </Typography>

            <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
              5.2 Cancelamento
            </Typography>
            <Typography variant='body1' paragraph>
              O administrador da plataforma pode cancelar o apoio de qualquer
              usuário a qualquer momento. Em caso de cancelamento, será
              oferecido <strong>reembolso proporcional</strong> ao período não
              utilizado.
            </Typography>
            <Typography variant='body1'>
              Para solicitar cancelamento ou reembolso, entre em contato pelo
              email:{' '}
              <Link href='mailto:contato@fichasdenimb.com.br'>
                contato@fichasdenimb.com.br
              </Link>
            </Typography>
          </Section>

          <Section number={6} title='Conteúdo Gerado pelo Usuário'>
            <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
              6.1 Responsabilidade
            </Typography>
            <Typography variant='body1' paragraph>
              O usuário é <strong>inteiramente responsável</strong> por todo o
              conteúdo que insere na plataforma, incluindo: nomes de
              personagens, descrições, builds, comentários e qualquer outro
              conteúdo.
            </Typography>
            <Typography variant='body1' paragraph>
              O usuário garante que possui direitos sobre o conteúdo inserido e
              que <strong>não está infringindo</strong> direitos comerciais ou
              privados de terceiros, incluindo direitos autorais e propriedade
              intelectual.
            </Typography>

            <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
              6.2 Moderação e Remoção
            </Typography>
            <Typography variant='body1' paragraph>
              A plataforma <strong>se isenta de responsabilidade</strong> por
              conteúdo inserido pelos usuários.
            </Typography>
            <Typography variant='body1'>
              A plataforma <strong>se reserva o direito</strong> de remover
              qualquer conteúdo a seu exclusivo critério, sem necessidade de
              aviso prévio. Conteúdo ofensivo, ilegal ou inadequado será
              removido.
            </Typography>
          </Section>

          <Section number={7} title='Restrições de Uso'>
            <Typography variant='body1' paragraph>
              Você concorda em NÃO:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary='Usar a plataforma para fins ilegais' />
              </ListItem>
              <ListItem>
                <ListItemText primary='Inserir conteúdo que viole direitos de propriedade intelectual de terceiros' />
              </ListItem>
              <ListItem>
                <ListItemText primary='Tentar acessar dados de outros usuários sem autorização' />
              </ListItem>
              <ListItem>
                <ListItemText primary='Interferir no funcionamento da plataforma' />
              </ListItem>
              <ListItem>
                <ListItemText primary='Usar bots ou automação sem autorização prévia' />
              </ListItem>
            </List>
          </Section>

          <Section number={8} title='Bloqueio de Usuários'>
            <Typography variant='body1' paragraph>
              A plataforma <strong>se reserva o direito</strong> de bloquear ou
              suspender usuários{' '}
              <strong>sem necessidade de declarar a razão</strong>.
            </Typography>
            <Typography variant='body1' paragraph>
              O bloqueio pode ocorrer por violação destes termos ou por qualquer
              outro motivo a critério exclusivo da administração.
            </Typography>
            <Typography variant='body1'>
              Em caso de bloqueio de usuários com assinatura ativa, será
              oferecido <strong>reembolso proporcional</strong> ao período não
              utilizado.
            </Typography>
          </Section>

          <Section number={9} title='Limitação de Responsabilidade'>
            <Typography variant='body1' paragraph>
              A plataforma é fornecida &quot;como está&quot; (as is), sem
              garantias de qualquer tipo, expressas ou implícitas.
            </Typography>
            <Typography variant='body1' paragraph>
              Não garantimos disponibilidade ininterrupta do serviço. Não nos
              responsabilizamos por perdas de dados ou danos indiretos.
            </Typography>
            <Typography variant='body1'>
              O uso da plataforma é por conta e risco do usuário.
            </Typography>
          </Section>

          <Section number={10} title='Propriedade Intelectual'>
            <Typography variant='body1' paragraph>
              <strong>Tormenta 20</strong> e todas as marcas relacionadas são
              propriedade da <strong>Jambô Editora</strong>. Todos os direitos
              são reservados a ela.
            </Typography>
            <Typography variant='body1' paragraph>
              O código-fonte do projeto Fichas de Nimb é open-source e está
              disponível no GitHub.
            </Typography>
            <Typography variant='body1'>
              Respeitamos a <strong>Open Game License (OGL)</strong> da Wizards
              of the Coast.
            </Typography>
          </Section>

          <Section number={11} title='Alterações nos Termos'>
            <Typography variant='body1' paragraph>
              Podemos alterar estes termos a qualquer momento. Alterações
              significativas serão comunicadas através da plataforma.
            </Typography>
            <Typography variant='body1'>
              Usuários serão notificados sobre novas versões ao fazer login e
              deverão aceitar os novos termos para continuar utilizando a
              plataforma.
            </Typography>
          </Section>

          <Section number={12} title='Contato'>
            <Typography variant='body1'>
              Para dúvidas, sugestões ou solicitações, entre em contato pelo
              email:{' '}
              <Link href='mailto:contato@fichasdenimb.com.br'>
                contato@fichasdenimb.com.br
              </Link>
            </Typography>
          </Section>

          <Section number={13} title='Disposições Finais'>
            <Typography variant='body1' paragraph>
              Estes termos são regidos pelas leis brasileiras.
            </Typography>
            <Typography variant='body1' paragraph>
              Se qualquer disposição destes termos for considerada inválida ou
              inexequível, as demais disposições permanecerão em pleno vigor e
              efeito.
            </Typography>
            <Typography variant='body1'>
              Fica eleito o foro da cidade do administrador da plataforma para
              dirimir quaisquer controvérsias oriundas destes termos.
            </Typography>
          </Section>

          <Divider sx={{ my: 4 }} />

          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ textAlign: 'center' }}
          >
            © {new Date().getFullYear()} Fichas de Nimb. Tormenta 20 © Jambô
            Editora.
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default TermsOfUse;
