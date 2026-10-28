<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAttendanceLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager']) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'radius_meters' => ['required', 'integer', 'min:5', 'max:5000'],
            'min_accuracy_meters' => ['required', 'integer', 'min:10', 'max:2000'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'radius_meters.min' => 'Radius must be at least 5 meters.',
            'radius_meters.max' => 'Radius cannot exceed 5000 meters.',
            'min_accuracy_meters.min' => 'Minimum GPS accuracy threshold must be at least 10 meters.',
        ];
    }
}
