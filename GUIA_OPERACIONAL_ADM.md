# Guia de Operação e Logística — AngoExpress v2.0
Este manual detalhado destina-se ao **Administrador Principal (ADM)** da plataforma AngoExpress. Ele descreve o funcionamento operacional da ponte logística de importação Shein & AliExpress para Angola, como gerir os fluxos financeiros, como atualizar o estado de rastreamento das encomendas, e as alternativas para publicar o site na internet.

---

## 1. O Modelo de Negócio da AngoExpress

A **AngoExpress** resolve duas dores fundamentais para os consumidores em Angola:
1. **Acesso Cambial:** A ausência de cartões de débito/crédito Visa, Mastercard ou PayPal internacionais e a dificuldade em obter moeda estrangeira (Dólares/Euros).
2. **Logística de Consolidação:** A falta de endereços físicos para consolidação de mercadoria na China e a burocracia aduaneira para envios individuais de pequenas mercadorias.

### Como funciona para o cliente:
- O cliente navega pelo site da AngoExpress e visualiza produtos importados prontos ou envia links diretos da Shein/AliExpress para obter uma cotação sob medida.
- Os preços no site já estão convertidos em **Kwanzas Angolanos (AOA)**, com uma margem comercial que embutirá o custo do serviço cambial, processamento de pedido e peso estimado de envio internacional.
- O cliente finaliza a encomenda no site, faz uma **transferência bancária ou depósito em Kwanzas (AOA)** para o IBAN angolano oficial da AngoExpress, e submete o comprovativo de pagamento.

---

## 2. Fluxo Completo de Estados de um Pedido

O ciclo de vida de uma encomenda internacional no painel da AngoExpress progride através das seguintes etapas:

```
[Pagamento Pendente] ➔ [Pagamento Confirmado] ➔ [Compra Realizada] ➔ [Em Preparação]
                                                                        │
[Em Distribuição] ◀ [Chegou em Angola] ◀ [Em Trânsito] ◀ [Enviado pelo Fornecedor]
       │
[Entregue com Sucesso] 🏁
```

### Detalhe das Fases:
1. **Pagamento Pendente (`pending`):** O cliente submeteu o pedido mas o administrador ainda não validou a receção do dinheiro em conta corrente bancária.
2. **Pagamento Confirmado (`confirmed`):** O ADM validou a receção dos Kwanzas. O capital está libertado para que a equipa de compras compre os produtos no estrangeiro.
3. **Compra Realizada (`purchased`):** O agente de compras na China adquire as peças na Shein/AliExpress em Dólares (USD) ou Yuan (RMB) e junta o lote ao armazém central.
4. **Em Preparação (`preparing`):** Os produtos são recebidos e inspecionados por controlo de qualidade no armazém da AngoExpress em **Guangzhou, China**.
5. **Enviado pelo Fornecedor (`shipped`):** Os pacotes são embalados individualmente e enviados para o porto ou aeroporto de carga internacional.
6. **Em Trânsito (`transit`):** O lote de carga aérea partiu de Guangzhou com destino a Luanda (LAD).
7. **Chegou em Angola (`arrived_angola`):** A mercadoria chegou ao terminal aduaneiro do Aeroporto de Luanda e inicia o desalfandegamento em grupo.
8. **Em Distribuição (`distribution`):** Os artigos foram desalfandegados e estão prontos para entrega direta ao domicílio ou disponíveis para levantamento presencial no escritório central de Luanda.
9. **Entregue (`delivered`):** O pacote foi entregue com sucesso e o cliente assinou a receção.

---

## 3. Gestão de Rastreamento Real e Linha Temporal (Tracking)

Para diminuir as chamadas de apoio ao cliente e aumentar a confiança na marca, implementámos um **Sistema de Checkpoints Visuais de Rastreamento Real**.

### Como atualizar o percurso de um pacote:
1. Vá até ao **Painel de Administração**.
2. Clique no separador **Gerir Pedidos**.
3. Selecione o botão **Editar Estado / Tracking** no pedido desejado.
4. No formulário lateral, role até à secção **Linha Temporal de Rastreamento Real**.
5. Pode selecionar um estado predefinido (como *Em Armazém*, *Trânsito Internacional*, *Alfândega de Luanda*, etc.) para carregar automaticamente a localização e a descrição base, ou redigir o seu próprio checkpoint detalhado.
6. Clique no botão **+ Adicionar Checkpoint à Lista**.
7. **Importante:** Os checkpoints criados são guardados na lista provisória do formulário. Deve clicar no botão vermelho **Atualizar Estado e Tracking** no fim do formulário para persistir permanentemente no arquivo do servidor (`db.json`).

*Nota Inteligente:* Se nenhum checkpoint real for adicionado pelo ADM para um novo pedido, o site calculará uma estimativa realista baseada no estado do pedido (ex: mostrando "Pedido Registado", "Pagamento Verificado", etc.) garantindo que o cliente sempre acompanhe o percurso do seu dinheiro.

---

## 4. Configuração de Catálogo, Preços e Cupões

### Precificação e Taxas de Câmbio:
- O banco de dados opera com preços padrão em Dólares (USD) e converte-os automaticamente em Kwanzas (AOA) para o cliente no site.
- A taxa de câmbio oficial embutida é de **1170 AOA / USD**.
- Ao adicionar produtos novos ao catálogo, preencha o valor base em Dólares (USD). O site calculará automaticamente o equivalente em Kwanzas para apresentação no site.

### Cupões de Desconto:
Pode criar cupões estratégicos no separador **Cupões Desconto**:
- **Percentagem (Percentage):** Ex: "ANGOPROMO" de 10% de desconto.
- **Valor Fixo (Fixed):** Ex: Cupão de 5.000 AOA de desconto para compras acima de 30.000 AOA.

---

## 5. Como Publicar o Site na Web (Guia de Deploy)

Para colocar a AngoExpress no ar para toda a internet, tem três métodos populares recomendados:

### Opção A: Render.com (Recomendado para Full-Stack Express)
Como a nossa plataforma armazena dados de forma simples em ficheiros JSON locais (`db.json`), a forma mais fácil e estável de hospedar o front-end e o back-end de graça ou a baixo custo é através do **Render.com**:
1. Faça o download do ZIP do projeto ou exporte-o para o seu **GitHub** a partir do menu do AI Studio.
2. Crie uma conta em [Render.com](https://render.com).
3. Crie um novo **Web Service** e ligue o seu repositório GitHub.
4. Introduza as seguintes configurações de Build:
   - **Environment:** Node
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start`
5. Vá ao painel de configurações do Web Service no Render, escolha **Disks** e monte um **Persistent Disk** montado na pasta onde se encontra o ficheiro `data/` ou raiz para garantir que o seu arquivo `db.json` de encomendas e catálogo nunca se perca durante os reinícios do servidor.

### Opção B: Vercel ou Netlify (Apenas Front-end)
Se preferir que a aplicação funcione de forma puramente cliente, pode hospedar o código do repositório de forma 100% gratuita na [Vercel](https://vercel.com) ou [Netlify](https://netlify.com). O instalador automático detetará o Vite e disponibilizará o site estático em segundos.

### Opção C: Servidor VPS Próprio (Docker)
Para total independência tecnológica, contrate uma VPS económica (ex: Contabo ou DigitalOcean), instale o Docker e configure um servidor nginx proxy para redirecionar os utilizadores para a porta `3000` da aplicação em execução.

---

*Manual elaborado pela equipa de desenvolvimento do Google AI Studio.*
