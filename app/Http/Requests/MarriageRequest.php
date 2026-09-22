<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MarriageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'person_one_id' => ['required', 'integer', 'exists:family_members,id'],
            'person_two_id' => ['required', 'integer', 'exists:family_members,id', 'different:person_one_id'],
            'status' => ['nullable', 'string', 'in:married,divorced,widowed'],
        ];
    }
}