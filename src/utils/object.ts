export function transferFields(targetObj: any, sourceObj: any) {
  for (const field of Object.keys(sourceObj)) {
    if (typeof sourceObj[field] === "object") {
      transferFields(targetObj[field], sourceObj[field]);
    } else {
      targetObj[field] = sourceObj[field];
    }
  }
}

export function matchObjectStructure(obj1: any, obj2: any) {
  const obj1Fields = new Set(Object.keys(obj1));
  const obj2Fields = new Set(Object.keys(obj2));

  const allFields = new Set([...obj1Fields, ...obj2Fields]);
  if (allFields.size != obj1Fields.size) {
    return false;
  }

  for (const field of obj1Fields) {
    if (typeof obj1[field] !== typeof obj2[field]) {
      return false;
    }
    if (typeof obj1[field] === "object") {
      if (!matchObjectStructure(obj1[field], obj2[field])) {
        return false;
      }
    }
  }

  return true;
}
