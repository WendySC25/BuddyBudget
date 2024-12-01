import React, { useState, useEffect } from 'react';
import Navbar from '../NavBar/Navbar';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, ArcElement, PointElement, LineElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import client from '../../apiClient.jsx'; // Client
import './Reports.css';

// Registro de elementos de Chart.js
ChartJS.register(BarElement, PointElement, LineElement, CategoryScale, LinearScale, Title,ArcElement, Tooltip, Legend);

const Reports = ({ handleLogout }) => {
  const [chartDataIncomes, setChartDataIncomes] = useState(null);
  const [chartDataExpenses, setChartDataExpenses] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [view, setView] = useState('quincenas');
  const [chartType, setChartType] = useState('Line'); // Variable para el tipo de gráfico
  const [chartDataCategories, setChartDataCategories] = useState(null); // Variable para los datos de la grafica de categoria Incomes
  const [chartDataCategories1, setChartDataCategories1] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await client.get('/api/transactions');
        const transactions = response.data;

        const incomes = transactions.filter((item) => item.type === 'INC');
        const expenses = transactions.filter((item) => item.type === 'EXP');

        console.log("All Transactions:", transactions); // print transactions from json
        console.log("Incomes:", incomes);             
        console.log("Expenses:", expenses);          

        setChartDataIncomes({
          quincenas: groupByQuincenas(incomes),
          daily: groupByDays(incomes),
        });

        setChartDataExpenses({
          quincenas: groupByQuincenas(expenses),
          daily: groupByDays(expenses),
        });

        // grafica de pastel Incomes
        setChartDataCategories({
          quincenas: groupByCategory(incomes, 'quincenas'),
          daily: groupByCategory(incomes, 'daily'),
        });

        // grafica de pastel Expenses
        setChartDataCategories1({
          quincenas: groupByCategory(expenses, 'quincenas'),
          daily: groupByCategory(expenses, 'daily'),
        });

      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Failed to load data. Please try again later.');
      }
    };

    fetchData();
  }, []);

  // El metodo agrupa los ítems de un conjunto de datos (ingresos o gastos) en intervalos de quincenas dentro del mes actual y el mes anterior, proporcionando el total de cada quincena para su visualización en un gráfico de línea o barra.
  // La función retorna un objeto con la estructura necesaria para ser utilizado en bibliotecas de gráficos como Chart.js. 
  const groupByQuincenas = (items) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const quincenas = [
      {
        start: new Date(today.getFullYear(), currentMonth - 1, 1),
        end: new Date(today.getFullYear(), currentMonth - 1, 15),
      },
      {
        start: new Date(today.getFullYear(), currentMonth - 1, 16),
        end: new Date(today.getFullYear(), currentMonth - 1, new Date(today.getFullYear(), currentMonth, 0).getDate()),
      },
      {
        start: new Date(today.getFullYear(), currentMonth, 1),
        end: new Date(today.getFullYear(), currentMonth, 15),
      },
      {
        start: new Date(today.getFullYear(), currentMonth, 16),
        end: new Date(today.getFullYear(), currentMonth + 1, 0),
      },
    ];

    const normalizedQuincenas = quincenas.map((period) => ({
      start: new Date(period.start.setHours(0, 0, 0, 0)),
      end: new Date(period.end.setHours(23, 59, 59, 999)),
    }));

    const dataByQuincena = Array(normalizedQuincenas.length).fill(0);

    items.forEach((item) => {
      const date = new Date(item.date);
      const normalizedDate = new Date(date.setHours(0, 0, 0, 0));

      normalizedQuincenas.forEach((period, i) => {
        if (normalizedDate >= period.start && normalizedDate <= period.end) {
          dataByQuincena[i] += parseFloat(item.amount);
        }
      });
    });

    const labels = normalizedQuincenas.map(
      (period) => `${period.start.toLocaleDateString()} - ${period.end.toLocaleDateString()}`
    );

    return {
      labels,
      datasets: [
        {
          label: items[0]?.type === 'INC' ? 'Incomes' : 'Expenses',
          data: dataByQuincena,
          backgroundColor: items[0]?.type === 'INC' ? 'rgba(75, 192, 192, 0.5)' : 'rgba(255, 99, 132, 0.5)',
          borderColor: items[0]?.type === 'INC' ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Agrupa los ítems de ingresos o gastos por cada día de la semana, calculando el total por día.
  const groupByDays = (items) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);

    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return { date: day, amount: 0 };
    });

    items.forEach((item) => {
      const date = new Date(item.date);
      date.setDate(date.getDate() + 1);
      days.forEach((day) => {
        if (
          date.getFullYear() === day.date.getFullYear() &&
          date.getMonth() === day.date.getMonth() &&
          date.getDate() === day.date.getDate()
        ) {
          day.amount += parseFloat(item.amount);
        }
      });
    });

    return {
      labels: days.map((day) => day.date.toLocaleDateString()),
      datasets: [
        {
          label: items[0]?.type === 'INC' ? 'Incomes' : 'Expenses',
          data: days.map((day) => day.amount),
          backgroundColor: items[0]?.type === 'INC' ? 'rgba(75, 192, 192, 0.5)' : 'rgba(255, 99, 132, 0.5)',
          borderColor: items[0]?.type === 'INC' ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Combina los datos de ingresos y gastos seleccionados según la vista (quincenas o diaria) para crear los datos finales del gráfico.
  const combinedChartData = () => {
    if (!chartDataIncomes || !chartDataExpenses) return null;

    const selectedDataIncomes = view === 'quincenas' ? chartDataIncomes.quincenas : chartDataIncomes.daily;
    const selectedDataExpenses = view === 'quincenas' ? chartDataExpenses.quincenas : chartDataExpenses.daily;

    return {
      labels: selectedDataIncomes.labels,
      datasets: [
        ...selectedDataIncomes.datasets,
        ...selectedDataExpenses.datasets,
      ],
    };
  };

  // Filtra los ingresos que caen dentro de las últimas 4 quincenas (últimas dos del mes pasado y las dos del mes actual).
  const getItemsFromLast4Quincenas = (incomes) => {
    const today = new Date();
    const currentMonth = today.getMonth();
  
    // Definir las quincenas (últimas 4 quincenas)
    const quincenas = [
      {
        start: new Date(today.getFullYear(), currentMonth - 1, 1), // Primer quincena del mes pasado
        end: new Date(today.getFullYear(), currentMonth - 1, 15),
      },
      {
        start: new Date(today.getFullYear(), currentMonth - 1, 16), // Segunda quincena del mes pasado
        end: new Date(today.getFullYear(), currentMonth, 0), // Último día del mes pasado
      },
      {
        start: new Date(today.getFullYear(), currentMonth, 1), // Primera quincena del mes actual
        end: new Date(today.getFullYear(), currentMonth, 15),
      },
      {
        start: new Date(today.getFullYear(), currentMonth, 16), // Segunda quincena del mes actual
        end: new Date(today.getFullYear(), currentMonth + 1, 0), // Último día del mes actual
      },
    ];
  
    // Normalizar las fechas de las quincenas (ajustar a medianoche y fin de día)
    const normalizedQuincenas = quincenas.map((period) => ({
      start: new Date(period.start.setHours(0, 0, 0, 0)),
      end: new Date(period.end.setHours(23, 59, 59, 999)),
    }));
  
    // Filtrar los ingresos que caen dentro de las últimas 4 quincenas
    return incomes.filter((income) => {
      const incomeDate = new Date(income.date);
      return normalizedQuincenas.some(
        (period) => incomeDate >= period.start && incomeDate <= period.end
      );
    });
  };
  
  // Filtra los items que caen dentro de la semana actual, desde el lunes hasta el domingo.
  const getItemsFromLastWeek = (items) => {
    const today = new Date();
    
    // Calcular el lunes de esta semana (inicio de la semana)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lunes de esta semana
    
    // Calcular el domingo de esta semana (final de la semana)
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() - today.getDay() + 7); // Domingo de esta semana
    
    // Normalizar las fechas para comparación
    const start = new Date(startOfWeek.setHours(0, 0, 0, 0)); // Medianoche del lunes
    const end = new Date(endOfWeek.setHours(23, 59, 59, 999)); // Último segundo del domingo
    
    // Filtrar los items dentro de este rango
    return items.filter((item) => {
      const itemDate = new Date(item.date);
      itemDate.setDate(itemDate.getDate() + 1);
      return itemDate >= start && itemDate <= end;
    });
  };
  
  // Metodos para combinar colores cuando en una transaccion hay multiples colores
  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.replace('#', ''), 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };
  
  const rgbToHex = (r, g, b) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)}`;
  };
  
  const blendColors = (colors) => {
    const totalColors = colors.length;
    const blendedRgb = colors.reduce(
      (acc, color) => {
        const rgb = hexToRgb(color);
        return {
          r: acc.r + rgb.r / totalColors,
          g: acc.g + rgb.g / totalColors,
          b: acc.b + rgb.b / totalColors,
        };
      },
      { r: 0, g: 0, b: 0 }
    );
    return rgbToHex(
      Math.round(blendedRgb.r),
      Math.round(blendedRgb.g),
      Math.round(blendedRgb.b)
    );
  };
  
  // Agrupa los items por categoría y suma el monto total por categoría, según el periodo (quincenas o diario).
  const groupByCategory = (items, period) => {
    const categoryTotals = {};
    const categoryColors = {};
  
    if (period === 'quincenas') {
      const quincenas = getItemsFromLast4Quincenas(items); // Obtener transacciones agrupados por quincenas
      // itero cada transaccion de las de quincena
      quincenas.forEach((quincena) => {
        // si la transaccion tiene mas de una categoria --> manejo categoria multiple
        if (quincena.category.length > 1) {
          // Crear un nombre combinado para las categorías
          const combinedCategoryName = quincena.category
            .map((cat) => cat.category_name)
            .join(' & ');
  
          // Checo si el nombre de categoria combinada existe, si si no hago nada, sino lo registro
          if (!categoryTotals[combinedCategoryName]) {
            categoryTotals[combinedCategoryName] = 0;
          }
          // Añado el amount a la categoria
          categoryTotals[combinedCategoryName] += parseFloat(quincena.amount);
  
          // Crear un color combinado
          const combinedColors = quincena.category.map((cat) => cat.color);
          categoryColors[combinedCategoryName] =
            categoryColors[combinedCategoryName] || blendColors(combinedColors);
        } else {
          // Transacción con una sola categoría
          const singleCategoryName = quincena.category[0].category_name;
          const categoryColor = quincena.category[0].color;
          
          // Checo si el nombre de categoria existe, si no lo agrego junto con color
          if (!categoryTotals[singleCategoryName]) {
            categoryTotals[singleCategoryName] = 0;
            categoryColors[singleCategoryName] = categoryColor;
          }
          categoryTotals[singleCategoryName] += parseFloat(quincena.amount);
        }
      });
    } else if (period === 'daily') {
      const daily = getItemsFromLastWeek(items); // Obtener items agrupados por días
      daily.forEach((day) => {
        if (day.category.length > 1) {
          const combinedCategoryName = day.category
            .map((cat) => cat.category_name)
            .join(' & ');
  
          if (!categoryTotals[combinedCategoryName]) {
            categoryTotals[combinedCategoryName] = 0;
          }
          categoryTotals[combinedCategoryName] += parseFloat(day.amount);
  
          const combinedColors = day.category.map((cat) => cat.color);
          categoryColors[combinedCategoryName] =
            categoryColors[combinedCategoryName] || blendColors(combinedColors);
        } else {
          const singleCategoryName = day.category[0].category_name;
          const categoryColor = day.category[0].color;
  
          if (!categoryTotals[singleCategoryName]) {
            categoryTotals[singleCategoryName] = 0;
            categoryColors[singleCategoryName] = categoryColor;
          }
          categoryTotals[singleCategoryName] += parseFloat(day.amount);
        }
      });
    }
  
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const backgroundColor = labels.map((label) => categoryColors[label]);
  

    return {
      labels,
      datasets: [
        {
          label: items[0]?.type === 'INC' ? 'Incomes' : 'Expenses',
          data,
          backgroundColor,
          borderColor: 'rgba(255, 255, 255, 0.7)',
          borderWidth: 1,
        },
      ],
    };
  };
    
  
  

  // Opciones de configuración para el gráfico de pastel (Pie).
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: {
        display: true,
        text: view === 'quincenas' ? 'Last 4 Biweekly Periods' : 'Daily Report (This Week)',
      },
    },
  };

  

  // Opciones de configuración para los gráficos de barras y líneas.
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: view === 'quincenas' ? 'Last 4 Biweekly Periods' : 'Daily Report (This Week)',
      },
    },
  };

  // Selección entre gráfico de barras o de líneas.
  const ChartComponent = chartType === 'Line' ? Line : Bar;

  // Renderiza la página de reportes con selección de gráficos, botones para elegir periodos de visualización y los gráficos correspondientes.
  return (
    <div className="reports-page">
      <Navbar handleLogout={handleLogout} />
      <h1 className="reports-title">Reports Page</h1>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <div className="button-container">
        <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
          <option value="Bar">Bar Chart</option>
          <option value="Line">Line Chart</option>
        </select>
        <button onClick={() => setView('quincenas')}>Last 4 fortnights</button>
        <button onClick={() => setView('daily')}>Diary (This Week)</button>
      </div>
      <div className="charts-wrapper">
      <div className="chart-container">
        {chartDataIncomes && (
          <div className="chart">
            <h1>Incomes</h1>
            <ChartComponent data={chartDataIncomes[view]} options={options} />
          </div>
        )}
        {chartDataIncomes && (
          <div className="chart">
            <h1>Expenses</h1>
            <ChartComponent data={chartDataExpenses[view]} options={options} />
          </div>
        )}
        {combinedChartData() && (
          <div className="chart">
            <h1>Incomes and Expenses</h1>
            <ChartComponent data={combinedChartData()} options={options} />
          </div>
        )}
      </div>
      <div className="chart-container">
        {chartDataCategories && (
          <div className="chart">
            <h1>Incomes</h1>
            <Pie data={view === 'quincenas' ? chartDataCategories.quincenas : chartDataCategories.daily} options={pieOptions}/>
          </div>
        )}
        {chartDataCategories1 && (
          <div className="chart">
            <h1>Expenses</h1>
            <Pie data={view === 'quincenas' ? chartDataCategories1.quincenas : chartDataCategories1.daily} options={pieOptions}/>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Reports;