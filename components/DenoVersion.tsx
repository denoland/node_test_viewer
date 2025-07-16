// Copyright 2025 the Deno authors. MIT license.

export function DenoVersion(
  props: { version: string | undefined; label?: string; class?: string },
) {
  const { version } = props;
  if (!version) {
    return <span>N/A</span>;
  }
  const matchCanary = version.match(/^\d+\.\d+\.\d+\+([0-9a-f]+)$/);
  if (matchCanary) {
    const version = matchCanary[1];
    return (
      <a
        href={"https://github.com/denoland/deno/commit/" + version}
        title={version}
        target="_blank"
        class={`hover:text-blue-500 transition-colors duration-200 dark:hover:text-blue-400 ${
          props.class ?? ""
        }`}
      >
        {props.label ?? version}
      </a>
    );
  }
  return <span>{version}</span>;
}
