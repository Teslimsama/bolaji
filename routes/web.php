<?php

use App\Http\Controllers\PreviewPhotoController;
use App\Http\Middleware\NoIndex;
use App\Models\FamilyBranch;
use App\Models\FamilyMember;
use App\Models\FamilyRelationship;
use App\Models\Marriage;
use App\Models\VerificationRequest;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(NoIndex::class)->group(function () {
    Route::get('/preview/photo/{member}', [PreviewPhotoController::class, 'show'])->middleware(NoIndex::class);
    Route::get('/', fn () => Inertia::render('Home'));
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'));
    Route::get('/tree', function () {
        $members = FamilyMember::with('user')->get();
        $children = [];
        $parents = [];
        foreach (FamilyRelationship::where('status', 'active')->get(['parent_id', 'child_id']) as $rel) {
            $parents[(int) $rel->child_id][] = (int) $rel->parent_id;
            $children[(int) $rel->parent_id][] = (int) $rel->child_id;
        }
        $spouses = [];
        foreach (Marriage::get(['person_one_id', 'person_two_id']) as $marriage) {
            $spouses[(int) $marriage->person_one_id][] = (int) $marriage->person_two_id;
            $spouses[(int) $marriage->person_two_id][] = (int) $marriage->person_one_id;
        }
        $depth = [];
        $queue = [];
        foreach ($members as $member) {
            $id = (int) $member->id;
            if (! empty($parents[$id])) {
                continue;
            }
            $hasInLaw = false;
            foreach ($spouses[$id] ?? [] as $mate) {
                if (! empty($parents[$mate])) {
                    $hasInLaw = true;
                    break;
                }
            }
            if ($hasInLaw) {
                continue;
            }
            $depth[$id] = 0;
            $queue[] = $id;
        }
        reset($queue);
        for ($i = 0; $i < count($queue); $i++) {
            foreach ($children[$queue[$i]] ?? [] as $child) {
                if (! array_key_exists($child, $depth)) {
                    $depth[$child] = $depth[$queue[$i]] + 1;
                    $queue[] = $child;
                }
            }
        }
        foreach ($spouses as $id => $mates) {
            if (array_key_exists($id, $depth)) {
                continue;
            }
            foreach ($mates as $mate) {
                if (array_key_exists($mate, $depth)) {
                    $depth[$id] = $depth[$mate];
                    break;
                }
            }
            $depth[$id] = $depth[$id] ?? 0;
        }
        $memberMap = $members->keyBy('id');
        $byGen = [];
        foreach ($depth as $id => $d) {
            $byGen[$d][] = $id;
        }
        ksort($byGen);
        $tree = [];
        $generationNumber = 1;
        foreach ($byGen as $generation => $ids) {
            $people = [];
            foreach ($ids as $id) {
                $member = $memberMap[$id] ?? null;
                if ($member === null) {
                    continue;
                }
                $role = $member->status === FamilyMember::STATUS_VERIFIED ? 'verified' : 'pending';
                if ($member->user !== null && $member->user->isElder()) {
                    $role = 'elder';
                }
                $people[] = [
                    'id' => (int) $member->id,
                    'name' => $member->first_name.' '.$member->last_name,
                    'role' => $role,
                    'dobTick' => $member->dob ? strtotime((string) $member->dob) : PHP_INT_MAX,
                ];
            }
            usort($people, fn ($a, $b) => $a['dobTick'] <=> $b['dobTick']);
            $people = array_map(fn ($person) => array_diff_key($person, ['dobTick' => true]), $people);
            if ($people !== []) {
                $tree[] = ['label' => 'Generation '.$generationNumber, 'people' => array_values($people)];
                $generationNumber++;
            }
        }

        return Inertia::render('Tree', ['tree' => $tree]);
    });
    Route::get('/find', fn () => Inertia::render('Find'));
    Route::get('/admin/queue', function () {
        $requests = VerificationRequest::with(['familyMember', 'claimedRelatedTo'])
            ->orderBy('created_at')
            ->get()
            ->toArray();

        return Inertia::render('AdminQueue', ['requests' => $requests]);
    });
    Route::get('/login', fn () => Inertia::render('Auth/Login'));
    Route::get('/request-access', fn () => Inertia::render('Auth/RequestAccess', [
        'branches' => FamilyBranch::query()->orderBy('name')->get(['id', 'name'])->map(fn ($b) => ['id' => $b->id, 'name' => $b->name])->values()->all(),
    ]));
    Route::get('/me/verify', fn () => Inertia::render('Auth/VerifyStatus', ['status' => null]));
    Route::get('/me', fn () => Inertia::render('Auth/Profile', ['member' => null]));

    Route::get('/{any}', fn () => view('app'))->where('any', '.*');
});