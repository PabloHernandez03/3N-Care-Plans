import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    // pathname cambia al cambiar de vista, search cambia al paginar o filtrar (?page=2)
    const { pathname, search } = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            window.scrollTo(0, 0);

            // Respaldo por si el scroll se quedó atrapado en tu contenedor de AppLayout
            const mainContent = document.querySelector("section") || document.querySelector("main");
            if (mainContent) {
                mainContent.scrollTop = 0;
            }
        };

        // Delay de 10ms para asegurar que React ya renderizó los nuevos datos
        const timer = setTimeout(handleScroll, 10);

        return () => clearTimeout(timer);
    }, [pathname, search]); // 👈 Ahora reacciona a AMBOS cambios

    return null;
}