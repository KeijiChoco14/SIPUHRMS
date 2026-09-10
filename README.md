# Swiss-Belinn HR Management System (HRMS)

A comprehensive, intuitive, and modern Human Resources Management System designed specifically for hospitality excellence. This platform streamlines task assignments, attendance tracking, payroll, and performance assessments in one unified workspace.

## 🚀 Features

- **Interactive Kanban Boards**: Organize tasks, assign team members, and track progress visually through customizable drag-and-drop boards.
- **Real-time Attendance**: Log clock-ins and clock-outs instantly with location tracking capabilities and automated timesheet generation.
- **Performance Analytics**: Provide structured feedback, conduct supervisor assessments, and generate comprehensive performance reports.
- **Payroll Management**: Manage employee salaries, deductions, bonuses, and automatically generate detailed payslips.
- **Document & Announcement Management**: Securely distribute company policies, updates, and essential documents to all staff.
- **Role-based Access Control**: Secure platform with granular permissions for Super Admins, HRD, General Managers, Supervisors, and Employees.

## 🛠 Tech Stack

- **Backend**: Laravel 11, PHP 8.2+
- **Frontend**: React.js, Inertia.js, Tailwind CSS
- **Database**: MySQL / PostgreSQL
- **Authentication**: Laravel Breeze
- **Authorization**: Spatie Laravel Permission

## ⚙️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/KeijiChoco14/hrms-swissbell.git
   cd hrms-swissbell
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Install frontend dependencies:
   ```bash
   npm install
   ```

4. Configure your `.env` file:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Make sure to configure your database settings in the `.env` file.*

5. Run database migrations and seeders (this will populate roles and default users):
   ```bash
   php artisan migrate --seed
   ```

6. Link the storage directory:
   ```bash
   php artisan storage:link
   ```

7. Start the development servers:
   ```bash
   # Run the Laravel backend
   php artisan serve
   
   # In a separate terminal, run the Vite frontend server
   npm run dev
   ```

## 📄 License

This project is open-sourced software licensed under the [MIT license](LICENSE).
