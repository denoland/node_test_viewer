export function LinkToJsonAndErrors(
  props: { date: string; os: "linux" | "windows" | "darwin" },
) {
  return (
    <span class="ml-2 text-xs font-normal text-gray-500">
      <a
        class="text-blue-500"
        href={`/results/${props.date}/${props.os}.json`}
        target="_blank"
      >
        json
      </a>
      ・
      <a
        class="text-blue-500"
        href={`/results/${props.date}/${props.os}.errors.txt`}
        target="_blank"
      >
        errors
      </a>
    </span>
  );
}
