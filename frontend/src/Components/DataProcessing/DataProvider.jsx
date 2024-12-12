import React, { useState, useEffect } from "react";
import client from "../../apiClient.jsx"; 

const DataProvider = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [profileName, setProfileName] = useState(null);
  const [debts, setDebts] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await client.get("/api/transactions");
        const transactions = response.data;

        setTransactions(transactions);

        // Calcular el balance general
        const incomes = transactions.filter((item) => item.type === "INC");
        const expenses = transactions.filter((item) => item.type === "EXP");
        const totalBalance = calculateBalance(incomes, expenses);
        setBalance(totalBalance);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setErrorMessage("Failed to load transactions. Please try again later.");
      }
    };

    const fetchProfile = async () => {
      try {
        const response = await client.get("/api/profile");
        const profileData = response.data.profile;
        setProfileName(profileData?.name || null); // Solo guarda el nombre si está disponible
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfileName(null);
      }
    };

    const fetchDebts = async () => {
      try {
        const response = await client.get("/api/debts/");
        const debtsData = response.data;
        setDebts(debtsData); // Guarda todas las deudas
      } catch (error) {
        console.error("Error fetching debts:", error);
        setErrorMessage("Failed to load debts. Please try again later.");
      }
    };

    fetchData();
    fetchProfile();
    fetchDebts();
  }, []);

  // Método para calcular el balance general
  const calculateBalance = (incomes, expenses) => {
    const totalIncomes = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    return totalIncomes - totalExpenses;
  };

  // Método para filtrar transacciones del mes actual
  const getCurrentMonthTransactions = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });
  };

  // Método para filtrar por tipo ("INC" o "EXP")
  const filterByType = (transactionsArray, type) => {
    return transactionsArray.filter((transaction) => transaction.type === type);
  };

  // Método para contar elementos y sumar sus montos
  const countAndSum = (transactionsArray) => {
    const count = transactionsArray.length;
    const total = transactionsArray.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
    return { count, total };
  };

  const countAndSumDebts = () => {
    const count = debts.length;
    const total = debts.reduce((sum, debt) => sum + parseFloat(debt.amount), 0);
    return { count, total };
  };

  const groupByWeeks = (items) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
  
    // Calcular las semanas del mes actual
    const weeks = [];
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  
    let startOfWeek = new Date(firstDayOfMonth);
    while (startOfWeek <= lastDayOfMonth) {
      const endOfWeek = new Date(
        Math.min(
          startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000, // Sumar 6 días para completar la semana
          lastDayOfMonth.getTime()
        )
      );
  
      weeks.push({
        start: new Date(startOfWeek.setHours(0, 0, 0, 0)),
        end: new Date(endOfWeek.setHours(23, 59, 59, 999)),
      });
  
      startOfWeek = new Date(endOfWeek.getTime() + 1 * 24 * 60 * 60 * 1000); // Comenzar la siguiente semana
    }
  
    // Inicializar el arreglo de datos por semana
    const dataByWeek = Array(weeks.length).fill(0);
  
    // Agrupar los datos por semanas
    items.forEach((item) => {
      const date = new Date(item.date);
      const normalizedDate = new Date(date.setHours(0, 0, 0, 0));
  
      weeks.forEach((week, i) => {
        if (normalizedDate >= week.start && normalizedDate <= week.end) {
          dataByWeek[i] += parseFloat(item.amount);
        }
      });
    });
  
    // Crear etiquetas para las semanas
    const labels = weeks.map(
      (week) =>
        `${week.start.toLocaleDateString()} - ${week.end.toLocaleDateString()}`
    );
  
    return {
      labels,
      datasets: [
        {
          label: items[0]?.type === "INC" ? "Incomes" : "Expenses",
          data: dataByWeek,
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
  

  return {
    transactions, balance, profileName, debts, getCurrentMonthTransactions, filterByType, countAndSum, countAndSumDebts, groupByWeeks, errorMessage,
  };
};

export default DataProvider;

