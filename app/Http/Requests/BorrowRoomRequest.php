<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class BorrowRoomRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check() && Auth::user()->can('room.borrow');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'expected_duration_hours' => ['required', 'integer', 'min:1', 'max:72'],
            'purpose' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'room_id.required' => 'Please select a room.',
            'room_id.exists' => 'The selected room is invalid or unlisted.',
            'expected_duration_hours.required' => 'Please specify the estimated borrowing duration in hours.',
            'expected_duration_hours.integer' => 'Borrowing duration must be a valid whole number of hours.',
            'expected_duration_hours.min' => 'Borrowing duration must be at least 1 hour.',
            'expected_duration_hours.max' => 'Borrowing duration cannot exceed 72 hours (3 days).',
            'purpose.max' => 'Borrowing purpose may not exceed 500 characters.',
        ];
    }
}
