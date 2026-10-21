<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check() && Auth::user()->can('room.manage');
    }

    public function rules(): array
    {
        $roomId = $this->route('room')?->id ?? $this->input('id');

        return [
            'room_number' => ['required', 'string', 'max:50', Rule::unique('rooms', 'room_number')->ignore($roomId)],
            'name' => ['required', 'string', 'max:150'],
            'location' => ['nullable', 'string', 'max:150'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'description' => ['nullable', 'string', 'max:1000'],
            'key_code' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'room_number.required' => 'Room number / code is required.',
            'room_number.unique' => 'This room number / code is already registered.',
            'name.required' => 'Room name is required.',
        ];
    }
}
