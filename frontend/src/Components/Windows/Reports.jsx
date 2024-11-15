import React from 'react';
import Navbar from '../NavBar/Navbar';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import './Reports.css'; // Nuevo archivo de estilos

// Registrar componentes de Chart.js
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const Reports = ({ handleLogout }) => {
  // Hardcode de datos iniciales
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May'], // Meses
    datasets: [
      {
        label: 'Incomes',
        data: [5000, 4000, 3000, 4500, 6000], // Ingresos por mes
        backgroundColor: 'rgba(75, 192, 192, 0.5)', // Color de las barras
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: [3000, 2000, 4000, 2500, 5000], // Egresos por mes
        backgroundColor: 'rgba(255, 99, 132, 0.5)', // Color de las barras
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Income and Expenses Report',
      },
    },
  };

  return (
    <div className="reports-page">
      <Navbar handleLogout={handleLogout} />
      <h1 className="reports-title">Reports Page</h1>
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default Reports;
