// src/components/Loading.tsx
type Props = {
  message?: string;
};

export const Loading = ({ message = "読み込み中..." }: Props) => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p className="loading-text">{message}</p>
    </div>
  );
};
