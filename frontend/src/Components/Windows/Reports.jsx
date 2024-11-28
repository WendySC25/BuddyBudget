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
  const [chartType, setChartType] = useState('Bar'); // Variable para el tipo de gráfico
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
  
  // Agrupa los items por categoría y suma el monto total por categoría, según el periodo (quincenas o diario).
  // No hay un buen manejo de las categorias cuando un item tiene multiples, sera lo siguiente a modificar
  const groupByCategory = (items, period) => {
  
    const categoryTotals = {};
  
    if (period === 'quincenas') {
      const quincenas = getItemsFromLast4Quincenas(items); // Obtener items agrupados por quincenas
      quincenas.forEach((quincenas) => {
        quincenas.category.forEach((cat) => {
          if (!categoryTotals[cat.category_name]) {
            categoryTotals[cat.category_name] = 0;
          }
          categoryTotals[cat.category_name] += parseFloat(quincenas.amount);
        });
      });
    } else if (period === 'daily') {
      const daily = getItemsFromLastWeek(items); // Obtener items agrupados por días
      console.log("Daily items:", daily);
      daily.forEach((daily) => {
        daily.category.forEach((cat) => {
          if (!categoryTotals[cat.category_name]) {
            categoryTotals[cat.category_name] = 0;
          }
          categoryTotals[cat.category_name] += parseFloat(daily.amount);
        });
      });
    }
  
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
  
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map(
            (_, index) => `hsl(${(index * 360) / labels.length}, 70%, 50%)`
          ),
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
        text: 'Category Distribution',
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
  const ChartComponent = chartType === 'Bar' ? Bar : Line;

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
      <div className="chart-container">
        {chartDataIncomes && (
          <div className="chart">
            <ChartComponent data={chartDataIncomes[view]} options={options} />
          </div>
        )}
        {chartDataIncomes && (
          <div className="chart">
            <ChartComponent data={chartDataExpenses[view]} options={options} />
          </div>
        )}
        {combinedChartData() && (
          <div className="chart">
            <ChartComponent data={combinedChartData()} options={options} />
          </div>
        )}
        {chartDataCategories && (
          <div className="chart">
            <Pie data={view === 'quincenas' ? chartDataCategories.quincenas : chartDataCategories.daily} options={pieOptions}/>
          </div>
        )}
        {chartDataCategories1 && (
          <div className="chart">
            <Pie data={view === 'quincenas' ? chartDataCategories1.quincenas : chartDataCategories1.daily} options={pieOptions}/>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;