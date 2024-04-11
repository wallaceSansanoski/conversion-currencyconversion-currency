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

const fetchCurrency = async (url) => {
  try {
    const currency = await fetch(url)
    const isFetchNotOkay = !currency.ok
    const isFechtCurrencyNotOkay = response.result === 'error'

    if (isFetchNotOkay) {
      throw new Error('Não foi possivel obter dados desejados')
    }
    const response = await currency.json()
    
    if (isFechtCurrencyNotOkay) {
      const messageError =  response['error-type']
      throw new Error(getMessageError(messageError))
    }
    return state.setExchangeRate(response)
  } catch (error) {
    createAndInserElemnentIntoDOM(error)
  }
}

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

const getOptions = (selectedCurrency, conversion_rates) => {
  return Object.keys(conversion_rates)
    .map(currency => `<option ${selectedCurrency === currency ? 'selected' : ''}>${currency}</option>`)
    .join('')
}

const showInicialInfo = ({conversion_rates}) => {
  currencyOneEl.innerHTML = getOptions('USD', conversion_rates)
  currencyTwoEl.innerHTML = getOptions('BRL', conversion_rates)
  convertedValueEl.textContent = conversion_rates['BRL'].toFixed(2)
  displayValueOfCurrency.textContent = `1 USD = ${conversion_rates['BRL'].toFixed(2)} BRL`
}

const showCurrencyConvertedOnce = () => {
  const { conversion_rates } = state.getExchangeRate()
  convertedValueEl.textContent = conversion_rates[currencyTwoEl.value].toFixed(2)
  displayValueOfCurrency.textContent = `1 ${currencyOneEl.value} = ${conversion_rates[currencyTwoEl.value]} ${currencyTwoEl.value}` 
}

const init = async () => {
  const exchangeRate = await fetchCurrency(getUrl('USD'))
  if(exchangeRate && exchangeRate.conversion_rates){
    showInicialInfo(exchangeRate)
  }
}

currencyOneEl.addEventListener('change', async (e) => {
  const currencyOne = e.target.value
  const exchangeRate = await fetchCurrency(getUrl(currencyOne))
  showCurrencyConvertedOnce()
})

currencyTwoEl.addEventListener('change', showCurrencyConvertedOnce)

timesCurrenciesEl.addEventListener('input', e => {
  const times = e.target.value
  const { conversion_rates } = state.getExchangeRate()
  const currentCurrency = conversion_rates[currencyTwoEl.value]
  convertedValueEl.textContent = (times * currentCurrency).toFixed(2)
})

init()