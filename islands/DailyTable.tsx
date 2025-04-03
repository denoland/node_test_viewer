// Copyright 2025 the Deno authors. MIT license.

type Data = {
  name: string;
  pass: number;
  total: number;
  rev?: string;
};

type DataRow = {
  date: Date;
  data: Data[];
};

const platforms = [
  "linux",
  "windows",
  "darwin",
];

export function DailyTable(props: { data: DataRow[]; class?: string }) {
  return (
    <table class={`${props.class ?? ""} table-fixed border-collapse`}>
      <tr>
        <th></th>
        {platforms.map((platform) => (
          <th key={platform} class="capitalize">{platform}</th>
        ))}
      </tr>
      {props.data.map((row, i) => {
        const date = row.date.toISOString().slice(0, 10);
        return <TableRow key={i} date={date} data={row.data} />;
      })}
    </table>
  );
}

function TableRow(props: { date: string; data: Data[] }) {
  const open = () => globalThis.open("/results/" + props.date, "_blank");

  return (
    <tr
      class="border-t border-grey-500 hover:bg-gray-50 cursor-pointer"
      onClick={open}
    >
      <td class="text-center py-1 text-blue-500">{props.date}</td>
      {props.data.map((item) => (
        <td key={item.name} class="py-1 text-center">
          {item.pass}/{item.total}{" "}
          ({(item.pass / item.total * 100).toFixed(2)}%)
        </td>
      ))}
    </tr>
  );
}
