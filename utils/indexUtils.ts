type MultiIndex = Record<string, string[]>;

export function addToMultiIndex(
  index: MultiIndex,
  personIds: string[],
  recordId: string,
): MultiIndex {
  const next = { ...index };
  for (const pid of personIds) {
    next[pid] = next[pid] ? [...next[pid], recordId] : [recordId];
  }
  return next;
}

export function removeFromMultiIndex(
  index: MultiIndex,
  personIds: string[],
  recordId: string,
): MultiIndex {
  const next = { ...index };
  for (const pid of personIds) {
    if (next[pid]) {
      next[pid] = next[pid].filter((id) => id !== recordId);
    }
  }
  return next;
}

export function updateMultiIndex(
  index: MultiIndex,
  oldPersonIds: string[],
  newPersonIds: string[],
  recordId: string,
): MultiIndex {
  const removed = oldPersonIds.filter((id) => !newPersonIds.includes(id));
  const added = newPersonIds.filter((id) => !oldPersonIds.includes(id));
  let next = removeFromMultiIndex(index, removed, recordId);
  next = addToMultiIndex(next, added, recordId);
  return next;
}
