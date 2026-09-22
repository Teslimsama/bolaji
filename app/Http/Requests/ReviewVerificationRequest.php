<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:approved,rejected,more_info'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'parent_id' => ['nullable', 'integer', 'exists:family_members,id'],
            'mother_id' => ['nullable', 'integer', 'exists:family_members,id'],
            'relationship_type' => ['nullable', 'string', 'in:biological,adopted'],
        ];
    }
}