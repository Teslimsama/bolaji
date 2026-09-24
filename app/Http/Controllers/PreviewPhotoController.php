<?php

namespace App\Http\Controllers;

// Public demo preview for member profile photos on the private disk.

use App\Models\FamilyMember;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class PreviewPhotoController extends Controller
{
    public function show(FamilyMember $member): Response
    {
        if ($member->photo_path) {
            $disk = Storage::disk('private');
            if ($disk->exists($member->photo_path)) {
                $mime = $disk->mimeType($member->photo_path);

                return response($disk->get($member->photo_path), 200, [
                    'Content-Type' => $mime ?: 'image/png',
                    'Cache-Control' => 'public, max-age=3600',
                ]);
            }
        }

        $initial = strtoupper(substr($member->first_name, 0, 1));
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">'
            .'<rect width="200" height="200" fill="#EDE3D0"/>'
            .'<rect x="6" y="6" width="188" height="188" fill="none" stroke="#263A5C" stroke-width="2"/>'
            .'<text x="100" y="134" font-family="Georgia, serif" font-size="104" fill="#A9812F" text-anchor="middle">'.$initial.'</text>'
            .'</svg>';

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}