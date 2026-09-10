export default function LoadingScreen({ message = 'Cargando...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 gap-4">
      <div className="text-5xl">🍧</div>
      <div className="spinner" />
      <p className="text-gray-500 dark:text-gray-400 text-sm">{message}</p>
    </div>
  );
}
