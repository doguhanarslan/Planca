
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="max-w-md w-full p-6 text-center">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-t-3 border-b-3 border-red-600"></div>
      </div>
      <p className="text-center mt-4 text-black font-medium">Yükleniyor...</p>
    </div>
  </div>
);

export default LoadingScreen; 