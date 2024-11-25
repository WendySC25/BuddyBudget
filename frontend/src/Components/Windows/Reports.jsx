import React, { useState, useEffect } from 'react';
import Navbar from '../NavBar/Navbar';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, LineElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import client from '../../apiClient.jsx'; // Client
import './Reports.css';

// Chart.js configuration
ChartJS.register(BarElement, LineElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const Reports = ({ handleLogout }) => {
  const [chartDataIncomes, setChartDataIncomes] = useState(null);
  const [chartDataExpenses, setChartDataExpenses] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [view, setView] = useState('quincenas');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions from endpoint
        const response = await client.get('/api/transactions');
        const transactions = response.data;

        // Filter transactions by type
        const incomes = transactions.filter((item) => item.type === 'INC');
        const expenses = transactions.filter((item) => item.type === 'EXP');

        // Process data for charts
        const quincenasDataIncomes = groupByQuincenas(incomes);
        const dailyDataIncomes = groupByDays(incomes);
        setChartDataIncomes({ quincenas: quincenasDataIncomes, daily: dailyDataIncomes });

        const quincenasDataExpenses = groupByQuincenas(expenses);
        const dailyDataExpenses = groupByDays(expenses);
        setChartDataExpenses({ quincenas: quincenasDataExpenses, daily: dailyDataExpenses });
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Failed to load data. Please try again later.');
      }
    };

    fetchData();
  }, []);

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

  return (
    <div className="reports-page">
      <Navbar handleLogout={handleLogout} />
      <h1 className="reports-title">Reports Page</h1>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <div className="button-container">
        <button onClick={() => setView('quincenas')}>Last 4 fortnights</button>
        <button onClick={() => setView('daily')}>Diary (This Week)</button>
      </div>
      <div className="chart-container">
        {chartDataIncomes && (
          <div className="chart">
            <Bar data={chartDataIncomes[view]} options={options} />
          </div>
        )}
        {chartDataExpenses && (
          <div className="chart">
            <Bar data={chartDataExpenses[view]} options={options} />
          </div>
        )}
        {combinedChartData() && (
          <div className="chart">
            <Bar data={combinedChartData()} options={options} />
            </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
