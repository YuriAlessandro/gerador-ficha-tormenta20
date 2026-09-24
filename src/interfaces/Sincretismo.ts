/**
 * Sincretismo: a fusão de culto de dois deuses maiores, à qual um devoto duplo
 * precisa estar associado (regra opcional "Devoção Dupla", Sincretismos de
 * Arton).
 *
 * Só o par de deuses tem efeito mecânico — é ele que decide de quais listas o
 * devoto escolhe seus poderes concedidos e qual poder único fica disponível.
 *
 * O poder único NÃO é um campo aqui: ele é derivado dos poderes `CONCEDIDOS`
 * do suplemento (o que exige os dois deuses num mesmo grupo de requisitos),
 * pelo mesmo motivo que os deuses menores derivam os seus — para que as duas
 * listas não possam sair de sincronia.
 *
 * Arma favorita, canalizar energia, frequência e o texto de abertura ficam
 * DELIBERADAMENTE de fora: nada no motor os lê (nem para `Divindade`, onde os
 * campos homônimos existem e estão vazios em todas as 20 divindades do core),
 * e reproduzi-los aqui só transcreveria o livro sem mudar número nenhum na
 * ficha. Quem quiser entender o sincretismo lê o livro.
 */
export interface Sincretismo {
  name: string;
  /** Par de deuses maiores, por nome. A ordem não é significativa. */
  deities: [string, string];
}

export default Sincretismo;
