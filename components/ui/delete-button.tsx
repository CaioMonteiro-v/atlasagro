"use client";

type Props = {
  label?: string;
  confirmMessage: string;
  className?: string;
};

export function DeleteButton({
  label = "Excluir",
  confirmMessage,
  className = "text-sm font-medium text-rose-700 hover:underline",
}: Props) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
