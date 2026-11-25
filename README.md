# Bistrô das 3:33 — Make the best cooking game

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/antoniotavarescjr/make-fun-best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/antoniotavarescjr/make-fun-best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

De dia, um restaurante normal. Às **3:33** da madrugada a luz pisca, a
paleta vira roxo e verde tóxico, e os monstros chegam com fome — e com
pedidos muito esquisitos: **Espaguete de Intestino, Suco de Sangue,
Sanduíche de Dedo, Bolo de Aranha**. Cozinhe em 8-bit, monte o prato
antes que a paciência do monstro acabe e sirva para pontuar.

Tem ainda o **Zé Festeiro**, um humano pós-festa que aparece de noite
achando que os monstros são fantasia e a comida é de mentira; a
**Dona Sumida**, fantasma cujo pedido some aos poucos no quadro; e o
**Zé Múmia**, que come até o prato errado — por metade dos pontos.
Pedidos **VIP** pagam o dobro, como promete o ticket.

A ousadia desta versão: a virada das 3:33 é um evento
dramático no meio do turno; o **Livro de Receitas Amaldiçoado** deixa
você pôr Pimenta do Além no prato — dobra a gorjeta se estiver certo,
queima o pedido se estiver errado; e o combo de serviços certos fica
visível o tempo todo. Cada monstro tem gosto e birra próprios: o Conde
Mordisca exige **SEM ALHO!** e paga o dobro pelo Suco de Sangue.

## Como jogar

Leia o pedido no quadro, pegue o ingrediente na **despensa**, **pique**
na tábua ou **cozinhe** no fogão, **monte** no prato e **sirva** na
entrega antes do timer acabar. Errar o ingrediente não trava o jogo:
tire-o do prato e tente de novo — mas o combo quebra.

- **WASD / setas** andam · **E** ou **clique** usa a bancada
- **1–3** escolhe o pedido · **Q / T** troca o ingrediente da despensa
- **B** põe Pimenta do Além no prato · **P** pausa · **M** som · **R** recomeça

## Run it

```sh
node serve.ts
```

Depois abra http://localhost:8080 no Chrome desktop. Sem build, sem rede,
sem dependências: só arquivos estáticos em `game/`.

Para empacotar a entrada:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Screenshots

As 4 capturas são estados determinísticos do próprio jogo
(`game/src/shots.js`), listadas em `shots.json` e descritas em
`SHOTS.md` (na raiz do repo): `01-cover.png` (rush completo das 3:33),
`02-assembly.png` (montagem de prato complexo),
`03-serve.png` (entrega com pontos e combo) e
`04-rush-333.png` (o instante da transformação).

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
