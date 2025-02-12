import { useState, useEffect } from "react";
import fondo_titulo from "/img/fondo_titulo.svg";

interface Catalogo {
  name: string;
  image: string;
  description: string[];
}

export default function CatalogoView() {
  const catalogo: Catalogo[] = [
    { name: "Jordan 1", image: "/img/catalogo/tenis_01.webp", description: ["Jordan", "1", "Deportivo"] },
    { name: "Air Force 1", image: "/img/catalogo/tenis_02.webp", description: ["Nike", "Air Force 1", "Deportivo"] },
    { name: "Air Force 1", image: "/img/catalogo/tenis_03.webp", description: ["Nike", "Air Force 1", "Deportivo"] },
    { name: "Air Force 1", image: "/img/catalogo/tenis_04.webp", description: ["Nike", "Air Force 1", "Deportivo"] },
    { name: "New Balance 327", image: "/img/catalogo/tenis_05.webp", description: ["New Balance", "327", "Deportivo"] },
    { name: "Jordan 3", image: "/img/catalogo/tenis_06.webp", description: ["Jordan", "3", "Deportivo"] },
    { name: "Air Force 1", image: "/img/catalogo/tenis_07.webp", description: ["Nike", "Air Force 1", "Deportivo"] },
    { name: "Adidas Forum", image: "/img/catalogo/tenis_08.webp", description: ["Adidas", "Low Top", "Casual"] },
    { name: "Adidas Samba", image: "/img/catalogo/tenis_09.webp", description: ["Adidas", "Low Top", "Casual"] },
    { name: "Adidas Gazelle", image: "/img/catalogo/tenis_10.webp", description: ["Adidas", "Low Top", "Casual"] },
    { name: "Jordan 4", image: "/img/catalogo/tenis_11.webp", description: ["Jordan", "4", "Deportivo", "Basket"] },
    { name: "Jordan 1 X Off White", image: "/img/catalogo/tenis_12.webp", description: ["Jordan", "1", "Retro"] },
    { name: "Adidas Gazelle", image: "/img/catalogo/tenis_13.webp", description: ["Adidas", "Low Top", "Casual"] },
    { name: "Amiri Skel", image: "/img/catalogo/tenis_14.webp", description: ["Amiri", "High Fashion", "High Top"] },
    { name: "Jordan 1", image: "/img/catalogo/tenis_15.webp", description: ["Jordan", "1", "Deportivo", "Basket"] },
    { name: "Nike Dunk", image: "/img/catalogo/tenis_16.webp", description: ["Nike", "Dunk", "Deportivo", "Casual"] },
    { name: "Nike Dunk", image: "/img/catalogo/tenis_17.webp", description: ["Nike", "Dunk", "Deportivo", "Casual"] },
    { name: "Adidas Gazelle", image: "/img/catalogo/tenis_18.webp", description: ["Adidas", "Low Top", "Casual"] },
    { name: "Nike Dunk", image: "/img/catalogo/tenis_19.webp", description: ["Nike", "Dunk", "Deportivo", "Casual"] },
    { name: "Nike Dunk", image: "/img/catalogo/tenis_20.webp", description: ["Nike", "Dunk", "Deportivo", "Casual"] },
    { name: "Air Force 1", image: "/img/catalogo/tenis_21.webp", description: ["Nike", "Air Force 1", "Deportivo"] },
    { name: "Nike Dunk", image: "/img/catalogo/tenis_22.webp", description: ["Nike", "Dunk", "Deportivo", "Casual"] },
    { name: "Air Force 1", image: "/img/catalogo/tenis_23.webp", description: ["Nike", "Air Force 1", "Deportivo"] },
    { name: "Jordan 1", image: "/img/catalogo/tenis_24.webp", description: ["Jordan", "1", "Deportivo", "Basket"] },
    { name: "Jordan 1", image: "/img/catalogo/tenis_25.webp", description: ["Jordan", "1", "Deportivo", "Basket"] },
    { name: "Blazer Jumbo", image: "/img/catalogo/tenis_26.webp", description: ["Blazer", "High Top", "Casual"] },
    { name: "Jordan 1", image: "/img/catalogo/tenis_27.webp", description: ["Jordan", "1", "Deportivo", "Basket"] },
    { name: "Jordan 1", image: "/img/catalogo/tenis_28.webp", description: ["Jordan", "1", "Deportivo", "Basket"] },
    { name: "Jordan 4", image: "/img/catalogo/tenis_29.webp", description: ["Jordan", "4", "Deportivo", "Basket"] },
    { name: "Jordan 4", image: "/img/catalogo/tenis_30.webp", description: ["Jordan", "4", "Deportivo", "Basket"] },
    { name: "Jordan 4", image: "/img/catalogo/tenis_31.webp", description: ["Jordan", "4", "Deportivo", "Basket"] },
    { name: "Nike Dunk", image: "/img/catalogo/tenis_32.webp", description: ["Nike", "Dunk", "Deportivo", "Casual"] },
    { name: "Converse Run Stars", image: "/img/catalogo/tenis_33.webp", description: ["Converse", "Run Stars", "Deportivo", "Casual"] },
    { name: "Jordan 4", image: "/img/catalogo/tenis_34.webp", description: ["Jordan", "4", "Deportivo", "Basket"] },
    { name: "Nike Dunk", image: "/img/catalogo/tenis_35.webp", description: ["Nike", "Dunk", "Deportivo", "Casual"] },
    { name: "Nike Dunk", image: "/img/catalogo/tenis_36.webp", description: ["Nike", "Dunk", "Deportivo", "Casual"] },
    { name: "Adidas Samba", image: "/img/catalogo/tenis_37.webp", description: ["Adidas", "Samba", "Deportivo", "Casual"] },
    { name: "Nike Dunk", image: "/img/catalogo/tenis_38.webp", description: ["Nike", "Dunk", "Deportivo", "Casual"] },
    { name: "Jordan 1 Low", image: "/img/catalogo/tenis_39.webp", description: ["Jordan", "1 Low", "Deportivo", "Casual"] },
    { name: "Air Max 270", image: "/img/catalogo/tenis_40.webp", description: ["Nike", "Air Max", "270", "Deportivo"] },
    { name: "Air Max 97", image: "/img/catalogo/tenis_41.webp", description: ["Nike", "Air Max", "97", "Deportivo"] },
    { name: "Air Force 1 High", image: "/img/catalogo/tenis_42.webp", description: ["Nike", "Air Force 1", "Deportivo"] },
    { name: "Air Force 1 High", image: "/img/catalogo/tenis_43.webp", description: ["Nike", "Air Force 1", "Deportivo"] },
    { name: "Alexander McQueen", image: "/img/catalogo/tenis_44.webp", description: ["Alexander McQueen", "Lujo", "Casual"] },
    { name: "Balenciaga", image: "/img/catalogo/tenis_45.webp", description: ["Balenciaga", "Lujo", "Casual"] },
    { name: "Adidas Superstar", image: "/img/catalogo/tenis_46.webp", description: ["Adidas", "Superstar", "Casual"] },
    { name: "Adidas Superstar", image: "/img/catalogo/tenis_47.webp", description: ["Adidas", "Superstar", "Casual"] },
    { name: "Air Max 270", image: "/img/catalogo/tenis_48.webp", description: ["Nike", "Air Max", "270", "Deportivo"] },
    { name: "Nike Lunar Force", image: "/img/catalogo/tenis_49.webp", description: ["Nike", "Lunar Force", "Deportivo"] },
    { name: "Louis Vuitton", image: "/img/catalogo/tenis_50.webp", description: ["Louis Vuitton", "Lujo", "Casual"] },
    { name: "Louis Vuitton", image: "/img/catalogo/tenis_51.webp", description:["Louis Vuitton", "Lujo", "Casual"] },
    { name: "Dior", image: "/img/catalogo/tenis_52.webp", description: ["Dior", "Lujo", "Casual"] },
    { name: "Dior", image: "/img/catalogo/tenis_53.webp", description: ["Dior", "Lujo", "Casual"] },
    { name: "Dior", image: "/img/catalogo/tenis_54.webp", description: ["Dior", "Lujo", "Casual"] },
    { name: "Air Max 1", image: "/img/catalogo/tenis_55.webp", description: ["Nike", "Air Max", "1", "Deportivo"] },
    { name: "Air Max 1", image: "/img/catalogo/tenis_56.webp", description: ["Nike", "Air Max", "1", "Deportivo"] },
    { name: "Air Max 270", image: "/img/catalogo/tenis_57.webp", description: ["Nike", "Air Max", "270", "Deportivo"] },
    { name: "Air Max 270", image: "/img/catalogo/tenis_58.webp", description: ["Nike", "Air Max", "270", "Deportivo"] },
    { name: "Air Max 270", image: "/img/catalogo/tenis_59.webp", description: ["Nike", "Air Max", "270", "Deportivo"] },
    { name: "Jordan Retro 3", image: "/img/catalogo/tenis_60.webp", description: ["Jordan", "Retro 3", "Deportivo"] },
    { name: "Jordan 1 High", image: "/img/catalogo/tenis_61.webp", description: ["Jordan", "1 High", "Deportivo"] },
    { name: "Jordan 1 High", image: "/img/catalogo/tenis_62.webp", description: ["Jordan", "1 High", "Deportivo"] },
    { name: "Jordan 1 High", image: "/img/catalogo/tenis_63.webp", description: ["Jordan", "1 High", "Deportivo"] },
    { name: "Jordan 1 High", image: "/img/catalogo/tenis_64.webp", description: ["Jordan", "1 High", "Deportivo"] },
    { name: "Jordan 1 High", image: "/img/catalogo/tenis_65.webp", description: ["Jordan", "1 High", "Deportivo"] },
    { name: "Jordan 1 High", image: "/img/catalogo/tenis_66.webp", description: ["Jordan", "1 High", "Deportivo"] },
    { name: "Jordan 1 High", image: "/img/catalogo/tenis_67.webp", description: ["Jordan", "1 High", "Deportivo"] }
  ];

  const [itemsPerPage, setItemsPerPage] = useState(0); // Items por página según la pantalla
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  // Función para abrir el modal y establecer la imagen seleccionada
  const openModal = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage("");
  };

  const filteredCatalogo = catalogo.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    || item.description.some((desc) =>
    desc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredCatalogo.length / itemsPerPage);

  const currentItems = filteredCatalogo.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Detectar tamaño de la pantalla y ajustar items por página
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(6); // Pantallas pequeñas (móviles)
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(10); // Pantallas medianas (tablets)
      } else {
        setItemsPerPage(20); // Pantallas grandes (desktop)
      }
    };

    updateItemsPerPage(); // Actualizar al cargar la página
    window.addEventListener("resize", updateItemsPerPage); // Escuchar cambios de tamaño

    return () => {
      window.removeEventListener("resize", updateItemsPerPage); // Limpiar evento
    };
  }, []);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="text-center text-[#F7F6F6] p-5">
      <h1
        className="text-4xl font-bold px-10 pb-2 inline-block"
        style={{
          backgroundImage: `url(${fondo_titulo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        Catálogo
      </h1>

      <input
          type="text"
          placeholder="Buscar tenis..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="text-black w-full max-w-md px-4 py-2 mt-4 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C73E41] focus:border-transparent"
        />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-8">
        {currentItems.map((item, index) => (
          <div
            key={index}
            className="bg-orange-700 text-white rounded-lg shadow-lg  text-center"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-60 object-cover p-4 pb-0 rounded-t-lg bg-zinc-200"
              onClick={() => openModal(item.image)}
            />
            <h2 className="text-xl font-bold mt-4">{item.name}</h2>
            <div className="flex flex-wrap justify-center mt-2">
              {item.description.map((desc, i) => (
                <span
                  key={i}
                  className="bg-gray-200 text-gray-800 text-xs font-semibold m-2 px-2.5 py-0.5 rounded"
                >
                  {desc}
                </span>
              ))}
            </div>
            {/* Modal */}
            {isModalOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                onClick={closeModal} // Cerrar modal al hacer clic fuera
              >
                <div
                  className="bg-white p-4 rounded-lg max-w-4xl max-h-full overflow-auto"
                  onClick={(e) => e.stopPropagation()} // Prevenir el cierre al hacer clic dentro del modal
                >
                  <img
                    src={selectedImage}
                    alt="Large view"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                  <button
                    className="absolute top-4 right-4 text-white bg-[#C73E41] rounded-full p-2 px-4"
                    onClick={closeModal} // Cerrar el modal al hacer clic en el botón
                  >
                    X
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center mt-6 space-x-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg text-white font-semibold ${
            currentPage === 1 ? "bg-gray-500 cursor-not-allowed" : "bg-[#C73E41]"
          }`}
        >
          Anterior
        </button>
        <span className="text-white">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg text-white font-semibold ${
            currentPage === totalPages
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-[#C73E41]"
          }`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
