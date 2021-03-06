import React from 'react';

const Result = (props) => {
    const {
        sheet
    } = props;

    const {
        name,
        nivel,
        atributos,
        raca,
        classe,
        pericias
    } = sheet;

    const styles = {
        mainDiv: {
            width: '60vw',
            padding: '30px'
        },
        row: {
           display: 'flex',
           // justifyContent: 'center',
           borderTop: '1px solid black',
           padding: '5px 0',
        },
        item: {
            marginRight: '10px'
        }
    }

    console.log();

    const atributosDiv = atributos.map((atributo) => <span style={styles.item}><strong>{atributo.name}</strong> {atributo.value} ({atributo.mod > 0 ? '+' : ''}{atributo.mod})</span>);

    const periciasDiv = pericias.map((pericia) => <li>{pericia}</li>);
    const habilidadesRacaDiv = raca.habilites.texts.map((hab) => <li>{hab}</li>);
    const habilidadesClasseDiv = classe.habilities.map((hab) => <li><strong>{hab.name}:</strong> {hab.text}</li>);
    const proeficienciasDiv = classe.proeficiencias.map((proe) => <li>{proe}</li>);

    const constAttr = atributos.find(attr => attr.name === 'Constituição');
    const pv = classe.pv + constAttr.mod;

    const destAttr = atributos.find(attr => attr.name === 'Destreza');
    const defesa = 10 + destAttr.mod;

    return (
        <div style={styles.mainDiv}>
            <div style={styles.row}>
                <span style={styles.item}><strong>Nome</strong> {name}</span>
                <span style={styles.item}><strong>Classe</strong> {classe.name}</span>
                <span style={styles.item}><strong>Raça</strong> {raca.name}</span>
                <span style={styles.item}><strong>Nível</strong> {nivel}</span>
            </div>

            <div style={styles.row}>
                {atributosDiv}
            </div>

            <div style={styles.row}>
                <span style={styles.item}><strong>PV</strong> {pv}</span>
                <span style={styles.item}><strong>PM</strong> {classe.pm}</span>
                <span style={styles.item}><strong>Defesa</strong> {defesa}</span>
            </div>

            <div style={styles.row}>
                <div>
                    <strong>Perícias Treinadas:</strong>
                    <ul>{periciasDiv}</ul>
                </div>
            </div>

            <div style={styles.row}>
                <div>
                    <strong>Proeficiências</strong>
                    <ul>{proeficienciasDiv}</ul>
                </div>
            </div>

            <div style={styles.row}>
                <div>
                    <strong>Equipamento Inicial</strong>
                    <ul>
                        <li>A FAZER</li>
                    </ul>
                </div>
            </div>

            <div style={styles.row}>
                <div>
                    <strong>Habilidades de Raça</strong>
                    <ul>{habilidadesRacaDiv}</ul>
                </div>
            </div>

            <div style={styles.row}>
                <div>
                    <strong>Habilidades de Classe</strong>
                    <ul>{habilidadesClasseDiv}</ul>
                </div>
            </div>

            <div style={styles.row}>
                <div>
                    <strong>Magias</strong>
                    {classe.magics.length === 0 && (
                        <ul>
                            <li>Não possui.</li>
                        </ul>
                    )}
                </div>
            </div>

            <div style={styles.row}></div>

        </div>
    )
};

export default Result;