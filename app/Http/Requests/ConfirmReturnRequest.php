<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class ConfirmReturnRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check() && Auth::user()->can('room.return.approve');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'confirm_physical_receipt' => ['required', 'accepted'],
            'security_notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'confirm_physical_receipt.required' => 'Physical key receipt confirmation is required.',
            'confirm_physical_receipt.accepted' => 'Security officer must confirm that the physical key has been handed over before approving the return.',
            'security_notes.max' => 'Security notes may not exceed 500 characters.',
        ];
    }
}
