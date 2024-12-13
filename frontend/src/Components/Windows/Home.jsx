// Home.jsx
import React, { useEffect } from 'react';
import Navbar from '../NavBar/Navbar';
import DataProvider from "../DataProcessing/DataProvider.jsx";
import { Line } from 'react-chartjs-2';

import styles from './Home.module.css';

const Home = ({ handleLogout }) => {
    const { balance,profileName, getCurrentMonthTransactions, filterByType, countAndSum, countAndSumDebts, groupByWeeks, errorMessage } = DataProvider();

    useEffect(() => {
        document.title = "Home - Buddy Budget";
    }, []);
    
    // Obtener transacciones del mes actual
    const currentMonthTransactions = getCurrentMonthTransactions();

    // Filtrar ingresos y gastos
    const incomes = filterByType(currentMonthTransactions, "INC");
    const expenses = filterByType(currentMonthTransactions, "EXP");

    // Contar y sumar ingresos
    const { count: incomeCount, total: incomeTotal } = countAndSum(incomes);

    // Contar y sumar gastos
    const { count: expenseCount, total: expenseTotal } = countAndSum(expenses);

    const { count: debtCount, total: debtTotal } = countAndSumDebts();

    const chartDataIncomes = groupByWeeks(incomes);
    const chartDataExpenses = groupByWeeks(expenses);

    return (
        <div className={styles.home}>
            <Navbar handleLogout={handleLogout} />
            {profileName && <h2>Welcome, {profileName}!</h2>}
            <h2>Financial Summary of the Current Month</h2>
            <div className={styles.cardsContainer}>
                <div className={styles.card}>
                    <h3>Balance </h3>
                    <p>${balance.toFixed(2)}</p>
                </div>
                <div className={styles.card}>
                    <h3>Incomes</h3>
                    <p>Total: ${incomeTotal.toFixed(2)}</p>
                    <p>Transactions: {incomeCount}</p>
                </div>
                <div className={styles.card}>
                    <h3>Expenses</h3>
                    <p>Total: ${expenseTotal.toFixed(2)}</p>
                    <p>Transactions: {expenseCount}</p>
                </div>
                <div className={styles.card}>
                    <h3>Debts</h3>
                    <p>Total: ${debtTotal.toFixed(2)}</p>
                    <p>Debts: {debtCount}</p>
                </div>
            </div>
            <div className={styles['charts-container']}>
                <div className={styles['chart-card']}>
                    <h3>Incomes</h3>
                    <Line data={chartDataIncomes} />
                </div>
                <div className={styles['chart-card']}>
                    <h3>Expenses</h3>
                    <Line data={chartDataExpenses} />
                </div>
            </div>
            {errorMessage && <p className="error">{errorMessage}</p>}
        </div>
    );
};

export default Home;
