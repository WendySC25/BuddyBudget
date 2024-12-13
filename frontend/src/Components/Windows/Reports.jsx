import React, { useState, useEffect } from 'react';
import Navbar from '../NavBar/Navbar';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, ArcElement, PointElement, LineElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import client from '../../apiClient.jsx'; // Client
import './Reports.css';
import FilterCategoriesPopup from './FilterCategoriesPopup.jsx';

// Registro de elementos de Chart.js
ChartJS.register(BarElement, PointElement, LineElement, CategoryScale, LinearScale, Title,ArcElement, Tooltip, Legend);

const Reports = ({ handleLogout }) => {
  // Definicion de estados
  const [chartDataIncomes, setChartDataIncomes] = useState(null); // almacena datos agrupados para mostrar las graficas de Incomes
  const [chartDataExpenses, setChartDataExpenses] = useState(null); // almacena datos agrupados para mostrar las graficas de Expenses
  const [errorMessage, setErrorMessage] = useState(''); // mensaje para errores relacionados al cargar datos
  const [view, setView] = useState('quincenas'); // define la temporalidad del grafico
  const [chartType, setChartType] = useState('Line'); // variable para el tipo de gráfico
  const [chartDataCategories, setChartDataCategories] = useState(null); // variable para los datos de la grafica de categoria Incomes
  const [chartDataCategories1, setChartDataCategories1] = useState(null); // variable para los datos de la grafica de categoria de Expenses
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Estado para abrir/cerrar popup
  const [filteredCategories, setFilteredCategories] = useState([]); // Categorías seleccionadas
  const [filteredCategories1, setFilteredCategories1] = useState([]); // Categorías existentes
  const [filteredCategoriesExpenses, setFilteredCategoriesExpenses] = useState([]); // Categorías seleccionadas
  const [filteredCategoriesExpenses1, setFilteredCategoriesExpenses1] = useState([]); // Categorías existentes
  const [filteredIncomes, setFilteredIncomes] = useState(null); // Transacciones de ingresos filtradas
  const [filteredExpenses, setFilteredExpenses] = useState(null); // Transacciones de egresos filtradas
  const [incomes, setIncomes] = useState(null); // Transacciones de incomes globales
  const [expenses, setExpenses] = useState(null); // Transacciones de expenses globales
  const [popupType, setPopupType] = useState(null);

  const [isPopupOpenIncomes, setIsPopupOpenIncomes] = useState(false);
  const [isPopupOpenExpenses, setIsPopupOpenExpenses] = useState(false);

  // Metodo para abrir pop ups dependiendo si se quiere el filtro para incomes o expenses
  const handleOpenPopup = (type) => {
    if (type === 'incomes') {
      setIsPopupOpenIncomes(true);
      setIsPopupOpenExpenses(false);  
  } else if (type === 'expenses') {
      setIsPopupOpenExpenses(true);
      setIsPopupOpenIncomes(false);  
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpenIncomes(false);
    setIsPopupOpenExpenses(false);
  };

  useEffect(() => {
    const appName = document.querySelector('meta[name="app-name"]').getAttribute('content');
    document.title = `Reports - ${appName}`;
  }, []);

  // Codigo a ejecutar al entrar en esta actividad
  useEffect(() => {
    // con fetch llamo a la Api para obtener transacciones
    const fetchData = async () => {
      try {
        const response = await client.get('/api/transactions'); // llamada al endpoint donde estan las transacciones
        const transactions = response.data; // almaceno el json de transacciones

        const incomes = transactions.filter((item) => item.type === 'INC'); // filtro entre las transacciones los incomes
        setIncomes(incomes); // guardo incomes globalmente
        const expenses = transactions.filter((item) => item.type === 'EXP'); // "" expenses
        setExpenses(expenses); // guardo expenses globalmente        

        // Defino las graficas de incomes y expenses, utilizo funciones para organizar los datos segun la temporalidad elegida
        setChartDataIncomes({
          quincenas: groupByQuincenas(incomes),
          daily: groupByDays(incomes),
          mensual: groupByMonths(incomes),
          semanal: groupByLast8Weeks(incomes),
          anual: groupByLast5Years(incomes),
        });

        setChartDataExpenses({
          quincenas: groupByQuincenas(expenses),
          daily: groupByDays(expenses),
          mensual: groupByMonths(expenses),
          semanal: groupByLast8Weeks(expenses),
          anual: groupByLast5Years(expenses),
        });

        const dynamicCategories = getUniqueCategoryNames(incomes); // Obtiene las categorías dinámicas de incomes
        setFilteredCategories(dynamicCategories);
        setFilteredCategories1(dynamicCategories);


        // Grafica de pastel Incomes y abajo expenses con temporalidades
        setChartDataCategories({
          quincenas: groupByCategory(incomes, 'quincenas'),
          daily: groupByCategory(incomes, 'daily'),
          mensual: groupByCategory(incomes, 'mensual'),
          semanal: groupByCategory(incomes, 'semanal'),
          anual: groupByCategory(incomes, 'anual'),
        
        });

        setChartDataCategories1({
          quincenas: groupByCategory(expenses, 'quincenas'),
          daily: groupByCategory(expenses, 'daily'),
          mensual: groupByCategory(expenses, 'mensual'),
          semanal: groupByCategory(expenses, 'semanal'),
          anual: groupByCategory(expenses, 'anual'),
        });

        const dynamicCategoriesExpenses = getUniqueCategoryNames(expenses); // Obtiene las categorías dinámicas de expenses
        setFilteredCategoriesExpenses(dynamicCategoriesExpenses);
        setFilteredCategoriesExpenses1(dynamicCategoriesExpenses);

      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Failed to load data. Please try again later.');
      }
    };

    fetchData();
  }, []);

  const handleSaveFilters = (selectedCategories) => {
    setFilteredCategories(selectedCategories); // Guardamos las categorias seleccionadas para mostrarlas cuando vuelva a abrir

    // Filtrar ingresos y egresos por categorías seleccionadas
    const filteredIncomes = filterTransactionsByCategories(incomes, selectedCategories);
    setFilteredIncomes(filteredIncomes);

    // Actualizar datos de las gráficas
    setChartDataIncomes({
      quincenas: groupByQuincenas(filteredIncomes),
      daily: groupByDays(filteredIncomes),
      mensual: groupByMonths(filteredIncomes),
      semanal: groupByLast8Weeks(filteredIncomes),
      anual: groupByLast5Years(filteredIncomes),
    });

    setChartDataCategories({
      quincenas: groupByCategory(filteredIncomes, 'quincenas'),
      daily: groupByCategory(filteredIncomes, 'daily'),
      mensual: groupByCategory(filteredIncomes, 'mensual'),
      semanal: groupByCategory(filteredIncomes, 'semanal'),
      anual: groupByCategory(filteredIncomes, 'anual'),
    
    });

    combinedChartData();


    setIsPopupOpenIncomes(false);
    console.log("Filtered Categories:", selectedCategories);
  };

  const handleClearFilters = () => {
    setFilteredCategories(filteredCategories1);
    setFilteredIncomes(incomes);
    // Actualizar datos de las gráficas sin categorias filtradas
    setChartDataIncomes({
      quincenas: groupByQuincenas(incomes),
      daily: groupByDays(incomes),
      mensual: groupByMonths(incomes),
      semanal: groupByLast8Weeks(incomes),
      anual: groupByLast5Years(incomes),
    });

    setChartDataCategories({
      quincenas: groupByCategory(incomes, 'quincenas'),
      daily: groupByCategory(incomes, 'daily'),
      mensual: groupByCategory(incomes, 'mensual'),
      semanal: groupByCategory(incomes, 'semanal'),
      anual: groupByCategory(incomes, 'anual'),
    
    });

    combinedChartData(); // llamo a que se actualice la grafica combinada de incomes y expenses
    setIsPopupOpenIncomes(false);
    console.log("Filters cleared, restored initial categories:", filteredCategories);
  };

  const handleSaveExpenseFilters = (selectedCategories) => {
    setFilteredCategoriesExpenses(selectedCategories); // Guardamos las categorias seleccionadas para mostrarlas cuando vuelva a abrir
  
    // Filtrar egresos por categorías seleccionadas
    const filteredExpenses = filterTransactionsByCategories(expenses, selectedCategories);
    setFilteredExpenses(filteredExpenses);
  
    // Actualizar datos de las gráficas de gastos
    setChartDataExpenses({
      quincenas: groupByQuincenas(filteredExpenses),
      daily: groupByDays(filteredExpenses),
      mensual: groupByMonths(filteredExpenses),
      semanal: groupByLast8Weeks(filteredExpenses),
      anual: groupByLast5Years(filteredExpenses),
    });
  
    setChartDataCategories1({
      quincenas: groupByCategory(filteredExpenses, 'quincenas'),
      daily: groupByCategory(filteredExpenses, 'daily'),
      mensual: groupByCategory(filteredExpenses, 'mensual'),
      semanal: groupByCategory(filteredExpenses, 'semanal'),
      anual: groupByCategory(filteredExpenses, 'anual'),
    });
  
    combinedChartData();
    setIsPopupOpenExpenses(false);
    console.log("Filtered Expense Categories:", selectedCategories);
  };
  
  const handleClearExpenseFilters = () => {
    setFilteredCategoriesExpenses(getUniqueCategoryNames(expenses)); // Restaura las categorías dinámicas originales
    setFilteredExpenses(expenses);
  
    // Actualizar datos de las gráficas de gastos
    setChartDataExpenses({
      quincenas: groupByQuincenas(expenses),
      daily: groupByDays(expenses),
      mensual: groupByMonths(expenses),
      semanal: groupByLast8Weeks(expenses),
      anual: groupByLast5Years(expenses),
    });
  
    setChartDataCategories1({
      quincenas: groupByCategory(expenses, 'quincenas'),
      daily: groupByCategory(expenses, 'daily'),
      mensual: groupByCategory(expenses, 'mensual'),
      semanal: groupByCategory(expenses, 'semanal'),
      anual: groupByCategory(expenses, 'anual'),
    });
    combinedChartData();
    setIsPopupOpenExpenses(false);
    console.log("Expense filters cleared, restored initial categories:", filteredCategories1);
  };
  

  /**
  * Filtra las transacciones según las categorías especificadas.
  * 
  * @param {Array} transactions - Arreglo de transacciones.
  * @param {Array} categories - Arreglo de categorías para filtrar.
  * @returns {Array} - Arreglo de transacciones filtradas.
  */
  const filterTransactionsByCategories = (transactions, categories) => {
    return transactions.filter(transaction => {
      if (transaction.category.length > 1) {
        // Crear el nombre combinado para las categorías múltiples
        const combinedCategoryName = transaction.category
          .map(cat => cat.category_name)
          .join(' & ');

        // Verificar si el nombre combinado está en el arreglo de categorías
        return categories.includes(combinedCategoryName);
      } else {
        // Verificar si la categoría única está en el arreglo de categorías
        const singleCategoryName = transaction.category[0].category_name;
        return categories.includes(singleCategoryName);
      }
    });
  };


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
  // Retorna la estructura necesaria para la grafica de movimientos diaria
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

  // Agrupa los ítems de ingresos o egresos por cada mes del año actual, calculando el total por mes.
  // Retorna la estructura necesaria para la grafica de ingresos/egresos mensual
  const groupByMonths = (items) => {
    const today = new Date();
    const currentYear = today.getFullYear();
  
    // Crear los rangos de meses para el año actual
    const months = Array.from({ length: 12 }, (_, i) => ({
      start: new Date(currentYear, i, 1),
      end: new Date(currentYear, i + 1, 0, 23, 59, 59, 999), // Último día del mes
    }));
  
    // Inicializar el acumulador para cada mes
    const dataByMonth = Array(months.length).fill(0);
  
    // Procesar los items
    items.forEach((item) => {
      const date = new Date(item.date);
      const normalizedDate = new Date(date.setHours(0, 0, 0, 0));
  
      months.forEach((period, i) => {
        if (normalizedDate >= period.start && normalizedDate <= period.end) {
          dataByMonth[i] += parseFloat(item.amount);
        }
      });
    });
  
    // Generar etiquetas para los meses
    const labels = months.map((period) =>
      period.start.toLocaleString("default", { month: "long" })
    );
  
    return {
      labels,
      datasets: [
        {
          label: items[0]?.type === "INC" ? "Incomes" : "Expenses",
          data: dataByMonth,
          backgroundColor:
            items[0]?.type === "INC"
              ? "rgba(75, 192, 192, 0.5)"
              : "rgba(255, 99, 132, 0.5)",
          borderColor:
            items[0]?.type === "INC"
              ? "rgba(75, 192, 192, 1)"
              : "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Agrupa los ítems de ingresos o egreso semanalmente durante las 8 semanas anteriores, calculando el total por semana.
  // Retorna la estructura necesaria para la grafica de movimientos semanal
  const groupByLast8Weeks = (items) => {
    const today = new Date();
    
    // Asegurar que la hora es consistente (00:00:00)
    today.setHours(0, 0, 0, 0);
  
    // Calcular el inicio del lunes de la semana actual
    const startOfCurrentWeek = new Date(today);
    
    // Si hoy es domingo (getDay() === 0), establecer el lunes de la semana actual
    if (today.getDay() === 0) {
      startOfCurrentWeek.setDate(today.getDate() - 6); // Retroceder 6 días para llegar al lunes
    } else {
      startOfCurrentWeek.setDate(today.getDate() - today.getDay() + 1); // Ajustar para el lunes
    }
  
    // Generar los rangos de las últimas 8 semanas
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const start = new Date(startOfCurrentWeek);
      start.setDate(start.getDate() - i * 7); // Mover hacia atrás semanas
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // Domingo de la misma semana
      end.setHours(23, 59, 59, 999); // Final del domingo
      return { start, end };
    }).reverse();
  
    // Inicializar acumulador por semana
    const dataByWeek = Array(weeks.length).fill(0);
  
    // Procesar los ítems
    items.forEach((item) => {
      const date = new Date(item.date);
      weeks.forEach((week, i) => {
        if (date >= week.start && date <= week.end) {
          dataByWeek[i] += parseFloat(item.amount);
        }
      });
    });
  
    // Generar etiquetas para las semanas
    const labels = weeks.map(
      (week) => `${week.start.toLocaleDateString()} - ${week.end.toLocaleDateString()}`
    );
  
    return {
      labels,
      datasets: [
        {
          label: items[0]?.type === 'INC' ? 'Incomes' : 'Expenses',
          data: dataByWeek,
          backgroundColor: items[0]?.type === 'INC' ? 'rgba(75, 192, 192, 0.5)' : 'rgba(255, 99, 132, 0.5)',
          borderColor: items[0]?.type === 'INC' ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Agrupa los ítems de ingresos o egreso anualmente durante las 5 anios anteriores, calculando el total anual.
  // Retorna la estructura necesaria para la grafica de movimientos anual
  const groupByLast5Years = (items) => {
    const currentYear = new Date().getFullYear();
  
    // Generar el rango de los últimos 5 años, incluyendo el actual
    const years = Array.from({ length: 5 }, (_, i) => currentYear - (4 - i));
  
    // Inicializar acumulador por año
    const dataByYear = Array(years.length).fill(0);
  
    // Procesar los ítems
    items.forEach((item) => {
      const year = new Date(item.date).getFullYear();
      const index = years.indexOf(year);
      if (index !== -1) {
        dataByYear[index] += parseFloat(item.amount);
      }
    });
  
    // Generar etiquetas para los años
    const labels = years.map((year) => year.toString());
  
    return {
      labels,
      datasets: [
        {
          label: items[0]?.type === 'INC' ? 'Incomes' : 'Expenses',
          data: dataByYear,
          backgroundColor: items[0]?.type === 'INC' ? 'rgba(75, 192, 192, 0.5)' : 'rgba(255, 99, 132, 0.5)',
          borderColor: items[0]?.type === 'INC' ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  };
  
  

  // Combina los datos de ingresos y gastos seleccionados según la temporalidad para crear los datos finales del gráfico donde se combinan ingresos y egresos.
  const combinedChartData = () => {
    if (!chartDataIncomes || !chartDataExpenses) return null;

    const selectedDataIncomes = view === 'quincenas' ? chartDataIncomes.quincenas : view === 'semanal' ? chartDataIncomes.semanal : view === 'anual' ? chartDataIncomes.anual : view === 'mensual' ? chartDataIncomes.mensual : chartDataIncomes.daily;
    const selectedDataExpenses = view === 'quincenas' ? chartDataExpenses.quincenas : view === 'semanal' ? chartDataExpenses.semanal : view === 'anual' ? chartDataExpenses.anual : view === 'mensual' ? chartDataExpenses.mensual : chartDataExpenses.daily;

    return {
      labels: selectedDataIncomes.labels,
      datasets: [
        ...selectedDataIncomes.datasets,
        ...selectedDataExpenses.datasets,
      ],
    };
  };

  // A continuacion se presentan metodos donde retorno movimientos en periodos de tiempo para las graficas de categorias 

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

  // Filtra las transacciones que caen dentro del año actual para la chart de meses.
  const getItemsFromYear = (items) => {
    const today = new Date();
    const currentYear = today.getFullYear();
  
    // Definir los límites del año actual
    const startOfYear = new Date(currentYear, 0, 1); // 1 de enero del año actual
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999); // 31 de diciembre del año actual
  
    // Filtrar los ítems que caen dentro del año actual
    return items.filter((item) => {
      const itemDate = new Date(item.date); // Asegúrate de que item.date sea una cadena compatible con Date
      return itemDate >= startOfYear && itemDate <= endOfYear;
    });
  };
  
  // Filtra las transacciones que caen dentro de los ultimos 5 años para la chart de anios.
  const getItemsFromLast5Years = (items) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startYear = currentYear - 5; // El año de inicio es 5 años atrás
    
    // Definir el rango de fechas desde el inicio del 1 de enero del año de inicio hasta el 31 de diciembre del año actual
    const startOfRange = new Date(startYear, 0, 1); // 1 de enero del año de inicio
    const endOfRange = new Date(currentYear, 11, 31, 23, 59, 59, 999); // 31 de diciembre del año actual
    
    // Filtrar los ítems que caen dentro de este rango de 5 años
    return items.filter((item) => {
      const itemDate = new Date(item.date); // Asegúrate de que item.date sea una cadena compatible con Date
      return itemDate >= startOfRange && itemDate <= endOfRange;
    });
  };

  // Filtra las transacciones que caen dentro de las ultimas 8 semanas para la chart semanal.
  const getItemsFromLast8Weeks = (items) => {
    const today = new Date();
    
    // Asegurar que la hora es consistente (00:00:00)
    today.setHours(0, 0, 0, 0);
  
    // Calcular el inicio del lunes de la semana actual
    const startOfCurrentWeek = new Date(today);
    
    // Si hoy es domingo (getDay() === 0), establecer el lunes de la semana actual
    if (today.getDay() === 0) {
      startOfCurrentWeek.setDate(today.getDate() - 6); // Retroceder 6 días para llegar al lunes
    } else {
      startOfCurrentWeek.setDate(today.getDate() - today.getDay() + 1); // Ajustar para el lunes
    }
  
    // Generar los rangos de las últimas 8 semanas
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const start = new Date(startOfCurrentWeek);
      start.setDate(start.getDate() - i * 7); // Mover hacia atrás semanas
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // Domingo de la misma semana
      end.setHours(23, 59, 59, 999); // Final del domingo
      return { start, end };
    }).reverse();
  
    // Filtrar los ítems que caen dentro de las últimas 8 semanas
    return items.filter((item) => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0); // Normalizar la hora
      return weeks.some((week) => itemDate >= week.start && itemDate <= week.end);
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
  // Con esto metodo se hace las graficas de pastel de categorias
  // Este metodo se puede refactorizar, posiblemente vuelva a el, lo que hay dentro de cada if es lo mismo, solo cambian los datos que se le pasan, podria poner un switch para ver que datos pasar.
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
    } else if (period == 'mensual'){
      const itemsAnio = getItemsFromYear(items); 
      itemsAnio.forEach((itemsAnio) => {
        if (itemsAnio.category.length > 1) {
          const combinedCategoryName = itemsAnio.category
            .map((cat) => cat.category_name)
            .join(' & ');
  
          if (!categoryTotals[combinedCategoryName]) {
            categoryTotals[combinedCategoryName] = 0;
          }
          categoryTotals[combinedCategoryName] += parseFloat(itemsAnio.amount);
          const combinedColors = itemsAnio.category.map((cat) => cat.color);
          categoryColors[combinedCategoryName] =
            categoryColors[combinedCategoryName] || blendColors(combinedColors);
        } else {
          const singleCategoryName = itemsAnio.category[0].category_name;
          const categoryColor = itemsAnio.category[0].color;
          if (!categoryTotals[singleCategoryName]) {
            categoryTotals[singleCategoryName] = 0;
            categoryColors[singleCategoryName] = categoryColor;
          }
          categoryTotals[singleCategoryName] += parseFloat(itemsAnio.amount);
        }
      });
    } else if (period == 'anual'){
      const itemsAnio = getItemsFromLast5Years(items); 
      itemsAnio.forEach((itemsAnio) => {
        if (itemsAnio.category.length > 1) {
          const combinedCategoryName = itemsAnio.category
            .map((cat) => cat.category_name)
            .join(' & ');
  
          if (!categoryTotals[combinedCategoryName]) {
            categoryTotals[combinedCategoryName] = 0;
          }
          categoryTotals[combinedCategoryName] += parseFloat(itemsAnio.amount);
          const combinedColors = itemsAnio.category.map((cat) => cat.color);
          categoryColors[combinedCategoryName] =
            categoryColors[combinedCategoryName] || blendColors(combinedColors);
        } else {
          const singleCategoryName = itemsAnio.category[0].category_name;
          const categoryColor = itemsAnio.category[0].color;
          if (!categoryTotals[singleCategoryName]) {
            categoryTotals[singleCategoryName] = 0;
            categoryColors[singleCategoryName] = categoryColor;
          }
          categoryTotals[singleCategoryName] += parseFloat(itemsAnio.amount);
        }
      });
    } else if (period == 'semanal'){
      const itemsAnio = getItemsFromLast8Weeks(items); 
      itemsAnio.forEach((itemsAnio) => {
        if (itemsAnio.category.length > 1) {
          const combinedCategoryName = itemsAnio.category
            .map((cat) => cat.category_name)
            .join(' & ');
          if (!categoryTotals[combinedCategoryName]) {
            categoryTotals[combinedCategoryName] = 0;
          }
          categoryTotals[combinedCategoryName] += parseFloat(itemsAnio.amount);
  
          const combinedColors = itemsAnio.category.map((cat) => cat.color);
          categoryColors[combinedCategoryName] =
            categoryColors[combinedCategoryName] || blendColors(combinedColors);
        } else {
          const singleCategoryName = itemsAnio.category[0].category_name;
          const categoryColor = itemsAnio.category[0].color;
          if (!categoryTotals[singleCategoryName]) {
            categoryTotals[singleCategoryName] = 0;
            categoryColors[singleCategoryName] = categoryColor;
          }
          categoryTotals[singleCategoryName] += parseFloat(itemsAnio.amount);
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

  // Metodo que retorna las categorias de una lista de transacciones
  const getUniqueCategoryNames = (transactions) => {
    const uniqueCategories = []; // Lista para almacenar las categorías únicas
  
    transactions.forEach((transaction) => {
      if (transaction.category.length > 1) {
        // Crear un nombre combinado para las categorías
        const combinedCategoryName = transaction.category
          .map((cat) => cat.category_name)
          .join(' & ');
  
        // Verificar si la categoría combinada ya existe en la lista
        if (!uniqueCategories.includes(combinedCategoryName)) {
          uniqueCategories.push(combinedCategoryName);
        }
      } else {
        // Transacción con una sola categoría
        const singleCategoryName = transaction.category[0].category_name;
  
        // Verificar si la categoría única ya existe en la lista
        if (!uniqueCategories.includes(singleCategoryName)) {
          uniqueCategories.push(singleCategoryName);
        }
      }
    });
  
    return uniqueCategories;
  };
  
    
  
  

  // Opciones de configuración (texto dependiendo la temporalidad) para el gráfico de pastel (Pie).
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: {
        display: true,
        text: view === 'quincenas' ? 'Biweekly Periods' : view == 'mensual' ? 'Monthly Periods' : view === 'semanal' ? 'Weekly Periods' : view === 'anual' ? 'Annual Periods' :'Daily Report (This Week)',
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
        text: view === 'quincenas' ? 'Biweekly Periods' : view == 'mensual' ? 'Monthly Periods' : view === 'semanal' ? 'Weekly Periods' : view === 'anual' ? 'Annual Periods' :'Daily Report (This Week)',
      },
    },
  };

  // Selección entre gráfico de barras o de líneas.
  const ChartComponent = chartType === 'Line' ? Line : Bar;
  
  
  // Renderiza la página de reportes con selección de gráficos, botones para elegir periodos de visualización y los gráficos correspondientes.
  return (
    <div className="reports-page">
      <Navbar handleLogout={handleLogout} />
      <h1 style={{ marginTop: '22px' }}>Reports Page </h1>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <div className="button-container">
        <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
          <option value="Bar">Bar Chart</option>
          <option value="Line">Line Chart</option>
        </select>
        <select value={view} onChange={(e) => setView(e.target.value)}>
            <option value="quincenas">Fortnights</option>
            <option value="daily">Diary (This Week)</option>
            <option value="mensual">Monthly</option>
            <option value="semanal">Weekly</option>
            <option value="anual">Annual</option>
        </select>
        <button onClick={() => handleOpenPopup('incomes')}>Filter Incomes Categories</button>
        <button onClick={() => handleOpenPopup('expenses')}>Filter Expenses Categories</button>
      </div>
      {/* Popup de Incomes */}
      {isPopupOpenIncomes && (
        <FilterCategoriesPopup
          categories={filteredCategories}  // Usamos filteredCategories para 'incomes'
          onCancel={handleClosePopup}
          onSave={handleSaveFilters}  // Usamos handleSaveFilters para 'incomes'
          onClear={handleClearFilters}  // Usamos handleClearFilters para 'incomes'
        />
      )}

      {/* Popup de Expenses */}
      {isPopupOpenExpenses && (
        <FilterCategoriesPopup
          categories={filteredCategoriesExpenses}  // Usamos filteredCategoriesExpenses para 'expenses'
          onCancel={handleClosePopup}
          onSave={handleSaveExpenseFilters}  // Usamos handleSaveExpenseFilters para 'expenses'
          onClear={handleClearExpenseFilters}  // Usamos handleClearExpenseFilters para 'expenses'
        />
      )}
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
            <Pie data={view === 'quincenas' ? chartDataCategories.quincenas : view === 'mensual' ? chartDataCategories.mensual : view === 'semanal' ? chartDataCategories.semanal : view === 'anual' ? chartDataCategories.anual : chartDataCategories.daily} options={pieOptions}/>
          </div>
        )}
        {chartDataCategories1 && (
          <div className="chart">
            <h1>Expenses</h1>
            <Pie data={view === 'quincenas' ? chartDataCategories1.quincenas : view === 'mensual' ? chartDataCategories1.mensual : view === 'semanal' ? chartDataCategories1.semanal : view === 'anual' ? chartDataCategories1.anual : chartDataCategories1.daily} options={pieOptions}/>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Reports;