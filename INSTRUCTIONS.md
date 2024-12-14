# BuddyBudget Instructions

BuddyBudget is a financial management application that enables users to track transactions, debts, accounts, and generate detailed reports. This document provides instructions for using the application effectively and managing users for both regular users and superusers.

---

## Prerequisites

- Ensure **Docker** and **Docker Compose** are installed.
- Clone the repository to your local machine:
  ```bash
  git clone https://github.com/WendySC25/BuddyBudget.git
  cd BuddyBudget
  ```

- Build and start the application using Docker Compose:
  ```bash
  docker-compose build
  docker-compose up
  ```

- Once the containers are running, access the application frontend via:
  [http://localhost:3000](http://localhost:3000)

To shut down the application and free resources:
```bash
docker-compose down
```

---

## Registration and Authentication

### Important Notes
- Use **real email addresses** to ensure proper registration.
- After registering, you must verify your account via the verification email (check the spam folder if necessary). You cannot log in without verification.

### Creating a Superuser
Run the following commands in the terminal at BuddyBudget location:
```bash
  docker exec -it django-backend_0-0-1 /bin/bash
  python3 manage.py createsuperuser
```
This will prompt fields to fill in the superuser details (username, email, password).

### Registering as a Normal User
- Fill out the registration form on the login page.
- Verify your email using the provided link and wait up to 2 minutes before logging in.

---

## Regular User Instructions

### Transactions Management
- **Add Transaction**: Use the "Add Transaction" button on the Transactions page.
- **Add Categorie**: Create categories first by clicking "Add Category" before assigning them to transactions.
- **Add Account**: Use the "Add Account" button for create accounts.
- **Edit/Delete Transactions**: Manage individual transactions in the table provided.
- **Search Transactions**: Use the search bar to find specific transactions by description.
- **Download PDFs**: Click on "PDF" to manually download transaction summaries.

### Debts Management
- **Add Debt**: Use the "Add Debt" button on the Debts page.
- **Edit/Delete Debts**: Manage debts via the buttons on the debts table.

### Profile Management
- **Add/Edit Profile Details**: Update your profile information on the Profile page (optional). The provided name will appear in the homepage greeting.

### Configuration Page
- Update or view configurations such as password, email, and username.
- Adjust settings for PDF generation and user-related configurations.

### Categories Page
- Edit or delete created categories using their respective buttons.

### Accounts Page
- Edit or delete account details.

### Reports Page
- View and filter graphical reports based on:
  - Chart type
  - Timeframe
  - Specific incomes or expenses.

---

## Superuser Instructions

### Overview
Superusers can perform all regular user actions but across all registered users in the system.

### User Management
- **View Users**: **Search** and view all users.
- **Edit User Information**: Update usernames and email addresses.
- **Delete Users**: Remove user accounts.

### Transactions Management
- **View All Transactions**: Access all transactions with user IDs.
- **Edit Transactions**: Modify any user’s transactions.
- **Add New Transactions**: Add transactions, categories, or accounts for any user.
- **Download PDFs**: Export PDF summaries for all users, selecting the desired time range.

### Categories Management
- View, edit, and delete categories across all users.

### Accounts Management
- View, edit, and delete accounts for all users.

### Debts Management
- **View All Debts**: Display all debts with user IDs.
- **Edit/Delete Debts**: Manage debts for any user.
- **Add New Debts**: Create debts for specified users.

---

## Additional Notes
For frontend development or debugging outside of Docker:
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   npm start
   ```
2. Open the application at [http://localhost:3000](http://localhost:3000).

For backend development:
- Django provides the APIs that power the frontend, ensuring real-time synchronization and data integrity.

---

For further guidance:
- **[React Documentation](https://reactjs.org/docs/getting-started.html)**
- **[Django Documentation](https://docs.djangoproject.com/)**
- **[Docker Compose Guide](https://docs.docker.com/compose/)**
