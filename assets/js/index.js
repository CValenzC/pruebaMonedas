const amountInput = document.getElementById('amount')
const currencySelect = document.getElementById('currency')
const convertButton = document.getElementById('convert-btn')
const resultText = document.getElementById('result')
const chartCanvas = document.getElementById('currency-chart')

const getApi = async (url) => {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Error al obtener los datos de la API')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error al llamar a la API:', error)
    alert('No se pudieron obtener los datos. Por favor, intenta nuevamente más tarde.')
    return null;
  }
}

convertButton.addEventListener('click', async () => {
  const amount = parseFloat(amountInput.value.trim())
  const currency = currencySelect.value

  if (isNaN(amount) || amount === 0) {
    alert('Por favor, ingresa un monto válido (no puede estar vacío o ser cero).')
    return
  }

  const apiData = await getApi('https://mindicador.cl/api/')
  if (!apiData) return

  const currencyValue = apiData[currency]?.valor
  if (!currencyValue) {
    alert('No se pudo obtener el valor de la moneda seleccionada.')
    return
  }

  const conversionResult = (amount / currencyValue).toFixed(2)
  resultText.textContent = `Resultado: $ ${conversionResult}`

  updateChart(currency)
})

const updateChart = async (currency) => {
  const today = new Date()
  const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`

  const historicalData = await getApi(`https://mindicador.cl/api/${currency}`)
  if (!historicalData) return

  const labels = historicalData.serie.slice(0, 10).map(item => item.fecha.split('T')[0])
  const values = historicalData.serie.slice(0, 10).map(item => item.valor)

  chart.data.labels = labels.reverse()
  chart.data.datasets[0].data = values.reverse()
  chart.update()
}

const chart = new Chart(chartCanvas, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Historial últimos 10 días',
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      fill: false,
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: 'black'
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Fechas'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Valor'
        }
      }
    }
  }
});
