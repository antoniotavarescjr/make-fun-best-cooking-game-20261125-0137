# Screenshots — Bistrô das 3:33

As capturas reais são feitas no navegador (Chrome desktop, 1280×720) a
partir dos estados determinísticos de `game/src/shots.js`, com as queries
de `shots.json`. A mesma query sempre pinta o mesmo frame: os estados são
construídos com as regras reais do jogo (pedidos de `orders.js`, prato de
`cooking.js`), sem input e sem tempo real.

Nota: este manifesto fica na raiz do repo, e NÃO dentro de
`screenshots/` — o `buildDossier` só aceita arquivos PNG/JPEG ali, e
qualquer outro arquivo quebra o `main.ts`. As imagens reais vão para
`screenshots/` depois, capturadas no navegador (ver "Como capturar").

## 01-cover.png — `?shot=cover&seed=7`

O rush completo das 3:33, com os 6 elementos do critério 1 ao mesmo tempo:
cozinha noturna roxa/verde; quadro com 3 pedidos de monstros diferentes
(Conde Mordisca — Espaguete de Intestino, paciência quase no fim e
"SEM ALHO!"; Zé Múmia — Suco de Sangue; Dona Aranha — Bolo de Aranha,
VIP); ingredientes na despensa; prato em montagem no centro (macarrão +
molho de sangue, faltando o olho); timer grande do turno com o relógio
marcando 3:33; e um Suco de Sangue pronto na entrega, brilhando com
"PRONTO! SIRVA!" — pedido pelo Zé Múmia no quadro. Combo ×3 e 1.250 pontos no HUD.

## 02-assembly.png — `?shot=assembly&seed=3`

A montagem de um prato complexo: o Espaguete de Intestino com 2 de 3
ingredientes no prato e o olho sendo picado na tábua (barra de progresso
visível), com o segundo pedido (Bolha, o Lodo — Cérebro na Chapa) ao
fundo no quadro. Prova a mecânica central: picar → montar → servir.

## 03-serve.png — `?shot=serve&seed=5`

O momento da entrega: o Suco de Sangue pronto na entrega, o chef ao lado
do balcão, o monstro feliz e o "+250 ★★★" flutuando na tela com o combo
×3. Timer e quadro ainda visíveis: a recompensa imediata de servir certo
e rápido.

## 04-rush-333.png — `?shot=rush-333&seed=9`

O instante da transformação: o banner "3:33 — OS MONSTROS CHEGARAM!",
a cozinha já virada para a paleta noturna roxa/verde (o estado é
congelado, sem o piscar da animação ao vivo), 3 pedidos
simultâneos com timers em vermelho (o pedido VIP do Conde com 8s) e a
fila de monstros entrando. A cozinha continua completa e legível atrás
do banner: pressão que cresce, sem esconder o jogo.

## Como capturar

```sh
node serve.ts
# abrir no Chrome 1280×720, uma query por vez, e capturar a janela:
#   http://localhost:8080/?shot=cover&seed=7
#   http://localhost:8080/?shot=assembly&seed=3
#   http://localhost:8080/?shot=serve&seed=5
#   http://localhost:8080/?shot=rush-333&seed=9
```

Salvar como PNG/JPEG ≤ 256 KiB, lado longo ≤ 1280 px, lado curto ≥ 480 px,
sem nenhuma edição depois da captura.
