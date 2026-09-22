<?php

namespace App\Services;

use App\Models\FamilyMember;
use App\Models\FamilyRelationship;
use App\Models\Marriage;

final class RelationshipService
{
    public const CLOSE_ANCESTOR_GENERATION = 4;

    public function resolve(int $subjectId, int $targetId): ?array
    {
        $subject = FamilyMember::with('branch')->find($subjectId);
        $target = FamilyMember::with('branch')->find($targetId);
        if (!$subject || !$target) return null;
        if ($subjectId === $targetId) return $this->selfResult($subject);
        [$adj, $edgeData] = $this->collectGraph($subjectId, $targetId);
        $path = $this->shortestPath($adj, $subjectId, $targetId);
        if ($path === null) return null;
        [$nodes, $edgeKeys] = $path;
        $memberMap = FamilyMember::whereIn('id', $nodes)->get()->keyBy('id');
        $spouseIndex = null;
        foreach ($edgeKeys as $i => $key) {
            if ($key[0] === 's') { $spouseIndex = $i; break; }
        }
        if ($spouseIndex !== null) {
            return $this->inLawResult($subject, $target, $nodes, $edgeKeys, $spouseIndex, $memberMap, $edgeData);
        }
        $upAdj = [];
        foreach ($edgeData as $e) {
            if (isset($e['p'])) $upAdj[$e['c']][] = $e['p'];
        }
        $walkA = $this->upWalk($subjectId, $upAdj);
        $walkB = $this->upWalk($targetId, $upAdj);
        $lcaId = null;
        $best = null;
        foreach ($walkA as $id => $d) {
            if (!isset($walkB[$id])) continue;
            $sum = $d + $walkB[$id];
            if ($best === null || $sum < $best) { $best = $sum; $lcaId = $id; }
        }
        $steps = $this->makeSteps($nodes, $edgeKeys, $memberMap, $lcaId, $spouseIndex, $edgeData);
        if ($lcaId === null) return $this->genericResult($subject, $target, $steps);
        $m = $walkA[$lcaId];
        $n = $walkB[$lcaId];
        [$kinType, $chainSide, $label] = $this->classify($m, $n, $subject->gender, $target->gender);
        $warn = $m >= 1 && $n >= 1 && $m <= self::CLOSE_ANCESTOR_GENERATION && $n <= self::CLOSE_ANCESTOR_GENERATION;
        $anc = isset($memberMap[$lcaId]) ? ['id' => $lcaId, 'full_name' => $memberMap[$lcaId]->full_name] : null;
        return [
            'subject' => $this->memberInfo($subject),
            'label' => $label,
            'kin_type' => $kinType,
            'chain_side' => $chainSide,
            'common_ancestor' => $anc,
            'degrees' => ['m' => $m, 'n' => $n],
            'close_family_warning' => $warn,
            'close_family_reason' => $warn ? 'Shares an ancestor within '.self::CLOSE_ANCESTOR_GENERATION.' generations.' : null,
            'details' => $subject->full_name.' is the '.$label.' of '.$target->full_name.'.',
            'path' => $steps,
            'via_marriage' => false,
        ];
    }

    private function collectGraph(int $subjectId, int $targetId): array
    {
        $nodes = [$subjectId => true, $targetId => true];
        $edgeData = [];
        do {
            $ids = array_keys($nodes);
            $rels = FamilyRelationship::where('status', 'active')
                ->where(function ($q) use ($ids) {
                    $q->whereIn('parent_id', $ids)->orWhereIn('child_id', $ids);
                })
                ->get();
            $grew = false;
            foreach ($rels as $r) {
                $p = (int) $r->parent_id;
                $c = (int) $r->child_id;
                $edgeData['b'.$p.':'.$c] = ['p' => $p, 'c' => $c];
                foreach ([$p, $c] as $id) {
                    if (!isset($nodes[$id])) { $nodes[$id] = true; $grew = true; }
                }
            }
        } while ($grew);
        $ids = array_keys($nodes);
        $marriages = Marriage::where('status', 'married')
            ->where(function ($q) use ($ids) {
                $q->whereIn('person_one_id', $ids)->orWhereIn('person_two_id', $ids);
            })
            ->get();
        foreach ($marriages as $marriage) {
            $x = (int) $marriage->person_one_id;
            $y = (int) $marriage->person_two_id;
            $edgeData['s'.$x.':'.$y] = ['x' => $x, 'y' => $y];
            $nodes[$x] = true;
            $nodes[$y] = true;
        }
        $adj = [];
        foreach ($edgeData as $key => $e) {
            if (isset($e['c'])) {
                $adj[$e['p']][$e['c']] = $key;
                $adj[$e['c']][$e['p']] = $key;
            } else {
                $adj[$e['x']][$e['y']] = $key;
                $adj[$e['y']][$e['x']] = $key;
            }
        }
        return [$adj, $edgeData];
    }

