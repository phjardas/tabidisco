export default function Duration({ seconds }) {
  let remaining = seconds;
  const hours = Math.floor(remaining / 3600);
  remaining = remaining - hours * 3600;
  const minutes = Math.floor(remaining / 60);
  remaining = remaining - minutes * 60;

  const str = [hours && hours.toString(), minutes.toString(), remaining.toString()]
    .map((s, i) => (i ? s.padStart(2, '0') : s))
    .join(':')
    .replace(/^0:0?/, '');

  return `${str} ${hours ? 'hours' : 'minutes'}`;
}
