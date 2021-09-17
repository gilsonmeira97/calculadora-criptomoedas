let itens = [];
let id = 0;
let dataAtualizada = new Date().toLocaleDateString('pt-br').split('/');
let dataOntem = {dia: dataAtualizada[0] - 1, mes: dataAtualizada[1], ano: dataAtualizada[2]}
let urlCotacao = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${dataOntem.mes}-${dataOntem.dia}-${dataOntem.ano}'&$top=100&$format=json&$select=cotacaoCompra`
let cotacaoDolar

fetch(urlCotacao)
    .then(resp => resp.json())
    .then(elemento => {
        cotacaoDolar = elemento.value[0].cotacaoCompra.toFixed(2)
        document.getElementById('inp-cotacao-dolar').value = cotacaoDolar;
    })

let custoEnergia = function() { 
    return document.getElementById('inp-preco-energia').value;
}

let getValorElemento = function(elemento) {
    let value = document.getElementById(elemento).value;
    if(!isNaN(value) && value != ''){
        return parseFloat(value).toFixed(2);
    } else if (value != '' && isNaN(value)) {
        return value;
    } else {
        return '';
    }
} 

function addItem() {
    let qtd = getValorElemento('inp-qtd')
    let produto = getValorElemento('inp-produto');
    let preco = getValorElemento('inp-preco-produto');
    let consumo = getValorElemento('inp-consumo');
    let rendimento = getValorElemento('inp-renda');
    
    qtd = qtd > 0 ? qtd : 1;
    preco = preco > 0 ? preco : 0;
    consumo = consumo > 0 ? consumo : 0;
    rendimento = rendimento > 0 ? rendimento : 0;
    
    let precoTotal = preco * qtd;
    let consumoTotal = (consumo * qtd * 24 * 30) / 1000;
    let rendimentoTotal = rendimento * qtd * 30;

    let newItem = {
        id, qtd, produto, preco, precoTotal, consumo, consumoTotal, rendimento, rendimentoTotal, 
    }

    itens.push(newItem);
    construirLinha(qtd, produto, preco, consumo, rendimento, id);
    atualizarCalculo();
    id++;
}

function construirLinha(qtd, produto, preco, consumo, rendimento, id) {
    const tr = document.createElement('tr');
    const tdQtd = document.createElement('td');
    const tdProduto = document.createElement('td');
    const tdPreco = document.createElement('td');
    const tdConsumo = document.createElement('td');
    const tdRendimento = document.createElement('td');
    const tdAcao = document.createElement('td');

    tr.id = id;
    tdQtd.textContent = qtd;
    tdProduto.textContent = produto;
    tdPreco.textContent = formatarRealBrasileiro(preco);
    tdConsumo.textContent = formatarRealBrasileiro(consumo);
    tdRendimento.textContent = formatarRealBrasileiro(rendimento);
    tdAcao.innerHTML = `
    <button class="btn-del-item" onclick="delItem(this)" posicao="${id}">
    <svg version="1.1" width="25px" height="25px" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
    viewBox="0 0 489.425 489.425" style="enable-background:new 0 0 489.425 489.425;" xml:space="preserve">
       <path d="M122.825,394.663c17.8,19.4,43.2,30.6,69.5,30.6h216.9c44.2,0,80.2-36,80.2-80.2v-200.7c0-44.2-36-80.2-80.2-80.2h-216.9
           c-26.4,0-51.7,11.1-69.5,30.6l-111.8,121.7c-14.7,16.1-14.7,40.3,0,56.4L122.825,394.663z M29.125,233.063l111.8-121.8
           c13.2-14.4,32-22.6,51.5-22.6h216.9c30.7,0,55.7,25,55.7,55.7v200.6c0,30.7-25,55.7-55.7,55.7h-217c-19.5,0-38.3-8.2-51.5-22.6
           l-111.7-121.8C23.025,249.663,23.025,239.663,29.125,233.063z"/>
       <path d="M225.425,309.763c2.4,2.4,5.5,3.6,8.7,3.6s6.3-1.2,8.7-3.6l47.8-47.8l47.8,47.8c2.4,2.4,5.5,3.6,8.7,3.6s6.3-1.2,8.7-3.6
           c4.8-4.8,4.8-12.5,0-17.3l-47.9-47.8l47.8-47.8c4.8-4.8,4.8-12.5,0-17.3s-12.5-4.8-17.3,0l-47.8,47.8l-47.8-47.8
           c-4.8-4.8-12.5-4.8-17.3,0s-4.8,12.5,0,17.3l47.8,47.8l-47.8,47.8C220.725,297.263,220.725,304.962,225.425,309.763z"/>
        </svg>
    </button>`

    tr.appendChild(tdQtd);
    tr.appendChild(tdProduto);
    tr.appendChild(tdPreco);
    tr.appendChild(tdConsumo);
    tr.appendChild(tdRendimento);
    tr.appendChild(tdAcao);

    document.querySelector('tbody').appendChild(tr);
}

function atualizarCalculo() {
    let cotacaoDolar = document.getElementById('inp-cotacao-dolar').value;
    let investimentoTotal = 0;
    let rendimentoBruto = 0;
    let rendimentoLiquido = 0;
    let consumoTotalEnergia = 0;
    let custoTotalEnergia = 0;
    let roi = 0;

    itens.forEach(item => {
    investimentoTotal += item.precoTotal;
    rendimentoBruto += item.rendimentoTotal * cotacaoDolar;
    consumoTotalEnergia += item.consumoTotal;
    custoTotalEnergia += item.consumoTotal * custoEnergia();
    })

    rendimentoLiquido = rendimentoBruto - custoTotalEnergia;
    roi = investimentoTotal / rendimentoLiquido;

    document.querySelector('#out-investimento').textContent = formatarRealBrasileiro(investimentoTotal);
    document.querySelector('#out-rendimento-bruto').textContent = formatarRealBrasileiro(rendimentoBruto);
    document.querySelector('#out-rendimento-liquido').textContent = formatarRealBrasileiro(rendimentoLiquido);
    document.querySelector('#out-consumo-energia').textContent = formatarRealBrasileiro(consumoTotalEnergia);
    document.querySelector('#out-custo-energia').textContent = formatarRealBrasileiro(custoTotalEnergia);
    document.querySelector('#out-roi').textContent = roi.toFixed(2);
}

function delItem(item) {
    let idItem = item.getAttribute('posicao')
    document.getElementById(idItem).remove();
    itens.forEach((item, itemIndex) => {
        item.id == idItem ? itens.splice(itemIndex, 1) : false;
    })
    atualizarCalculo();
}

function formatarRealBrasileiro(elemento) {
        let valorNumerico = parseFloat(elemento);
        let valueFormated = valorNumerico.toLocaleString('pt-br', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        return valueFormated;
}

document.getElementById('inp-preco-energia').onkeyup = (e) => atualizarCalculo();
document.getElementById('inp-preco-energia').onclick = (e) => atualizarCalculo();
document.getElementById('inp-cotacao-dolar').onkeyup = (e) => atualizarCalculo();
document.getElementById('inp-cotacao-dolar').onclick = (e) => atualizarCalculo();