    private function shortestPath(array $adj, int $start, int $goal): ?array
    {
        if ($start === $goal) return [[$start], []];
        $queue = [$start];
        $prev = [$start => null];
        $fromEdge = [];
        for ($i = 0; $i < count($queue); $i++) {
            $u = $queue[$i];
            if ($u === $goal) break;
            foreach ($adj[$u] ?? [] as $v => $key) {
                if (array_key_exists($v, $prev)) continue;
                $prev[$v] = $u;
                $fromEdge[$v] = $key;
                $queue[] = $v;
            }
        }
        if (!array_key_exists($goal, $prev)) return null;
        $nodes = [$goal];
        $edgeKeys = [];
        while ($prev[$nodes[count($nodes) - 1]] !== null) {
            $cur = $nodes[count($nodes) - 1];
            $nodes[] = $prev[$cur];
            $edgeKeys[] = $fromEdge[$cur];
        }
        return [array_reverse($nodes), array_reverse($edgeKeys)];
    }

    private function upWalk(int $start, array $upAdj): array
    {
        $depth = [$start => 0];
        $queue = [$start];
        for ($i = 0; $i < count($queue); $i++) {
            foreach ($upAdj[$queue[$i]] ?? [] as $p) {
                if (isset($depth[$p])) continue;
                $depth[$p] = $depth[$queue[$i]] + 1;
                $queue[] = $p;
            }
        }
        return $depth;
    }

    private function classify(int $m, int $n, string $sg, string $tg): array
    {
        if ($m === 1 && $n === 1) return ['sibling', 'siblings', $this->siblingTerm($sg)];
        if ($m === 0) return ['ancestor', 'subject_is_ancestor', $this->ancestorTerm($n)];
        if ($n === 0) return ['descendant', 'target_is_ancestor', $this->descendantTerm($m)];
        if ($m === 1) return ['aunt_uncle', 'aunt_nephew', $this->auntUncleTerm($sg)];
        if ($n === 1) return ['niece_nephew', 'aunt_nephew', $this->nieceNephewTerm($tg)];
        $k = min($m, $n) - 1;
        $removed = abs($m - $n);
        $kin = $removed > 0 ? 'cousin_removed' : 'cousin';
        return [$kin, $kin, $this->cousinTerm($k, $removed)];
    }

    private function makeSteps(array $nodes, array $edgeKeys, $memberMap, ?int $lcaId, ?int $spouseIndex, array $edgeData): array
    {
        $steps = [];
        $last = count($nodes) - 1;
        foreach ($nodes as $i => $id) {
            if ($i === 0 || $i === $last) {
                $direction = $i === 0 ? 'start' : 'end';
            } elseif ($i === $spouseIndex || $i === $spouseIndex + 1) {
                $direction = 'spouse';
            } else {
                $e = $edgeData[$edgeKeys[$i - 1]];
                $direction = $nodes[$i - 1] === $e['p'] ? 'down' : 'up';
            }
            if ($i === 0) {
                $role = 'subject';
            } elseif ($i === $last) {
                $role = 'target';
            } elseif ($lcaId !== null && $id === $lcaId) {
                $role = 'common_ancestor';
            } elseif ($i === $spouseIndex || $i === $spouseIndex + 1) {
                $role = 'spouse';
            } else {
                $role = 'kin';
            }
            $steps[] = [
                'id' => $id,
                'name' => isset($memberMap[$id]) ? $memberMap[$id]->full_name : 'Unknown',
                'role' => $role,
                'direction' => $direction,
            ];
        }
        return $steps;
    }

