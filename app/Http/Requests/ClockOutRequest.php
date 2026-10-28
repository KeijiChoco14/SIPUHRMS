<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClockOutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'accuracy' => ['nullable', 'numeric', 'min:0', 'max:5000'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'latitude.required' => 'GPS location coordinates are required.',
            'longitude.required' => 'GPS location coordinates are required.',
            'latitude.between' => 'Invalid latitude coordinate value.',
            'longitude.between' => 'Invalid longitude coordinate value.',
        ];
    }
}
