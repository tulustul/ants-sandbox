export function transferFields(targetObj: any, sourceObj: any) {
  for (const field of Object.keys(sourceObj)) {
    targetObj[field] = sourceObj[field];
  }
}
