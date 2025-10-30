document.addEventListener('DOMContentLoaded', () => {
    
    fetch('cabecalho.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao carregar cabecalho.html: ' + response.status);
            }
            return response.text();
        })
        .then(data => {
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = data;
            }

            const nomeCompleto = localStorage.getItem('nomeUsuario');
            const roleUsuario = localStorage.getItem('roleUsuario');
            
            const elementoLogo = document.querySelector('.logo'); 
            const linkCadastro = document.getElementById('link-cadastro');
            const linkUsuarios = document.getElementById('link-usuarios');

            if (elementoLogo && nomeCompleto) {
                const primeiroNome = nomeCompleto.split(' ')[0];
                elementoLogo.textContent = 'Bem vindo, ' + primeiroNome;
            } else if (elementoLogo) {
                elementoLogo.textContent = 'Bem vindo';
            }

            if (roleUsuario === 'aluno') {
                if (linkCadastro) {
                    linkCadastro.style.display = 'none';
                }
                if (linkUsuarios) {
                    linkUsuarios.style.display = 'none';
                }
            }
            
        })
        .catch(error => console.error('Erro ao processar o cabeçalho:', error));

});
