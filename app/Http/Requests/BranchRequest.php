<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120', 'regex:/^[a-z0-9\-]+$/i'],
            'description' => ['nullable', 'string', 'max:2000'],
            'parent_branch_id' => ['nullable', 'integer', 'exists:family_branches,id'],
        ];
    }
}