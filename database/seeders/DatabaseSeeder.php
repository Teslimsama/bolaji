<?php

namespace Database\Seeders;

// Seed the demo Bolaji registry: branches, members, photos, links, requests.

use App\Models\FamilyBranch;
use App\Models\FamilyMember;
use App\Models\FamilyRelationship;
use App\Models\Marriage;
use App\Models\PrivacySetting;
use App\Models\User;
use App\Models\VerificationRequest;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        if (FamilyBranch::query()->exists()) {
            return;
        }

        $branchModels = [];
        $branches = [
            ['Ijesha Branch', 'ijesha', 'The founding home branch of the Bolaji family in Ibadan.', null],
            ['Ebute Metta', 'ebute-metta', 'The Lagos waterside arm of the family lineage.', 'ijesha'],
            ['Oke-Ona', 'oke-ona', 'The Abeokuta branch known for its scholars and traders.', null],
            ['Ibadan House', 'ibadan-house', 'The established Ibadan household built by the second generation.', null],
            ['Lagos Town', 'lagos-town', 'The Lagos town branch of clerks and modern professionals.', 'ijesha'],
            ['Ilesa Quarter', 'ilesa-quarter', 'A distant quarter branch awaiting full lineage confirmation.', null],
        ];
        foreach ($branches as [$name, $slug, $description, $parent]) {
            $branchModels[$slug] = FamilyBranch::create([
                'name' => $name,
                'slug' => $slug,
                'description' => $description,
                'parent_branch_id' => $parent ? $branchModels[$parent]->id : null,
            ]);
        }

        $users = [
            'u_admin' => User::create(['name' => 'Bamidele Bolaji', 'email' => 'admin@bolaji.test', 'password' => Hash::make('password'), 'role' => User::ROLE_ADMIN, 'status' => 'active']),
            'u_elder' => User::create(['name' => 'Chief Adeleke Bolaji', 'email' => 'elder@bolaji.test', 'password' => Hash::make('password'), 'role' => User::ROLE_ELDER, 'status' => 'active']),
            'u_m1' => User::create(['name' => 'Kolawole Bolaji', 'email' => 'member1@bolaji.test', 'password' => Hash::make('password'), 'role' => User::ROLE_MEMBER, 'status' => 'active']),
            'u_m2' => User::create(['name' => 'Adesuwa Bolaji', 'email' => 'member2@bolaji.test', 'password' => Hash::make('password'), 'role' => User::ROLE_MEMBER, 'status' => 'active']),
            'u_m3' => User::create(['name' => 'Tolani Bolaji', 'email' => 'member3@bolaji.test', 'password' => Hash::make('password'), 'role' => User::ROLE_MEMBER, 'status' => 'active']),
            'u_m4' => User::create(['name' => 'Fiyinfoluwa Bolaji', 'email' => 'member4@bolaji.test', 'password' => Hash::make('password'), 'role' => User::ROLE_MEMBER, 'status' => 'active']),
        ];
        $admin = $users['u_admin'];

        $specs = [
            'adeleke' => ['Adeleke', 'Bolaji', FamilyMember::GENDER_MALE, '1934-03-12', 'ijesha', 'Retired chief inspector of schools', 'Founding elder of the Ijesha line and keeper of the family records.', FamilyMember::STATUS_VERIFIED, 'u_elder'],
            'abike' => ['Abike', 'Bolaji', FamilyMember::GENDER_FEMALE, '1938-11-02', 'ijesha', 'Market trader and homemaker', 'Matriarch of the founding generation and pillar of the Ijesha home.', FamilyMember::STATUS_VERIFIED, null],
            'bamidele' => ['Bamidele', 'Bolaji', FamilyMember::GENDER_MALE, '1958-05-20', 'ijesha', 'Retired civil engineer', 'Eldest son who steered the family through the Ibadan years.', FamilyMember::STATUS_VERIFIED, 'u_admin'],
            'funmilayo' => ['Funmilayo', 'Bolaji', FamilyMember::GENDER_FEMALE, '1961-07-08', 'ebute-metta', 'Retired school teacher', 'Daughter of the house and the memory of the Ebute Metta line.', FamilyMember::STATUS_VERIFIED, null],
            'kolawole' => ['Kolawole', 'Bolaji', FamilyMember::GENDER_MALE, '1964-02-14', 'ibadan-house', 'Pharmacist and community leader', 'Son who built the Ibadan House branch of the family.', FamilyMember::STATUS_VERIFIED, 'u_m1'],
            'yemisi' => ['Yemisi', 'Bolaji', FamilyMember::GENDER_FEMALE, '1960-09-30', 'ibadan-house', 'Retired banker', 'Wife of Bamidele and steady hand of the Ibadan household.', FamilyMember::STATUS_VERIFIED, null],
            'segun' => ['Segun', 'Bolaji', FamilyMember::GENDER_MALE, '1959-01-19', 'lagos-town', 'Grocer and church warden', 'Husband of Funmilayo and quiet anchor of the Lagos Town house.', FamilyMember::STATUS_VERIFIED, null],
            'ronke' => ['Ronke', 'Bolaji', FamilyMember::GENDER_FEMALE, '1966-04-25', 'ibadan-house', 'Retired nurse', 'Wife of Kolawole and matron of the Ibadan House compound.', FamilyMember::STATUS_VERIFIED, null],
            'ilerioluwa' => ['Ilerioluwa', 'Bolaji', FamilyMember::GENDER_FEMALE, '1967-12-03', 'oke-ona', 'University lecturer', 'Cadet daughter who carried the family name to Abeokuta.', FamilyMember::STATUS_VERIFIED, null],
            'adesuwa' => ['Adesuwa', 'Bolaji', FamilyMember::GENDER_FEMALE, '1983-06-15', 'ibadan-house', 'Architect', 'First child of the Ibadan house and principal draughtswoman of the family.', FamilyMember::STATUS_VERIFIED, 'u_m2'],
            'damilare' => ['Damilare', 'Bolaji', FamilyMember::GENDER_MALE, '1985-10-01', 'ibadan-house', 'Sales engineer', 'Second child of the Ibadan house and voice of its younger line.', FamilyMember::STATUS_VERIFIED, null],
            'tolani' => ['Tolani', 'Bolaji', FamilyMember::GENDER_MALE, '1987-04-22', 'lagos-town', 'Software developer', 'Son of the Lagos Town house who keeps the family records online.', FamilyMember::STATUS_VERIFIED, 'u_m3'],
            'morayo' => ['Morayo', 'Bolaji', FamilyMember::GENDER_FEMALE, '1990-08-17', 'lagos-town', 'Legal researcher', 'Daughter of the Lagos Town house and considered counsel to the family.', FamilyMember::STATUS_VERIFIED, null],
            'ifeoluwa' => ['Ifeoluwa', 'Bolaji', FamilyMember::GENDER_MALE, '1992-01-09', 'ibadan-house', 'Medical intern', 'Young physician of the Ibadan house and carer of its elders.', FamilyMember::STATUS_VERIFIED, null],
            'aramide' => ['Aramide', 'Bolaji', FamilyMember::GENDER_FEMALE, '1994-05-30', 'ibadan-house', 'Graphic designer', 'Daughter of the Ibadan house who draws the family crest.', FamilyMember::STATUS_VERIFIED, null],
            'farida' => ['Farida', 'Bolaji', FamilyMember::GENDER_FEMALE, '1996-03-27', 'ibadan-house', 'Public health officer', 'Youngest daughter of the Ibadan house and its public health advocate.', FamilyMember::STATUS_VERIFIED, null],
            'boluwatife' => ['Boluwatife', 'Bolaji', FamilyMember::GENDER_MALE, '1993-11-11', 'oke-ona', 'Electrical engineer', 'Son of the Oke-Ona line and light of the Abeokuta branch.', FamilyMember::STATUS_VERIFIED, null],
            'bisola' => ['Bisola', 'Bolaji', FamilyMember::GENDER_FEMALE, '1998-07-06', 'oke-ona', 'Nutritionist', 'Wife of Boluwatife and wellness keeper of the Oke-Ona home.', FamilyMember::STATUS_VERIFIED, null],
            'fiyinfoluwa' => ['Fiyinfoluwa', 'Bolaji', FamilyMember::GENDER_FEMALE, '2015-09-08', 'ibadan-house', 'Student', 'Fourth generation scholar of the Ibadan house and pride of its schools.', FamilyMember::STATUS_VERIFIED, 'u_m4'],
            'tomiwa' => ['Tomiwa', 'Bolaji', FamilyMember::GENDER_MALE, '2018-02-21', 'lagos-town', 'Student', 'Young son of the Lagos Town house and newest heir of its name.', FamilyMember::STATUS_PENDING, null],
            'tolu' => ['Tolu', 'Bolaji', FamilyMember::GENDER_FEMALE, '1996-09-14', 'oke-ona', 'Pharmacist', 'Wife of Ifeoluwa and devoted mother in the Oke-Ona home.', FamilyMember::STATUS_VERIFIED, null],
            'demilade' => ['Demilade', 'Bolaji', FamilyMember::GENDER_FEMALE, '2020-06-12', 'oke-ona', null, 'Adopted daughter of the Oke-Ona house and joy of its evenings.', FamilyMember::STATUS_PENDING, null],
            'abisola' => ['Abisola', 'Bolaji', FamilyMember::GENDER_FEMALE, '2022-01-05', 'oke-ona', null, 'Little flower of the Oke-Ona branch and hope of the fourth generation.', FamilyMember::STATUS_VERIFIED, null],
            'simisola' => ['Simisola', 'Bolaji', FamilyMember::GENDER_FEMALE, '2001-04-16', 'ilesa-quarter', 'Fashion designer', 'Designer of the Ilesa Quarter whose line remains to be confirmed.', FamilyMember::STATUS_PENDING, null],
        ];

        $members = [];
        $serial = 1;
        foreach ($specs as $key => [$first, $last, $gender, $dob, $branch, $occupation, $bio, $status, $userKey]) {
            $user = $userKey ? ($users[$userKey] ?? null) : null;
            $isVerified = $status === FamilyMember::STATUS_VERIFIED;
            $members[$key] = FamilyMember::create([
                'user_id' => $user?->id,
                'first_name' => $first,
                'last_name' => $last,
                'gender' => $gender,
                'family_branch_id' => $branchModels[$branch]->id,
                'occupation' => $occupation,
                'bio' => $bio,
                'phone' => '+234 80'.str_pad((string) $serial, 8, '0', STR_PAD_LEFT),
                'email' => $user ? $user->email : strtolower($first).'@bolaji.test',
                'dob' => $dob,
                'status' => $status,
                'created_by' => $admin->id,
                'verified_by' => $isVerified ? $admin->id : null,
                'verified_at' => $isVerified ? now()->subDays(61 - $serial) : null,
            ]);
            $serial++;
        }

        $links = [
            ['adeleke', 'bamidele', 'biological'], ['abike', 'bamidele', 'biological'],
            ['adeleke', 'funmilayo', 'biological'], ['abike', 'funmilayo', 'biological'],
            ['adeleke', 'kolawole', 'biological'], ['abike', 'kolawole', 'biological'],
            ['adeleke', 'ilerioluwa', 'biological'], ['abike', 'ilerioluwa', 'biological'],
            ['bamidele', 'adesuwa', 'biological'], ['yemisi', 'adesuwa', 'biological'],
            ['bamidele', 'damilare', 'biological'], ['yemisi', 'damilare', 'biological'],
            ['funmilayo', 'tolani', 'biological'], ['segun', 'tolani', 'biological'],
            ['funmilayo', 'morayo', 'biological'], ['segun', 'morayo', 'biological'],
            ['kolawole', 'ifeoluwa', 'biological'], ['ronke', 'ifeoluwa', 'biological'],
            ['kolawole', 'aramide', 'biological'], ['ronke', 'aramide', 'biological'],
            ['kolawole', 'farida', 'biological'], ['ronke', 'farida', 'biological'],
            ['ilerioluwa', 'boluwatife', 'biological'],
            ['adesuwa', 'fiyinfoluwa', 'biological'],
            ['damilare', 'tomiwa', 'biological'], ['morayo', 'tomiwa', 'biological'],
            ['ifeoluwa', 'demilade', 'adopted'], ['tolu', 'demilade', 'adopted'],
            ['boluwatife', 'abisola', 'biological'], ['bisola', 'abisola', 'biological'],
        ];
        foreach ($links as [$parent, $child, $type]) {
            FamilyRelationship::create([
                'parent_id' => $members[$parent]->id,
                'child_id' => $members[$child]->id,
                'type' => $type,
                'status' => 'active',
            ]);
        }

        $marriages = [
            ['adeleke', 'abike', 'married'],
            ['bamidele', 'yemisi', 'married'],
            ['funmilayo', 'segun', 'married'],
            ['kolawole', 'ronke', 'married'],
            ['damilare', 'morayo', 'married'],
            ['ifeoluwa', 'tolu', 'widowed'],
            ['boluwatife', 'bisola', 'married'],
        ];
        foreach ($marriages as [$one, $two, $status]) {
            Marriage::create([
                'person_one_id' => $members[$one]->id,
                'person_two_id' => $members[$two]->id,
                'status' => $status,
                'verified_by' => $admin->id,
                'verified_at' => now()->subDays(40),
            ]);
        }

        $requests = [
            ['simisola', 'grandchild', 'adeleke', VerificationRequest::STATUS_PENDING, null, 'I am the granddaughter of Chief Adeleke Bolaji through the Ilesa Quarter line.', 8, 'u_m3'],
            ['tomiwa', 'mother', 'morayo', VerificationRequest::STATUS_PENDING, null, 'Applied on behalf of Tomiwa, son of Morayo, in the Lagos Town house.', 6, 'u_m2'],
            ['abisola', 'grandchild', 'kolawole', VerificationRequest::STATUS_PENDING, null, 'Abisola is the youngest grandchild of the Ibadan house branch.', 3, 'u_m4'],
            ['aramide', 'other', null, VerificationRequest::STATUS_MORE_INFO, 'u_admin', 'Requires stronger evidence for the claimed link to the Oke-Ona records.', 2, 'u_m1'],
            ['demilade', 'mother', 'tolu', VerificationRequest::STATUS_APPROVED, 'u_admin', 'Adoption into the Oke-Ona house has been confirmed by the elders.', 5, 'u_m2'],
            ['farida', 'other', null, VerificationRequest::STATUS_REJECTED, 'u_admin', 'Family records could not confirm this claim at review time.', 4, 'u_m1'],
        ];
        foreach ($requests as [$memberKey, $type, $relatedKey, $status, $reviewerKey, $notes, $daysAgo, $submitterKey]) {
            $reviewer = $reviewerKey ? ($users[$reviewerKey] ?? null) : null;
            $request = VerificationRequest::create([
                'family_member_id' => $members[$memberKey]->id,
                'claimed_relationship_type' => $type,
                'claimed_related_to_id' => $relatedKey ? $members[$relatedKey]->id : null,
                'submitted_by' => $users[$submitterKey]->id,
                'notes' => $notes,
                'status' => $status,
                'reviewed_by' => $reviewer?->id,
                'reviewed_at' => $reviewer ? now()->subDays($daysAgo) : null,
            ]);
            $request->setCreatedAt(now()->subDays($daysAgo));
            $request->save();
        }

        $privacyMembers = ['adeleke', 'abike', 'bamidele', 'kolawole', 'adesuwa', 'tolani', 'fiyinfoluwa', 'simisola'];
        $privateOverrides = [
            'bamidele' => ['phone', 'email'],
            'simisola' => ['dob', 'bio'],
        ];
        foreach ($privacyMembers as $key) {
            $member = $members[$key];
            foreach (PrivacySetting::FIELDS as $field) {
                $isPrivate = in_array($field, $privateOverrides[$key] ?? [], true);
                PrivacySetting::create([
                    'family_member_id' => $member->id,
                    'field_name' => $field,
                    'visibility' => $isPrivate ? PrivacySetting::VIS_PRIVATE : PrivacySetting::VIS_FAMILY,
                ]);
            }
        }

        foreach ($members as $member) {
            $initial = strtoupper(substr($member->first_name, 0, 1));
            $path = 'photos/'.$member->id.'/profile.png';
            Storage::disk('private')->put($path, $this->avatar($initial, $member->gender));
            $member->update(['photo_path' => $path]);
        }
    }

    private function avatar(string $initial, string $gender): string
    {
        $border = [38, 58, 92];
        $brass = [169, 129, 47];
        $bg = $gender === FamilyMember::GENDER_MALE ? [237, 227, 208] : [246, 239, 225];

        try {
            if (! extension_loaded('gd')) {
                return $this->fallbackAvatar($initial, $bg);
            }
            return $this->drawnAvatar($initial, $bg, $brass, $border);
        } catch (\Throwable $e) {
            return $this->fallbackAvatar($initial, $bg);
        }
    }

    private function drawnAvatar(string $initial, array $bg, array $brass, array $border): string
    {
        $size = 200;
        $img = imagecreatetruecolor($size, $size);
        if ($img === false) {
            return $this->fallbackAvatar($initial, $bg);
        }
        $bgColor = imagecolorallocate($img, $bg[0], $bg[1], $bg[2]);
        $brassColor = imagecolorallocate($img, $brass[0], $brass[1], $brass[2]);
        $borderColor = imagecolorallocate($img, $border[0], $border[1], $border[2]);
        imagefilledrectangle($img, 0, 0, $size, $size, $bgColor);
        imagerectangle($img, 0, 0, $size - 1, $size - 1, $borderColor);
        imagerectangle($img, 8, 8, $size - 9, $size - 9, $borderColor);
        $font = 'C:/Windows/Fonts/arialbd.ttf';
        if (function_exists('imagettfbbox') && is_file($font)) {
            $points = 108;
            $box = imagettfbbox($points, 0, $font, $initial);
            $width = $box[2] - $box[0];
            $height = $box[1] - $box[7];
            $x = (int) round(($size - $width) / 2 - $box[0]);
            $y = (int) round(($size - $height) / 2 - $box[7]);
            imagefttext($img, $points, 0, $x, $y, $brassColor, $font, $initial);
        } elseif (function_exists('imagestring')) {
            imagestring($img, 5, 92, 90, $initial, $brassColor);
        }
        ob_start();
        $ok = imagepng($img);
        $bytes = (string) ob_get_clean();
        imagedestroy($img);
        if ($ok && strlen($bytes) > 8 && substr($bytes, 1, 3) === 'PNG') {
            return $bytes;
        }
        return $this->fallbackAvatar($initial, $bg);
    }

    private function fallbackAvatar(string $initial, array $bg): string
    {
        $size = 200;
        $img = imagecreatetruecolor($size, $size);
        if ($img === false) {
            return base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
        }
        $bgColor = imagecolorallocate($img, $bg[0], $bg[1], $bg[2]);
        imagefilledrectangle($img, 0, 0, $size, $size, $bgColor);
        $brassColor = imagecolorallocate($img, 169, 129, 47);
        if (function_exists('imagestring')) {
            imagestring($img, 5, 92, 90, $initial, $brassColor);
        }
        ob_start();
        imagepng($img);
        $bytes = (string) ob_get_clean();
        imagedestroy($img);
        if (strlen($bytes) > 8 && substr($bytes, 1, 3) === 'PNG') {
            return $bytes;
        }
        return base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
    }
}