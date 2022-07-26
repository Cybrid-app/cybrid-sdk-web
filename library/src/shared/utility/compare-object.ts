export function compareObjects(o1: any, o2: any): boolean {
  return o1.name === o2.name && o1._id === o2._id;
}
