/**
 * CLAUDIO SCHMIDT - ENGINE DE MENSAGERIA ASSÍNCRONA
 * Stack: Vanilla JS + Fetch API + EmailJS
 * Status: Configurado com Chaves de Produção
 */

const iniciarSistemaContato = () => {
    const formulario = document.querySelector('.form-contato');
    
    // --- SUAS CHAVES DE PRODUÇÃO ---
    const SERVICE_ID = 'service_ta41efk'; 
    const TEMPLATE_ID = 'template_pjtvit8';
    const PUBLIC_KEY = '0PNRfkyUiO8owcrK8';

    if (!formulario) return;

    formulario.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        const botao = formulario.querySelector('.btn-enviar-projeto');
        const textoOriginal = botao.innerHTML;

        // 1. FEEDBACK VISUAL: ESTADO DE CARREGAMENTO
        botao.disabled = true;
        botao.innerHTML = 'ENVIANDO PROPOSTA... ⏳';
        botao.style.pointerEvents = 'none';

        // 2. COLETA DINÂMICA DE DADOS
        const dadosForm = new FormData(formulario);
        
        // IMPORTANTE: Verifique se no seu Template do EmailJS você usou {{nome}}, {{email}}, etc.
        const payload = {
            service_id: SERVICE_ID,
            template_id: TEMPLATE_ID,
            user_id: PUBLIC_KEY,
            template_params: {
                'nome': dadosForm.get('nome'),
                'email': dadosForm.get('email'),
                'servico': dadosForm.get('servico'),
                'mensagem': dadosForm.get('mensagem')
            }
        };

        try {
            // 3. DISPARO VIA FETCH API (COMUNICAÇÃO DIRETA COM O SERVIDOR)
            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // SUCESSO: E-mail disparado com êxito!
                botao.innerHTML = 'PROPOSTA ENVIADA! ✅';
                botao.style.background = '#28a745'; // Verde de Sucesso
                formulario.reset(); // Limpa os campos para o próximo contato

                // Reseta o botão após 5 segundos para novas interações
                setTimeout(() => {
                    restaurarBotao(botao, textoOriginal);
                }, 5000);

            } else {
                throw new Error('Falha na resposta da API');
            }

        } catch (erro) {
            // TRATAMENTO DE ERRO: Caso a internet caia ou a chave falhe
            console.error('Falha técnica no envio:', erro);
            botao.innerHTML = 'ERRO NO ENVIO ❌';
            botao.style.background = '#dc3545'; // Vermelho de Alerta

            setTimeout(() => {
                restaurarBotao(botao, textoOriginal);
            }, 3000);
        }
    });
};

/**
 * FUNÇÃO AUXILIAR: Retorna o botão ao estado visual original (Neon)
 */
const restaurarBotao = (btn, texto) => {
    btn.disabled = false;
    btn.innerHTML = texto;
    btn.style.background = ''; // Remove o override e volta para o CSS original
    btn.style.pointerEvents = 'auto';
};

// INICIALIZAÇÃO QUANDO O DOM ESTIVER PRONTO
document.addEventListener('DOMContentLoaded', iniciarSistemaContato);