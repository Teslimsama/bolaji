<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FamilyEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'event_date' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:10000'],
            'location' => ['nullable', 'string', 'max:255'],
            'visibility' => ['nullable', 'string', 'in:public,family'],
        ];
    }
}