<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:10240', 'mimes:jpg,jpeg,png,gif,webp,pdf,mp4,mov'],
            'visibility' => ['nullable', 'string', 'in:public,family,private'],
            'caption' => ['nullable', 'string', 'max:500'],
        ];
    }
}