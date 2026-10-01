"use client";

export function IconPencil({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931z" />
      <path d="M16.862 4.487 19.5 7.125" />
      <path d="M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}

export function IconTrash({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.75 3h4.5A1.5 1.5 0 0 1 15.75 4.5V6h-7.5V4.5A1.5 1.5 0 0 1 9.75 3z" />
      <path d="M4.5 6h15" />
      <path d="M6.15 6.4 7.2 19.35A1.8 1.8 0 0 0 9 21h6a1.8 1.8 0 0 0 1.8-1.65L17.85 6.4" />
      <path d="M10 10.25v6.5M14 10.25v6.5" />
    </svg>
  );
}
