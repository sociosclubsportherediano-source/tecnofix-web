document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // UTILIDADES
    // =====================================================

    // Quita tildes y pasa a minúsculas: "Edición" coincide con "edicion"
    function normalize(text) {
        return (text || "")
            .toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }


    // =====================================================
    // STORE - BUSCADOR Y FILTROS
    // =====================================================

    const searchInput = document.getElementById("store-search");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const products = document.querySelectorAll(".product-card");

    // Opcional: <p id="store-empty" class="store-empty" hidden>...</p> en store.html
    const emptyMessage = document.getElementById("store-empty");

    let currentFilter = "all";


    function updateStore() {

        const search = normalize(searchInput ? searchInput.value : "");

        let visibleCount = 0;


        products.forEach(function (product) {

            const name = normalize(product.dataset.name);

            const categories = normalize(product.dataset.category)
                .split(/\s+/);

            // Busca en el nombre y en las categorías del producto
            const matchesSearch =
                name.includes(search) ||
                categories.some(function (cat) {
                    return cat.includes(search);
                });

            const matchesFilter =
                currentFilter === "all" ||
                categories.includes(currentFilter);

            const visible = matchesSearch && matchesFilter;

            product.classList.toggle("product-hidden", !visible);

            if (visible) {
                visibleCount++;
            }

        });


        // Subtítulos internos (ej. "Programas Adobe individuales"):
        // se ocultan si no les queda ningún producto visible debajo

        document
            .querySelectorAll(".adobe-individual-heading")
            .forEach(function (heading) {

                let hasVisibleProduct = false;
                let next = heading.nextElementSibling;

                while (next && !next.classList.contains("adobe-individual-heading")) {

                    if (
                        next.classList.contains("product-card") &&
                        !next.classList.contains("product-hidden")
                    ) {
                        hasVisibleProduct = true;
                        break;
                    }

                    next = next.nextElementSibling;
                }

                heading.classList.toggle("subheading-hidden", !hasVisibleProduct);

            });


        // Ocultar secciones que no tengan productos visibles

        document
            .querySelectorAll(".catalog-section")
            .forEach(function (section) {

                const hasVisibleProduct =
                    section.querySelector(".product-card:not(.product-hidden)") !== null;

                section.classList.toggle("catalog-hidden", !hasVisibleProduct);

            });


        // Mensaje cuando no hay resultados

        if (emptyMessage) {
            emptyMessage.hidden = visibleCount > 0;
        }

    }


    // =====================================================
    // BUSCADOR
    // =====================================================

    if (searchInput) {

        searchInput.addEventListener("input", updateStore);

    }


    // =====================================================
    // FILTROS
    // =====================================================

    filterButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            currentFilter = normalize(button.dataset.filter) || "all";


            filterButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });


            button.classList.add("active");

            updateStore();

        });

    });


    // =====================================================
    // MENÚ MÓVIL
    // =====================================================

    const menuToggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("nav");


    if (menuToggle && nav) {

        const icon = menuToggle.querySelector("i");


        function setMenu(open) {

            nav.classList.toggle("nav-open", open);

            menuToggle.setAttribute("aria-expanded", String(open));

            menuToggle.setAttribute(
                "aria-label",
                open ? "Cerrar menú" : "Abrir menú"
            );

            if (icon) {
                icon.classList.toggle("fa-xmark", open);
                icon.classList.toggle("fa-bars", !open);
            }

        }


        menuToggle.addEventListener("click", function () {
            setMenu(!nav.classList.contains("nav-open"));
        });


        // Al tocar un enlace del menú, se cierra
        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                setMenu(false);
            });
        });


        // Escape cierra el menú
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && nav.classList.contains("nav-open")) {
                setMenu(false);
                menuToggle.focus();
            }
        });


        // Si se agranda la pantalla, se restablece
        window.addEventListener("resize", function () {
            if (window.innerWidth > 820 && nav.classList.contains("nav-open")) {
                setMenu(false);
            }
        });

    }

    // =====================================================
    // BARRA SUPERIOR - ESTADO DEL HORARIO
    // =====================================================

    const openStatus = document.getElementById("open-status");

    if (openStatus) {

        // Horario de atención (minutos desde medianoche). 0 = domingo
        const schedule = {
            0: null,
            1: [510, 1080],
            2: [510, 1080],
            3: [510, 1080],
            4: [510, 1080],
            5: [510, 1080],
            6: [540, 1020]
        };

        function updateOpenStatus() {

            // Hora de Costa Rica, sin importar dónde esté el visitante
            const now = new Date(
                new Date().toLocaleString("en-US", {
                    timeZone: "America/Costa_Rica"
                })
            );

            const minutes = now.getHours() * 60 + now.getMinutes();
            const hours = schedule[now.getDay()];

            if (!hours) {
                openStatus.textContent = "Hoy domingo: solo con cita";
                openStatus.dataset.state = "closed";
                return;
            }

            const isOpen = minutes >= hours[0] && minutes < hours[1];

            openStatus.textContent = isOpen ? "Abierto ahora" : "Cerrado ahora";
            openStatus.dataset.state = isOpen ? "open" : "closed";

        }

        updateOpenStatus();
        setInterval(updateOpenStatus, 60000);

    }

});
