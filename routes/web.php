<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DirectoryController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\PerformanceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskAttachmentController;
use App\Http\Controllers\TaskChecklistController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\TaskController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('projects', ProjectController::class);
    Route::get('/tasks/kanban', [TaskController::class, 'kanban'])->name('tasks.kanban');
    Route::resource('tasks', TaskController::class);

    // Collaboration Routes
    Route::post('/tasks/{task}/comments', [TaskCommentController::class, 'store'])->name('tasks.comments.store');
    Route::delete('/comments/{comment}', [TaskCommentController::class, 'destroy'])->name('tasks.comments.destroy');

    Route::post('/tasks/{task}/attachments', [TaskAttachmentController::class, 'store'])->name('tasks.attachments.store');
    Route::delete('/attachments/{attachment}', [TaskAttachmentController::class, 'destroy'])->name('tasks.attachments.destroy');

    Route::post('/tasks/{task}/checklists', [TaskChecklistController::class, 'store'])->name('tasks.checklists.store');
    Route::put('/checklists/{checklist}', [TaskChecklistController::class, 'update'])->name('tasks.checklists.update');
    Route::delete('/checklists/{checklist}', [TaskChecklistController::class, 'destroy'])->name('tasks.checklists.destroy');

    Route::post('/tasks/{task}/acknowledge', [TaskController::class, 'acknowledge'])->name('tasks.acknowledge');

    // Performance Routes
    Route::middleware(['role:Super Admin|HRD / Admin|General Manager'])->group(function () {
        Route::get('/performance', [PerformanceController::class, 'index'])->name('performance.index');
        Route::post('/performance/calculate', [PerformanceController::class, 'calculate'])->name('performance.calculate');
    });
    Route::get('/performance/{employee}/{period}', [PerformanceController::class, 'show'])->name('performance.show');
    Route::get('/performance/{employee}/{period}/assess', [PerformanceController::class, 'assess'])->name('performance.assess');
    Route::post('/performance/{employee}/{period}/assess', [PerformanceController::class, 'storeAssessment'])->name('performance.storeAssessment');

    // Attendance Routes
    Route::get('/my-attendance', [AttendanceController::class, 'myAttendance'])->name('attendance.my');
    Route::middleware(['role:Super Admin|HRD / Admin|General Manager'])->group(function () {
        Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    });

    // Payroll Routes
    Route::get('/my-payslips', [PayrollController::class, 'myPayslips'])->name('payroll.my');
    Route::get('/payroll/{id}/payslip', [PayrollController::class, 'showPayslip'])->name('payroll.show');
    Route::middleware(['role:Super Admin|HRD / Admin|General Manager'])->group(function () {
        Route::get('/payroll', [PayrollController::class, 'index'])->name('payroll.index');
        Route::post('/payroll/generate', [PayrollController::class, 'generate'])->name('payroll.generate');
    });

    // Announcement Routes
    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::middleware(['role:Super Admin|HRD / Admin|General Manager'])->group(function () {
        Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
    });

    // Document Routes
    Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::get('/documents/{id}/download', [DocumentController::class, 'download'])->name('documents.download');
    Route::middleware(['role:Super Admin|HRD / Admin|General Manager'])->group(function () {
        Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
    });

    // Directory Routes
    Route::get('/directory', [DirectoryController::class, 'index'])->name('directory.index');

    // Administration & Organization Routes
    Route::middleware(['role:Super Admin|HRD / Admin|General Manager'])->group(function () {
        Route::resource('departments', DepartmentController::class)->except(['create', 'edit', 'show']);
        Route::resource('employees', EmployeeController::class)->except(['show']);
        Route::get('/roles', function () {
            return Inertia::render('Administration/Roles', [
                'roles' => Role::with('permissions')->get(),
            ]);
        })->name('roles.index');
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
        Route::get('/settings', function () {
            return Inertia::render('Administration/Settings');
        })->name('settings.index');
    });
});

// API Sync for Attendance
Route::post('/api/attendance/sync', [AttendanceController::class, 'sync']);

require __DIR__.'/auth.php';
