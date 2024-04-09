const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const displayValueOfCurrency = document.querySelector('[data-js="conversion-precision"]')
const timesCurrenciesEl = document.querySelector('[data-js="currency-one-times" ]')
const containerCurrency = document.querySelector('[data-js="container-currency"]')

const apiKEY  = '08a7d89f3e25734b11342dde'
const getUrl = currency => `https://v6.exchangerate-api.com/v6/${apiKEY}/latest/${currency}`


const state = (() => {
  let exchangeRate = {}
  return {
    getExchangeRate : () => {
      return exchangeRate
    },
    setExchangeRate: newExchangeRate => {
      if(!newExchangeRate.conversion_rates) {
          return 
      }
      exchangeRate = newExchangeRate
      return exchangeRate
    }
  }
})()

const getMessageError = (errorType) =>  ({
  "unsupported-code":'A API não tem suporte para essa tipo de moeda no banco de dados',
  "malformed-request":'Error na estrutura do request. Verifique a estrutura adquada.',
  "invalid-key":'Chave API invalida.',
  "inactive-account":'Seu email não foi confirmado.',
  "quota-reached":'Você atingio seu limite maximo de request no dia.Tente novamente mais tarde.'
})[errorType] || 'Não foi possivel obter as informações.'

const createAndInserElemnentIntoDOM = error => {
  const div = document.createElement('div')
  const button = document.createElement('button')
  div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show')
  div.setAttribute('role', 'alert')
  div.setAttribute('data-js', 'containerMessage')
  div.textContent = error.message
  button.setAttribute('type', 'button')
  button.setAttribute('class', 'btn-close')
  button.setAttribute('arial-label', 'Close')
  div.append(button)
  containerCurrency.insertAdjacentElement('afterend', div)

  button.addEventListener('click', () => {
    div.classList.remove('show')
  })
}

const showInicialInfo = () => {
  const getOptions = selectedCurrency => Object.keys(exchangeRate.conversion_rates)
    .map(currency => `<option ${selectedCurrency === currency ? 'selected' : ''}>${currency}</option>`)
    .join('')
  currencyOneEl.innerHTML = getOptions('USD')
  currencyTwoEl.innerHTML = getOptions('BRL')

  convertedValueEl.textContent = exchangeRate.conversion_rates['BRL'].toFixed(2)
  displayValueOfCurrency.textContent = `1 USD = ${exchangeRate.conversion_rates['BRL'].toFixed(2)} BRL`
}

const displayTimesCurrencyAndsingleTimeCurrency = () => {
  convertedValueEl.textContent = exchangeRate.conversion_rates[currencyTwoEl.value].toFixed(2)
  displayValueOfCurrency.textContent = `1 ${currencyOneEl.value} = ${exchangeRate.conversion_rates[currencyTwoEl.value]} ${currencyTwoEl.value}` 
}

const fetchCurrency = async (url) => {
  try {
    const currency = await fetch(url)
    if (!currency.ok) {
      throw new Error('Não foi possivel obter dados desejados')
    }
    const response = await currency.json()
    if (response.result === 'error') {
      throw new Error(getMessageError(response['error-type']))
    }
    return response
  } catch (error) {
    createAndInserElemnentIntoDOM(error)
  }
}

const init = async () => {
  exchangeRate = {...(await fetchCurrency(getUrl('USD')))}
  if(exchangeRate.conversion_rates){
    showInicialInfo(exchangeRate)
  }
}

currencyOneEl.addEventListener('change', async (e) => {
  const currencyOne = e.target.value
  exchangeRate = {...(await fetchCurrency(getUrl(currencyOne)))}
  displayTimesCurrencyAndsingleTimeCurrency()
})

currencyTwoEl.addEventListener('change', displayTimesCurrencyAndsingleTimeCurrency)

timesCurrenciesEl.addEventListener('input', e => {
  const times = e.target.value
  convertedValueEl.textContent = (times * exchangeRate.conversion_rates[currencyTwoEl.value]).toFixed(2)
})

init()

