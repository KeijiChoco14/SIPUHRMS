<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CorrectAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager']) ?? false;
    }

    public function rules(): array
    {
        return [
            'clock_in' => ['nullable', 'date_format:H:i'],
            'clock_out' => ['nullable', 'date_format:H:i'],
            'status' => ['required', 'string', 'in:Present,Late,Absent,Leave,Off'],
            'late_duration_minutes' => ['nullable', 'integer', 'min:0', 'max:1440'],
            'overtime_minutes' => ['nullable', 'integer', 'min:0', 'max:1440'],
            'correction_reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'correction_reason.required' => 'A mandatory reason is required for manual attendance correction.',
            'correction_reason.min' => 'Please provide a clear correction reason (at least 5 characters).',
        ];
    }
}
