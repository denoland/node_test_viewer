export function Rev(props: { rev: string | undefined; label?: string }) {
  if (!props.rev) {
    return <span>N/A</span>;
  }
  return (
    <a
      href={"https://github.com/denoland/deno/commit/" + props.rev}
      title={props.rev}
      target="_blank"
      class="hover:text-blue-500 transition-colors duration-200"
    >
      {props.label ?? props.rev.slice(0, 7)}
    </a>
  );
}
