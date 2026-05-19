//level of the game :easy,medium to hard
const config = {
  easy: { pairs: 3, time: 90 },
  medium: { pairs: 4, time: 60 },
  hard: { pairs: 5, time: 45 },
};
//waiting page fully load
document.addEventListener("DOMContentLoaded", () => {
  //grab all the elements
  const grid = document.getElementById("game_grid");
  const clicksEl = document.getElementById("clicks");
  const matchedEl = document.getElementById("matched");
  const totalEl = document.getElementById("total");
  const timeEl = document.getElementById("time");
  const leftNumEl = document.getElementById("leftNum");
  const diffEl = document.getElementById("diff");
  const themeBtn = document.getElementById("themeBtn"); //dark mode
  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");
  const powerBtn = document.getElementById("powerBtn");
  const modal = document.getElementById("modal"); //pop up
  const msgEl = document.getElementById("msg"); //text on pop up
  const closeModal = document.getElementById("closeModal"); //close pop up

  // all the variable needed in the game
  let cards = [],
    flipped = [],
    matched = [],
    clicks = 0,
    time = 60,
    timer;
  let gameOn = false;
  let totalPair = 0;

  //backgound image
  const backImg = "back.webp";
  function randomBack() {
    return backImg;
  }

  //light and dark mode
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      themeBtn.textContent = document.documentElement.classList.contains("dark")
        ? "Light Mode"
        : "Dark Mode";
    });
  }
  //close modal format
  if (closeModal) {
    closeModal.addEventListener("click", () => modal.classList.add("hidden"));
  }
  //get all the front image and mactch the name and img from api
  async function getPokemons(n) {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1500");
    const data = await res.json();
    const all = data.results;
    let selected = [];
    while (selected.length < n) {
      const rnd = all[Math.floor(Math.random() * all.length)];
      if (!selected.find((p) => p.name === rnd.name)) selected.push(rnd);
    }
    const withImg = [];
    for (let p of selected) {
      const d = await fetch(p.url).then((r) => r.json());
      const img = d.sprites?.other?.["official-artwork"]?.front_default || "";
      withImg.push({ name: p.name, img });
    }
    return withImg;
  }
  //randomly get new cards
  function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }
  //crate new card
  async function buildGrid() {
    const d = diffEl.value; //difficult level
    const { pairs } = config[d]; //how many pairs you need for win
    totalPairs = pairs;
    const pokes = await getPokemons(pairs);
    const deck = [...pokes, ...pokes];
    cards = shuffle(deck);
    grid.innerHTML = "";
    //all the card need to in the loop
    cards.forEach((poke, i) => {
      const card = document.createElement("div"); //create a card
      card.className = "card";
      card.dataset.id = i; // give the card a number
      //image with both front and back face
      card.innerHTML = `
      <img id="img${i}" class="front_face" src="${poke.img}" alt="">
      <img class="back_face" src="${randomBack()}" alt="">
    `;

      card.addEventListener("click", () => flipCard(card, i));
      grid.appendChild(card);
    });
    totalEl.textContent = pairs;
    matchedEl.textContent = 0;
    leftNumEl.textContent = pairs;
  }
  // flip function
  function flipCard(card, i) {
    if (!gameOn) return;
    if (flipped.length >= 2) return;
    if (card.classList.contains("flip") || matched.includes(i)) return;

    card.classList.add("flip");
    flipped.push({ el: card, idx: i });
    clicks++;
    clicksEl.textContent = clicks;

    if (flipped.length === 2) checkMatch();
  }
  // match function if the name is same or not, if not flipped back one second later
  function checkMatch() {
    const [a, b] = flipped;
    const same = cards[a.idx].name === cards[b.idx].name;

    if (same) {
      matched.push(a.idx, b.idx);
      let nowMatched = matched.length / 2;
      leftNumEl.textContent = totalPairs - matched.length / 2;

      flipped = [];
      if (matched.length === cards.length) win();
    } else {
      setTimeout(() => {
        a.el.classList.remove("flip");
        b.el.classList.remove("flip");
        flipped = [];
      }, 1000);
    }
  }

  async function startGame() {
    resetGame();
    await buildGrid();
    const d = diffEl.value;
    time = config[d].time;
    timeEl.textContent = time;
    gameOn = true;
    timer = setInterval(() => {
      time--;
      timeEl.textContent = time;
      if (time <= 0) lose();
    }, 600);
  }

  function resetGame() {
    clearInterval(timer);
    gameOn = false;
    flipped = [];
    matched = [];
    clicks = 0;
    clicksEl.textContent = 0;
    timeEl.textContent = 0;

    if (grid) grid.innerHTML = "";
    if (leftNumEl) leftNumEl.textContent = 0;
  }

  function win() {
    clearInterval(timer);
    gameOn = false;
    msgEl.textContent = "You Win!";
    modal.classList.remove("hidden");
  }

  function lose() {
    clearInterval(timer);
    gameOn = false;
    msgEl.textContent = "Game Over!";
    modal.classList.remove("hidden");
  }
  //power up
  if (powerBtn) {
    powerBtn.addEventListener("click", () => {
      if (!gameOn) return;
      document
        .querySelectorAll(".card")
        .forEach((c) => c.classList.add("flip"));
      setTimeout(() => {
        document.querySelectorAll(".card").forEach((c) => {
          if (!matched.includes(+c.dataset.id)) c.classList.remove("flip");
        });
      }, 2000);
    });
  }

  if (startBtn) startBtn.addEventListener("click", startGame);
  if (resetBtn) resetBtn.addEventListener("click", resetGame);
});
