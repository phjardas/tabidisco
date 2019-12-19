export default function Duration({ seconds }) {
  let remaining = seconds;
  const hours = Math.floor(remaining / 3600);
  remaining = remaining - hours * 3600;
  const minutes = Math.floor(remaining / 60);
  remaining = remaining - minutes * 60;

  return [hours && hours.toString().padStart(2, '0'), minutes.toString().padStart(2, '0'), remaining.toString().padStart(2, '0')].filter((s) => !!s).join(':');
}
