<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LinkMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'parent_id' => ['required', 'integer', 'exists:family_members,id'],
            'child_id' => ['required', 'integer', 'exists:family_members,id', 'different:parent_id'],
            'type' => ['nullable', 'string', 'in:biological,adopted'],
        ];
    }
}