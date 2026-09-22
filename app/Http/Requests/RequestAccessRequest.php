<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RequestAccessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:120'],
            'last_name' => ['required', 'string', 'max:120'],
            'gender' => ['required', 'string', 'in:male,female,other'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:32'],
            'family_branch_id' => ['nullable', 'integer', 'exists:family_branches,id'],
            'claimed_relationship_type' => ['required', 'string', 'max:120'],
            'claimed_related_to_id' => ['nullable', 'integer', 'exists:family_members,id'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}