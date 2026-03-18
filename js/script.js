/**
 * CLAUDIOSCHMIDT.dev - Vanilla Engine v1.0
 * Focado em Performance, UX Mobile e Simetria 3D
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SELETORES PRINCIPAIS ---
    const btnMenu = document.querySelector('.menu-hamburguer');
    const listaMenu = document.querySelector('.lista-menu');
    const linksMenu = document.querySelectorAll('.lista-menu a');
    const header = document.querySelector('.cabecalho-fixo');

    // --- 2. LÓGICA DO MENU HAMBÚRGUER (MOBILE) ---
    /**
     * Alterna as classes para abrir/fechar o menu e 
     * gerencia o scroll do body para evitar bugs visuais.
     */
    const toggleMenu = () => {
        const estaAberto = btnMenu.classList.toggle('aberto');
        listaMenu.classList.toggle('ativo');
        
        // Bloqueia o scroll do fundo quando o menu está aberto
        document.body.style.overflow = estaAberto ? 'hidden' : 'initial';
    };

    // Evento de clique no botão hambúrguer
    if (btnMenu) {
        btnMenu.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que o clique feche o menu imediatamente
            toggleMenu();
        });
    }

    // Fecha o menu automaticamente ao clicar em qualquer link (âncora)
    linksMenu.forEach(link => {
        link.addEventListener('click', () => {
            btnMenu.classList.remove('aberto');
            listaMenu.classList.remove('ativo');
            document.body.style.overflow = 'initial';
        });
    });

    // Fecha o menu se o usuário clicar fora dele (UX Premium)
    document.addEventListener('click', (e) => {
        if (listaMenu.classList.contains('ativo') && !listaMenu.contains(e.target) && !btnMenu.contains(e.target)) {
            toggleMenu();
        }
    });


    // --- 3. EFEITO DO HEADER AO ROLAR ---
    /**
     * Adiciona sombra e aumenta a opacidade do menu fixo 
     * assim que o usuário começa a descer a página.
     */
    const handleHeaderScroll = () => {
        if (window.scrollY > 50) {
            header.style.background = "rgba(2, 5, 10, 0.96)";
            header.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
            header.style.padding = "10px 0"; // Header fica mais "slim"
        } else {
            header.style.background = "rgba(2, 5, 10, 0.88)";
            header.style.boxShadow = "none";
            header.style.padding = "15px 0";
        }
    };

    window.addEventListener('scroll', handleHeaderScroll);


    // --- 4. REVELAÇÃO AO ROLAR (INTERSECTION OBSERVER) ---
    /**
     * Faz os elementos surgirem suavemente conforme entram na tela.
     * threshold: 0.15 significa que dispara quando 15% do elemento está visível.
     */
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visivel');
                // Para de observar o elemento após a revelação (ganho de performance)
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    // Seleciona e observa todos os elementos com a classe .revelar
    document.querySelectorAll('.revelar').forEach(el => revealObserver.observe(el));


    // --- 5. LOG DE STATUS (CONSOLE) ---
    console.log(
        "%c </> CLAUDIOSCHMIDT.dev %c Sistema Operacional - Joinville/SC ",
        "color: #02050a; background: #39ff14; font-weight: bold; padding: 5px; border-radius: 3px 0 0 3px;",
        "color: #39ff14; background: #02050a; padding: 5px; border-radius: 0 3px 3px 0; border: 1px solid #39ff14;"
    );
});