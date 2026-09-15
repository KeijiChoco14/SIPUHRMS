<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        \Log::info('Profile Update Request Validation:', [
            'hasFile' => $this->hasFile('photo'),
            'file' => $this->file('photo'),
            'error' => $this->file('photo') ? $this->file('photo')->getError() : null,
            'all' => $this->all()
        ]);

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'photo' => [
                $this->user()->profile_photo_path ? 'nullable' : 'required',
                'image',
                'max:2048',
            ],
            'phone_number' => ['nullable', 'string', 'max:20'],
        ];
    }
}
