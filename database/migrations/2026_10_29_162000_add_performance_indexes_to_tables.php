<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tasks
        if (Schema::hasTable('tasks')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->index('status', 'tasks_status_idx');
                $table->index('project_id', 'tasks_project_id_idx');
                $table->index('created_by', 'tasks_created_by_idx');
                $table->index('deadline', 'tasks_deadline_idx');
                $table->index('priority', 'tasks_priority_idx');
            });
        }

        // 2. Task Assignees
        if (Schema::hasTable('task_assignees')) {
            Schema::table('task_assignees', function (Blueprint $table) {
                $table->index('employee_id', 'task_assignees_employee_id_idx');
            });
        }

        // 3. Task Details (comments, activities, checklists, attachments)
        if (Schema::hasTable('task_comments')) {
            Schema::table('task_comments', function (Blueprint $table) {
                $table->index('task_id', 'task_comments_task_id_idx');
            });
        }

        if (Schema::hasTable('task_activities')) {
            Schema::table('task_activities', function (Blueprint $table) {
                $table->index('task_id', 'task_activities_task_id_idx');
                $table->index('employee_id', 'task_activities_employee_id_idx');
            });
        }

        if (Schema::hasTable('task_checklists')) {
            Schema::table('task_checklists', function (Blueprint $table) {
                $table->index('task_id', 'task_checklists_task_id_idx');
            });
        }

        if (Schema::hasTable('task_attachments')) {
            Schema::table('task_attachments', function (Blueprint $table) {
                $table->index('task_id', 'task_attachments_task_id_idx');
            });
        }

        // 4. Attendances
        if (Schema::hasTable('attendances')) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->index('date', 'attendances_date_idx');
                $table->index('status', 'attendances_status_idx');
                $table->index('is_late', 'attendances_is_late_idx');
                if (Schema::hasColumn('attendances', 'shift_id')) {
                    $table->index('shift_id', 'attendances_shift_id_idx');
                }
            });
        }

        // 5. Work Schedules
        if (Schema::hasTable('work_schedules')) {
            Schema::table('work_schedules', function (Blueprint $table) {
                $table->index('date', 'work_schedules_date_idx');
                $table->index('shift_id', 'work_schedules_shift_id_idx');
            });
        }

        // 6. Employees
        if (Schema::hasTable('employees')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->index('user_id', 'employees_user_id_idx');
                $table->index('department_id', 'employees_department_id_idx');
                $table->index('position_id', 'employees_position_id_idx');
                $table->index('employment_status', 'employees_employment_status_idx');
                $table->index('supervisor_id', 'employees_supervisor_id_idx');
            });
        }

        // 7. Leave Requests
        if (Schema::hasTable('leave_requests')) {
            Schema::table('leave_requests', function (Blueprint $table) {
                $table->index('employee_id', 'leave_requests_employee_id_idx');
                $table->index('status', 'leave_requests_status_idx');
                $table->index('start_date', 'leave_requests_start_date_idx');
            });
        }

        // 8. Overtime Requests
        if (Schema::hasTable('overtime_requests')) {
            Schema::table('overtime_requests', function (Blueprint $table) {
                $table->index('employee_id', 'overtime_requests_employee_id_idx');
                $table->index('status', 'overtime_requests_status_idx');
                $table->index('date', 'overtime_requests_date_idx');
            });
        }

        // 9. Master Key Requests
        if (Schema::hasTable('master_key_requests')) {
            Schema::table('master_key_requests', function (Blueprint $table) {
                $table->index('status', 'master_key_requests_status_idx');
                $table->index('employee_id', 'master_key_requests_employee_id_idx');
                $table->index('valid_until', 'master_key_requests_valid_until_idx');
            });
        }

        // 10. Power Pro Requests
        if (Schema::hasTable('power_pro_requests')) {
            Schema::table('power_pro_requests', function (Blueprint $table) {
                $table->index('status', 'power_pro_requests_status_idx');
                $table->index('employee_id', 'power_pro_requests_employee_id_idx');
                $table->index('department_id', 'power_pro_requests_department_id_idx');
                $table->index('requested_by_user_id', 'power_pro_requests_requested_by_idx');
            });
        }

        // 11. IT Tickets & Updates & Assets
        if (Schema::hasTable('it_tickets')) {
            Schema::table('it_tickets', function (Blueprint $table) {
                $table->index('status', 'it_tickets_status_idx');
                $table->index('reported_by_employee_id', 'it_tickets_reported_by_idx');
                $table->index('priority', 'it_tickets_priority_idx');
                $table->index('created_at', 'it_tickets_created_at_idx');
            });
        }

        if (Schema::hasTable('it_ticket_updates')) {
            Schema::table('it_ticket_updates', function (Blueprint $table) {
                $table->index('it_ticket_id', 'it_ticket_updates_ticket_id_idx');
            });
        }

        if (Schema::hasTable('it_assets')) {
            Schema::table('it_assets', function (Blueprint $table) {
                $table->index('status', 'it_assets_status_idx');
                $table->index('category', 'it_assets_category_idx');
                $table->index('assigned_to_employee_id', 'it_assets_assigned_emp_idx');
            });
        }

        // 12. Audit Logs
        if (Schema::hasTable('audit_logs')) {
            Schema::table('audit_logs', function (Blueprint $table) {
                $table->index('created_at', 'audit_logs_created_at_idx');
                $table->index('action', 'audit_logs_action_idx');
                $table->index('user_id', 'audit_logs_user_id_idx');
            });
        }

        // 13. Payroll Items & Periods
        if (Schema::hasTable('payroll_items')) {
            Schema::table('payroll_items', function (Blueprint $table) {
                $table->index('payroll_id', 'payroll_items_payroll_id_idx');
            });
        }

        if (Schema::hasTable('payrolls')) {
            Schema::table('payrolls', function (Blueprint $table) {
                $table->index('payroll_period_id', 'payrolls_period_id_idx');
            });
        }

        // 14. Announcements
        if (Schema::hasTable('announcements')) {
            Schema::table('announcements', function (Blueprint $table) {
                $table->index('published_at', 'announcements_published_at_idx');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('tasks')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->dropIndex('tasks_status_idx');
                $table->dropIndex('tasks_project_id_idx');
                $table->dropIndex('tasks_created_by_idx');
                $table->dropIndex('tasks_deadline_idx');
                $table->dropIndex('tasks_priority_idx');
            });
        }

        if (Schema::hasTable('task_assignees')) {
            Schema::table('task_assignees', function (Blueprint $table) {
                $table->dropIndex('task_assignees_employee_id_idx');
            });
        }

        if (Schema::hasTable('task_comments')) {
            Schema::table('task_comments', function (Blueprint $table) {
                $table->dropIndex('task_comments_task_id_idx');
            });
        }

        if (Schema::hasTable('task_activities')) {
            Schema::table('task_activities', function (Blueprint $table) {
                $table->dropIndex('task_activities_task_id_idx');
                $table->dropIndex('task_activities_employee_id_idx');
            });
        }

        if (Schema::hasTable('task_checklists')) {
            Schema::table('task_checklists', function (Blueprint $table) {
                $table->dropIndex('task_checklists_task_id_idx');
            });
        }

        if (Schema::hasTable('task_attachments')) {
            Schema::table('task_attachments', function (Blueprint $table) {
                $table->dropIndex('task_attachments_task_id_idx');
            });
        }

        if (Schema::hasTable('attendances')) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->dropIndex('attendances_date_idx');
                $table->dropIndex('attendances_status_idx');
                $table->dropIndex('attendances_is_late_idx');
                if (Schema::hasColumn('attendances', 'shift_id')) {
                    $table->dropIndex('attendances_shift_id_idx');
                }
            });
        }

        if (Schema::hasTable('work_schedules')) {
            Schema::table('work_schedules', function (Blueprint $table) {
                $table->dropIndex('work_schedules_date_idx');
                $table->dropIndex('work_schedules_shift_id_idx');
            });
        }

        if (Schema::hasTable('employees')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->dropIndex('employees_user_id_idx');
                $table->dropIndex('employees_department_id_idx');
                $table->dropIndex('employees_position_id_idx');
                $table->dropIndex('employees_employment_status_idx');
                $table->dropIndex('employees_supervisor_id_idx');
            });
        }

        if (Schema::hasTable('leave_requests')) {
            Schema::table('leave_requests', function (Blueprint $table) {
                $table->dropIndex('leave_requests_employee_id_idx');
                $table->dropIndex('leave_requests_status_idx');
                $table->dropIndex('leave_requests_start_date_idx');
            });
        }

        if (Schema::hasTable('overtime_requests')) {
            Schema::table('overtime_requests', function (Blueprint $table) {
                $table->dropIndex('overtime_requests_employee_id_idx');
                $table->dropIndex('overtime_requests_status_idx');
                $table->dropIndex('overtime_requests_date_idx');
            });
        }

        if (Schema::hasTable('master_key_requests')) {
            Schema::table('master_key_requests', function (Blueprint $table) {
                $table->dropIndex('master_key_requests_status_idx');
                $table->dropIndex('master_key_requests_employee_id_idx');
                $table->dropIndex('master_key_requests_valid_until_idx');
            });
        }

        if (Schema::hasTable('power_pro_requests')) {
            Schema::table('power_pro_requests', function (Blueprint $table) {
                $table->dropIndex('power_pro_requests_status_idx');
                $table->dropIndex('power_pro_requests_employee_id_idx');
                $table->dropIndex('power_pro_requests_department_id_idx');
                $table->dropIndex('power_pro_requests_requested_by_idx');
            });
        }

        if (Schema::hasTable('it_tickets')) {
            Schema::table('it_tickets', function (Blueprint $table) {
                $table->dropIndex('it_tickets_status_idx');
                $table->dropIndex('it_tickets_reported_by_idx');
                $table->dropIndex('it_tickets_priority_idx');
                $table->dropIndex('it_tickets_created_at_idx');
            });
        }

        if (Schema::hasTable('it_ticket_updates')) {
            Schema::table('it_ticket_updates', function (Blueprint $table) {
                $table->dropIndex('it_ticket_updates_ticket_id_idx');
            });
        }

        if (Schema::hasTable('it_assets')) {
            Schema::table('it_assets', function (Blueprint $table) {
                $table->dropIndex('it_assets_status_idx');
                $table->dropIndex('it_assets_category_idx');
                $table->dropIndex('it_assets_assigned_emp_idx');
            });
        }

        if (Schema::hasTable('audit_logs')) {
            Schema::table('audit_logs', function (Blueprint $table) {
                $table->dropIndex('audit_logs_created_at_idx');
                $table->dropIndex('audit_logs_action_idx');
                $table->dropIndex('audit_logs_user_id_idx');
            });
        }

        if (Schema::hasTable('payroll_items')) {
            Schema::table('payroll_items', function (Blueprint $table) {
                $table->dropIndex('payroll_items_payroll_id_idx');
            });
        }

        if (Schema::hasTable('payrolls')) {
            Schema::table('payrolls', function (Blueprint $table) {
                $table->dropIndex('payrolls_period_id_idx');
            });
        }

        if (Schema::hasTable('announcements')) {
            Schema::table('announcements', function (Blueprint $table) {
                $table->dropIndex('announcements_published_at_idx');
            });
        }
    }
};
