import React from "react";

// export default function NewsCard({ article }) {
//   const { title, description, link, published, thumbnail } = article;

//   return (
//     <div
//       className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
//       onClick={() => window.open(link, "_blank")}
//     >
//       {thumbnail ? (
//         <img
//           src={thumbnail}
//           alt={title}
//           className="w-full h-48 object-cover"
//         />
//       ) : (
//         <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
//           No Image
//         </div>
//       )}

//       <div className="flex flex-col flex-1 p-4">
//         <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
//           {title}
//         </h2>
//         <p className="text-sm text-gray-600 flex-1 mb-3 line-clamp-3">
//           {description || "No description available."}
//         </p>
//         {published && (
//           <p className="text-xs text-gray-400 mt-auto">
//             🗓 {new Date(published).toLocaleString()}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

function NewsCard({ item, onOpen }) {
  return (
    <div
      onClick={() => onOpen(item)}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-xl transition-transform transform hover:-translate-y-1 overflow-hidden cursor-pointer group"
    >
      {item.thumbnail ? (
        <img
          src={item.thumbnail}
          alt=""
          className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
        />
      ) : (
        <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400">
          No Image
        </div>
      )}

      <div className="p-4 flex flex-col justify-between">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 line-clamp-2">
          {item.title}
        </h3>
        <p
          className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: item.summary }}
        />
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{item.source || ""}</span>
          <span>
            {item.published
              ? dayjs(item.published).format("DD MMM YYYY, HH:mm")
              : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
