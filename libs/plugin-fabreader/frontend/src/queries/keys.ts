export function getQueryKey(domain: string, key: string[]) {
  return ['plugin-fabreader', domain, ...key];
}
