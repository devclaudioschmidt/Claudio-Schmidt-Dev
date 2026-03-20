/**
 * CLAUDIOSCHMIDT.dev - Vanilla Engine v1.0
 * Ajuste: Sincronização da classe 'aberto' para animação do X
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SELETORES PRINCIPAIS ---
    const btnMenu = document.querySelector('.menu-hamburguer');
    const listaMenu = document.querySelector('.lista-menu');
    const linksMenu = document.querySelectorAll('.lista-menu a');
    const header = document.querySelector('.cabecalho-fixo');

    // --- 2. LÓGICA DO MENU HAMBÚRGUER (MOBILE) ---
    const toggleMenu = () => {
        // Esta classe 'aberto' no btnMenu é o que dispara o X no seu CSS
        const estaAberto = btnMenu.classList.toggle('aberto');
        listaMenu.classList.toggle('ativo');
        
        // Bloqueia o scroll do fundo quando o menu está aberto
        document.body.style.overflow = estaAberto ? 'hidden' : 'initial';
    };

    // Evento de clique no botão hambúrguer
    if (btnMenu) {
        btnMenu.addEventListener('click', (e) => {
            e.stopPropagation(); 
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
            // Chamamos toggleMenu para garantir que o X também desarme e o scroll volte
            btnMenu.classList.remove('aberto');
            listaMenu.classList.remove('ativo');
            document.body.style.overflow = 'initial';
        }
    });


    // --- 3. EFEITO DO HEADER AO ROLAR ---
    const handleHeaderScroll = () => {
        if (window.scrollY > 50) {
            header.style.background = "rgba(2, 5, 10, 0.96)";
            header.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
            header.style.padding = "10px 0"; 
        } else {
            header.style.background = "rgba(2, 5, 10, 0.88)";
            header.style.boxShadow = "none";
            header.style.padding = "15px 0";
        }
    };

    window.addEventListener('scroll', handleHeaderScroll);


    // --- 4. REVELAÇÃO AO ROLAR (INTERSECTION OBSERVER) ---
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visivel');
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.revelar').forEach(el => revealObserver.observe(el));


    // --- 5. LOG DE STATUS ---
    console.log(
        "%c </> CLAUDIOSCHMIDT.dev %c Sistema Operacional - Joinville/SC ",
        "color: #02050a; background: #39ff14; font-weight: bold; padding: 5px; border-radius: 3px 0 0 3px;",
        "color: #39ff14; background: #02050a; padding: 5px; border-radius: 0 3px 3px 0; border: 1px solid #39ff14;"
    );
});