<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFamilyMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['sometimes', 'string', 'max:120'],
            'last_name' => ['sometimes', 'string', 'max:120'],
            'gender' => ['sometimes', 'string', 'in:male,female,other'],
            'phone' => ['nullable', 'string', 'max:32'],
            'email' => ['nullable', 'email', 'max:255'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:4000'],
        ];
    }
}