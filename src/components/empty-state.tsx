export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-dashed border-slate-200 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}
