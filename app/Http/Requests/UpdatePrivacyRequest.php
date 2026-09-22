<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePrivacyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'settings' => ['required', 'array'],
            'settings.*.field_name' => ['required', 'string', 'in:photo,phone,email,dob,occupation,bio'],
            'settings.*.visibility' => ['required', 'string', 'in:public,family,private'],
        ];
    }
}