// SELETORES.
const console = document.getElementById('console');
const btnExecutar = document.getElementById('executar')
const btnDownload = document.getElementById('download');

// EVENTOS ONCLICK.
btnExecutar.onclick = master;
btnDownload.onclick = createAndDownload;

// VARIAVEIS GLOBAIS.
var textoConsole = '';
var x = '';

// LE E RETORNA EM UMA STRING O ARQUIVO .TXT ENVIADO.
document.getElementById('file').addEventListener('change', function() {
var file = new FileReader();
    file.onload = () => {
    x = file.result;
    }
    file.readAsText(this.files[0], 'ISO-8859-1');
});

// CRIA ARQUIVO .TXT E FAZ DOWNLOAD PARA A MAQUINA DO USUARIO.
function createAndDownload() {  //createAndDownload(filename, text)
    

    const element = document.createElement('a');

    element.setAttribute('href', 'data:text/plain;charset=latin1,' + encodeURIComponent(x));
    element.setAttribute('download', 'spedCorrigido');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// AGLOMERADO DE FUNCOES QUE TRABALHAM O CONTEUDO DO ARQUIVO PASSADO.
function master(){
    var codSped_worked = preparaCod();
    var codCorrigido = corrigeUNeNCM(codSped_worked);
    confereNFvalue(codCorrigido);
    var codPadronizado = padronizaCod(codCorrigido);
    x = codPadronizado;
}

// MODIFICA A STRING PARA O PADRAO NECESSARIO PARA O FUNCIONAMENTO DO PROGRAMA.
// ESTRUTURA => UM MACRO ARRAY, CONTENDO MICRO ARRAY'S PARA CADA REGISTRO DO ARQUIVO .TXT
// CADA CAMPO DE CADA REGISTRO DO ARQUIVO .TXT CORRESPONDE A UM ELEMENTO DE UM MICRO ARRAY.
function preparaCod() {
    var codSped = x;
    codSped = codSped.split('\n');
    
    var codSped_worked = [];
    for(let i = 0; i < codSped.length; i++) {
        var aux = codSped[i].slice(1);
        aux = aux.slice(0, -1);
        aux = aux.split('|');
        codSped_worked.push(aux);
    }
    return codSped_worked;
}

// VARRE TODOS MICRO ARRAY'S. 
// CORRIGE UNIDADE DO ITEM (REG C170) QUE ESTIVER DIVERGENTE AO REG 0200.
// CORRIGE ITEM COM NCM 99999999.
function corrigeUNeNCM(array) {
    textoConsole += tituloConsoleLog('MODIFICACOES DE NCM E UNIDADE(C170)');
    for(let i = 0; i < array.length; i++) {
        if(array[i].includes('0200')) {
            if(array[i].includes('99999999')) {
                array[i].splice(7,1,'00000000');
                textoConsole += ('NCM do item ' + array[i][1] + ' modificado de 99999999 para 00000000\n');
            }
            var codItem = array[i][1];
            var unItem = array[i][5];
            for(var i2 = i; i2 < array.length; i2++) {
                if(array[i2].includes(codItem)) {
                    if(array[i2][5] != unItem) {
                        textoConsole += ('Campo UN do item ' + codItem + ' modificado de ' + array[i2][5] + ' para ' + unItem + '\n')
                        array[i2].splice(5,1,unItem);
                    }
                }
            }
        }
    }
    return array;
}

// ANALISA SE O VALOR DO CAMPO #12 DO REG C100 É IGUAL A SOMA DOS CAMPOS #07 DOS REGISTROS C170 CORREPONDENTES.
// => RETORNA O N° DOC DAS DIVERGENCIAS ENCONTRADAS.
function confereNFvalue(array){ 
    textoConsole += tituloConsoleLog('Registro C100 não bate com soma C170')
    for(let i = 0; i < array.length; i++) {
        if(array[i].includes('C100') && array[i][1] == '0') {
            var numDoc = array[i][7];
            var totDoc = parseFloat(array[i][11].replace(',','.'));
            var totItens = 0;
        }
        i++;
        while(array[i].includes('C170')) {
            totItens += parseFloat(array[i][6].replace(',','.'));
            i++;
        }
        if(totDoc != totItens) {
            
            textoConsole += (numDoc + ' = > Divergencia encontrada\n');
        }
    }
    console.value = textoConsole;
    textoConsole = '';
}

// PADRONIZA O CODIGO PARA O FORMATO SPED.
function padronizaCod(array) {
    var codPadronizado = '';
    for(let i = 0; i < array.length -1; i++) {
        var aux = array[i].join('|');
        aux = '|' + aux + '\n';
        codPadronizado = codPadronizado + aux;
    }
    return codPadronizado;
}

function tituloConsoleLog(titulo) {
    return ('\n' + titulo + '\n\n');
}