    private function inLawResult($subject, $target, array $nodes, array $edgeKeys, int $spouseIndex, $memberMap, array $edgeData): array
    {
        $a = $nodes[$spouseIndex];
        $b = $nodes[$spouseIndex + 1];
        $spouse = $memberMap[$b] ?? null;
        $term = 'Spouse';
        if ($spouse) {
            $term = $spouse->gender === FamilyMember::GENDER_MALE
                ? 'Husband'
                : ($spouse->gender === FamilyMember::GENDER_FEMALE ? 'Wife' : 'Spouse');
        }
        $name = isset($memberMap[$a]) ? $memberMap[$a]->full_name : 'Unknown';
        return [
            'subject' => $this->memberInfo($subject),
            'label' => $term.' of '.$name,
            'kin_type' => 'in_law',
            'chain_side' => 'via_marriage',
            'common_ancestor' => null,
            'degrees' => ['m' => $spouseIndex, 'n' => count($edgeKeys) - $spouseIndex - 1],
            'close_family_warning' => false,
            'close_family_reason' => null,
            'details' => $target->full_name.' is connected to '.$subject->full_name.' by marriage.',
            'path' => $this->makeSteps($nodes, $edgeKeys, $memberMap, null, $spouseIndex, $edgeData),
            'via_marriage' => true,
        ];
    }

    private function genericResult($subject, $target, array $steps): array
    {
        return [
            'subject' => $this->memberInfo($subject),
            'label' => 'Family Member',
            'kin_type' => 'other',
            'chain_side' => 'other',
            'common_ancestor' => null,
            'degrees' => ['m' => 0, 'n' => 0],
            'close_family_warning' => false,
            'close_family_reason' => null,
            'details' => $subject->full_name.' is connected to '.$target->full_name.'.',
            'path' => $steps,
            'via_marriage' => false,
        ];
    }

    private function selfResult($subject): array
    {
        return [
            'subject' => $this->memberInfo($subject),
            'label' => 'The same person',
            'kin_type' => 'self',
            'chain_side' => 'self',
            'common_ancestor' => null,
            'degrees' => ['m' => 0, 'n' => 0],
            'close_family_warning' => false,
            'close_family_reason' => null,
            'details' => $subject->full_name.' is the same person.',
            'path' => [['id' => (int) $subject->id, 'name' => $subject->full_name, 'role' => 'self', 'direction' => 'start']],
            'via_marriage' => false,
        ];
    }

    private function memberInfo($member): array
    {
        return [
            'id' => (int) $member->id,
            'full_name' => $member->full_name,
            'gender' => $member->gender,
            'branch' => $member->branch ? $member->branch->name : null,
        ];
    }

    private function ancestorTerm(int $n): string
    {
        return $n === 1 ? 'Parent' : ($n === 2 ? 'Grandparent' : str_repeat('Great-', $n - 2).'Grandparent');
    }

    private function descendantTerm(int $m): string
    {
        return $m === 1 ? 'Child' : ($m === 2 ? 'Grandchild' : str_repeat('Great-', $m - 2).'Grandchild');
    }

    private function genderTerm(string $g, string $m, string $f, string $o): string
    {
        return $g === FamilyMember::GENDER_MALE ? $m : ($g === FamilyMember::GENDER_FEMALE ? $f : $o);
    }

    private function siblingTerm(string $g): string
    {
        return $this->genderTerm($g, 'Brother', 'Sister', 'Sibling');
    }

    private function auntUncleTerm(string $g): string
    {
        return $this->genderTerm($g, 'Uncle', 'Aunt', 'Aunt/Uncle');
    }

    private function nieceNephewTerm(string $g): string
    {
        return $this->genderTerm($g, 'Nephew', 'Niece', 'Niece/Nephew');
    }

    private function cousinTerm(int $k, int $removed): string
    {
        $ords = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
        $label = ($ords[$k - 1] ?? $k.'th').' Cousin';
        if ($removed > 0) {
            $label .= $removed === 1 ? ' Once Removed' : ($removed === 2 ? ' Twice Removed' : ' '.$removed.' Times Removed');
        }
        return $label;
    }
}