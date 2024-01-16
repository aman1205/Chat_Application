export default function Avatar({userId,photo,online}) {
    const colors = ['bg-teal-200', 'bg-red-200',
                    'bg-green-200', 'bg-purple-200',
                    'bg-blue-200', 'bg-yellow-200',
                    'bg-orange-200', 'bg-pink-200', 'bg-fuchsia-200', 'bg-rose-200'];
    const userIdBase10 = parseInt(userId.substring(10), 16);
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex];
    return (
      <div className={" relative rounded-full flex items-center "+color}>
        <img className="text-center w-12 h-12 object-contain rounded-full ring-2 ring-gray-300 dark:ring-gray-50"  src={photo} alt="profile"/>
        {online && (
          <div className="absolute w-3 h-3 bg-green-400 bottom-0 right-0 rounded-full border border-white"></div>
        )}
        {!online && (
          <div className="absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
        )}
      </div>
    );
  }