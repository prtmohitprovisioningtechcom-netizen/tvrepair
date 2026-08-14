export default function Loading() {
  return (
    <div className="container-wide py-20">
      <div className="h-10 w-64 animate-pulse bg-line" />
      <div className="mt-6 h-4 w-full max-w-xl animate-pulse bg-line" />
      <div className="mt-3 h-4 w-full max-w-lg animate-pulse bg-line" />
    </div>
  );
}
